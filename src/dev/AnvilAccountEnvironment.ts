import type { Address, Hex, PrivateKeyAccount } from "viem";
import {
  erc20Abi,
  erc4626Abi,
  isAddress,
  isAddressEqual,
  parseEther,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ierc20Abi } from "../abi/iERC20.js";
import type {
  ChainId,
  RWAOperationArgs,
  SecuritizeRegisterMessage,
} from "../model/index.js";
import type {
  Asset,
  CreditSuite,
  ILogger,
  IPoolContract,
  MultiCall,
  OnchainSDK,
  RawTx,
} from "../onchain/index.js";
import {
  ADDRESS_0X0,
  AddressSet,
  childLogger,
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  SDKConstruct,
} from "../onchain/index.js";
import type { GearboxSDK } from "../sdk/index.js";
import {
  AnvilAccountFunding,
  COLLATERAL_BUFFER_DENOMINATOR,
  COLLATERAL_BUFFER_NUMERATOR,
  type FundingRequirement,
  POOL_TARGET_UTILIZATION_BP,
  scaleUp,
} from "./AnvilAccountFunding.js";
import {
  AnvilAccountKyc,
  type KycAccessOptions,
  type KycTarget,
} from "./AnvilAccountKyc.js";
import { iDegenNftv2Abi } from "./abi.js";
import {
  type AnvilClient,
  extendAnvilClient,
  withImpersonation,
} from "./createAnvilClient.js";
import {
  type ConfirmedTransaction,
  sendAndConfirm,
  TransactionRevertedError,
  writeAndConfirm,
} from "./sendAndConfirm.js";
import { makePendingWithdrawalsClaimable } from "./withdrawalUtils.js";

const MIDAS_ACL_ADMIN: Address = "0xd4195CF4df289a4748C1A7B6dDBE770e27bA1227";

export interface AnvilAccountEnvironmentOptions {
  faucet?: Address;
  borrowerKey?: Hex;
  depositorKey?: Hex;
  allowMint?: boolean;
  securitizeAdminKey?: Hex;
  securitizeAdmin?: Address;
  midasAdmin?: Address;
}

export interface AnvilAccountTarget extends KycTarget {
  collateral: Asset;
}

export interface AnvilOpenedAccountTarget {
  creditAccount?: Address;
  directTransfer?: Address[];
}

export type PoolDepositResult = {
  pool: Address;
  token: Address;
  amount: bigint;
} & (
  | { success: true; txHash: Hex }
  | { success: false; error: Error; txHash?: Hex }
);

/**
 * Anvil-only mutations needed to run an account through its whole lifecycle on
 * a fork: funding, approvals, fake KYC, opening and withdrawing. Protocol
 * preparation and transaction construction stay in GearboxSDK.
 *
 * The focused implementations live in {@link AnvilAccountFunding} and
 * {@link AnvilAccountKyc}; this class is the convenience facade over them.
 */
export class AnvilAccountEnvironment extends SDKConstruct {
  public readonly borrowerKey: Hex;
  public readonly depositorKey: Hex;
  public readonly allowMint: boolean;
  public readonly anvil: AnvilClient;

  readonly #funding: AnvilAccountFunding;
  readonly #kyc: AnvilAccountKyc;
  #logger?: ILogger;
  #borrower?: PrivateKeyAccount;
  #depositor?: PrivateKeyAccount;

  /**
   * Builds the fork environment from a public GearboxSDK instance. The application
   * can stay on the opportunities/positions facade while this Anvil-only
   * helper owns access to the underlying chain client.
   */
  public static fromGearbox(
    gearbox: GearboxSDK<"onchain" | "both">,
    options: AnvilAccountEnvironmentOptions & { chainId?: ChainId } = {},
  ): AnvilAccountEnvironment {
    const { chainId, ...environmentOptions } = options;
    if (chainId !== undefined) {
      return new AnvilAccountEnvironment(
        gearbox.onchain.chain(chainId),
        environmentOptions,
      );
    }
    const chains = [...gearbox.onchain.chains.values()];
    if (chains.length !== 1) {
      throw new Error(
        `AnvilAccountEnvironment requires chainId when GearboxSDK covers ${chains.length} chains`,
      );
    }
    return new AnvilAccountEnvironment(chains[0], environmentOptions);
  }

  constructor(sdk: OnchainSDK, options: AnvilAccountEnvironmentOptions = {}) {
    super(sdk);
    this.#logger = childLogger("AnvilAccountEnvironment", sdk.logger);
    this.anvil = extendAnvilClient(sdk.client);
    this.borrowerKey = options.borrowerKey ?? generatePrivateKey();
    this.depositorKey = options.depositorKey ?? generatePrivateKey();
    this.allowMint = options.allowMint ?? false;
    this.#funding = new AnvilAccountFunding(sdk, this.anvil, {
      allowMint: this.allowMint,
      faucet: options.faucet,
      logger: this.#logger,
    });
    this.#kyc = new AnvilAccountKyc(sdk, this.anvil, {
      midasAdmin: options.midasAdmin ?? MIDAS_ACL_ADMIN,
      securitizeAdminKey: options.securitizeAdminKey,
      securitizeAdmin: options.securitizeAdmin,
      logger: this.#logger,
    });
    this.#logger?.info(
      {
        borrower: privateKeyToAccount(this.borrowerKey).address,
        depositor: privateKeyToAccount(this.depositorKey).address,
        faucet: options.faucet,
        allowMint: this.allowMint,
      },
      "account environment options",
    );
  }

  public get borrower(): PrivateKeyAccount {
    if (!this.#borrower) {
      throw new Error("borrower is available only after getBorrower()");
    }
    return this.#borrower;
  }

  public get depositor(): PrivateKeyAccount {
    if (!this.#depositor) {
      throw new Error("depositor is available only after getDepositor()");
    }
    return this.#depositor;
  }

  public get faucet(): Address {
    return this.#funding.faucet;
  }

  public async getBorrower(): Promise<PrivateKeyAccount> {
    if (!this.#borrower) {
      this.#borrower = await this.#createAccount(this.borrowerKey);
      this.#logger?.info(`created borrower ${this.#borrower.address}`);
    }
    return this.#borrower;
  }

  public async getDepositor(): Promise<PrivateKeyAccount> {
    if (!this.#depositor) {
      this.#depositor = await this.#createAccount(this.depositorKey);
      this.#logger?.info(`created depositor ${this.#depositor.address}`);
    }
    return this.#depositor;
  }

  /**
   * Guarantees that `account` holds at least `minimum` of `token`, minting the
   * missing amount when enabled and throwing a contextual error otherwise.
   */
  public async ensureTokenBalance(
    account: Address,
    token: Address,
    minimum: bigint,
  ): Promise<bigint> {
    return this.#funding.ensureTokenBalance(account, token, minimum);
  }

  public async topUpPools(
    deposits: [IPoolContract | Address, bigint][],
  ): Promise<PoolDepositResult[]> {
    if (deposits.length === 0) return [];
    const resolvedDeposits: [IPoolContract, bigint][] = deposits.map(
      ([pool, amount]) => [this.#pool(pool), amount],
    );
    const depositor = await this.getDepositor();
    let collateral: Asset[];
    try {
      collateral = await Promise.all(
        resolvedDeposits.map(async ([pool, amount]) => {
          const token = this.sdk.tokensMeta.unwrapRWA(pool.underlying);
          // RWA pools accept the backing asset through a zapper, not wrapper tokens.
          const balance = isAddressEqual(token, pool.underlying)
            ? amount
            : await this.anvil.readContract({
                address: pool.underlying,
                abi: erc4626Abi,
                functionName: "previewMint",
                args: [amount],
              });
          return { token, balance };
        }),
      );
      const requirements = collateral.map(({ token, balance }) => ({
        token,
        minimum: balance,
        target: scaleUp(balance, PERCENTAGE_FACTOR, POOL_TARGET_UTILIZATION_BP),
      }));
      await this.#funding.fund(depositor, "depositor", requirements);
    } catch (error) {
      // keep the discriminated per-pool shape instead of aborting the batch
      const failure = new Error("failed to fund the pool depositor", {
        cause: error,
      });
      this.#logger?.error(failure);
      return resolvedDeposits.map(([pool, amount]) => ({
        pool: pool.address,
        token: pool.underlying,
        amount,
        success: false,
        error: failure,
      }));
    }

    const results: PoolDepositResult[] = [];
    for (const [index, [pool, amount]] of resolvedDeposits.entries()) {
      results.push(
        await this.#depositToPool(pool, depositor, amount, collateral[index]),
      );
    }
    return results;
  }

  /**
   * Funds the borrower with the collateral of every target and mints the
   * non-KYC degen NFTs their credit facades require.
   */
  public async prepareBorrower(
    targets: AnvilAccountTarget[],
  ): Promise<PrivateKeyAccount> {
    const borrower = await this.getBorrower();
    const degenNfts: Record<Address, number> = {};
    const requirements: FundingRequirement[] = [];
    for (const target of targets) {
      const cm = this.sdk.marketRegister.findCreditManager(
        target.creditManager,
      );
      const { degenNFT } = cm.creditFacade;
      requirements.push({
        token: target.collateral.token,
        minimum: target.collateral.balance,
        target: scaleUp(
          target.collateral.balance,
          COLLATERAL_BUFFER_NUMERATOR,
          COLLATERAL_BUFFER_DENOMINATOR,
        ),
      });
      if (
        isAddress(degenNFT) &&
        degenNFT !== ADDRESS_0X0 &&
        !(await this.#kyc.loadKycGate(cm))
      ) {
        degenNfts[degenNFT] = (degenNfts[degenNFT] ?? 0) + 1;
      }
    }

    await this.#funding.fund(borrower, "borrower", requirements);
    for (const [degenNft, amount] of Object.entries(degenNfts)) {
      await this.#mintDegenNft(degenNft as Address, borrower.address, amount);
    }
    this.#logger?.debug("prepared borrower");
    return borrower;
  }

  /**
   * Lets the credit manager spend the borrower's token. Throws when the
   * approval cannot be sent or reverts: opening would fail later anyway.
   */
  public async approve(
    token: Address,
    creditManager: CreditSuite | Address,
  ): Promise<void> {
    const cm = this.#creditSuite(creditManager);
    const borrower = await this.getBorrower();
    const symbol = this.sdk.tokensMeta.symbol(token);
    try {
      const spender = await this.sdk.accounts.getApprovalAddress({
        creditManager: cm.creditManager.address,
        borrower: borrower.address,
      });
      if (symbol === "USDT") {
        await writeAndConfirm(this.anvil, `${symbol} allowance reset`, {
          account: borrower,
          address: token,
          abi: ierc20Abi,
          functionName: "approve",
          args: [spender, 0n],
          chain: this.anvil.chain,
        });
      }
      const { hash } = await writeAndConfirm(
        this.anvil,
        `${symbol} approval for ${this.labelAddress(spender)}`,
        {
          account: borrower,
          address: token,
          abi: ierc20Abi,
          functionName: "approve",
          args: [spender, MAX_UINT256],
          chain: this.anvil.chain,
        },
      );
      this.#logger?.debug(
        `allowed ${this.labelAddress(spender)} (credit manager ${cm.creditManager.name}) to spend ${symbol} (${token}), tx: ${hash}`,
      );
    } catch (error) {
      throw new Error(
        `failed to allow credit manager ${cm.creditManager.name} to spend ${symbol} (${token})`,
        { cause: error },
      );
    }
  }

  /**
   * Opens KYC access for the borrower on every target. See
   * {@link AnvilAccountKyc.grantKycAccess} for what stays on the fork.
   */
  public async grantKycAccess(
    targets: KycTarget[],
    options?: KycAccessOptions,
  ): Promise<void> {
    const borrower = await this.getBorrower();
    await this.#kyc.grantKycAccess(borrower.address, targets, options);
  }

  /**
   * Securitize registration arguments for `accounts.openCA`, signed by the
   * borrower; `undefined` for markets that need none.
   */
  public async openRwaOptions(
    creditManager: CreditSuite | Address,
    target: Address,
  ): Promise<RWAOperationArgs | undefined> {
    const cm = this.#creditSuite(creditManager);
    const borrower = await this.getBorrower();
    const requirements = await this.sdk.accounts.getOpenAccountRequirements(
      borrower.address,
      cm.creditManager.address,
      { tokenOutAddress: target },
    );
    if (requirements?.protocol !== "securitize") return undefined;
    return {
      protocol: "securitize",
      tokensToRegister: requirements.tokensToRegister,
      signaturesToCache: await Promise.all(
        requirements.requiredSignatures.map(async message => ({
          token: message.message.token,
          signature: {
            deadline: message.message.deadline,
            signature: await borrower.signTypedData(message),
          },
        })),
      ),
    };
  }

  public async signRwaRequirements(
    creditManager: CreditSuite | Address,
    target: Address,
  ): Promise<SecuritizeRegisterMessage[] | undefined> {
    return (await this.openRwaOptions(creditManager, target))
      ?.signaturesToCache;
  }

  public async decorateOpenCalls(
    creditManager: CreditSuite | Address,
    calls: MultiCall[],
  ): Promise<MultiCall[]> {
    const cm = this.#creditSuite(creditManager);
    const openingCalls = await cm.openingCalls();
    // Strategy preparation already includes these; legacy opening paths may not.
    const missing = openingCalls.filter(
      opening =>
        !calls.some(
          call =>
            isAddressEqual(call.target, opening.target) &&
            call.callData === opening.callData,
        ),
    );
    return [...missing, ...calls];
  }

  public async distributeTokens(
    targets: AnvilOpenedAccountTarget[],
  ): Promise<void> {
    const tokens = new AddressSet(
      targets.flatMap(target => target.directTransfer ?? []),
    );
    if (tokens.size === 0) return;

    const distributor = await this.#createAccount(generatePrivateKey());
    await this.#funding.claim(distributor, "reward token distributor");
    const balances = await this.anvil.multicall({
      contracts: tokens.map(
        token =>
          ({
            address: token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [distributor.address],
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    for (const [index, token] of tokens.asArray().entries()) {
      const recipients = targets.flatMap(target =>
        target.creditAccount && new AddressSet(target.directTransfer).has(token)
          ? [target.creditAccount]
          : [],
      );
      if (recipients.length === 0) continue;
      const share = balances[index] / BigInt(recipients.length);
      for (const creditAccount of recipients) {
        await writeAndConfirm(
          this.anvil,
          `direct transfer of ${this.labelAddress(token)} to ${creditAccount}`,
          {
            account: distributor,
            address: token,
            abi: erc20Abi,
            functionName: "transfer",
            args: [creditAccount, share],
            chain: this.anvil.chain,
          },
        );
      }
    }
  }

  /**
   * Broadcasts an SDK-built transaction and throws a contextual
   * {@link TransactionRevertedError} (carrying the hash) when it reverted.
   */
  public async sendAndConfirm(
    tx: RawTx,
    account: PrivateKeyAccount,
    operation: string,
  ): Promise<ConfirmedTransaction> {
    return sendAndConfirm(this.anvil, { tx, account, operation });
  }

  /**
   * Refreshes the SDK snapshot after environment mutations on the fork.
   *
   * @returns `true` when a newer snapshot was loaded. `false` means the state
   * was already up to date, not that the sync failed - failures throw.
   */
  public async sync(): Promise<boolean> {
    return this.sdk.syncState();
  }

  /** Fulfills every pending redemption of a credit account on the fork. */
  public async makeWithdrawalsClaimable(creditAccount: Address): Promise<void> {
    await makePendingWithdrawalsClaimable(this.anvil, creditAccount, {
      logger: this.#logger,
    });
  }

  #creditSuite(creditManager: CreditSuite | Address): CreditSuite {
    return typeof creditManager === "string"
      ? this.sdk.marketRegister.findCreditManager(creditManager)
      : creditManager;
  }

  #pool(pool: IPoolContract | Address): IPoolContract {
    return typeof pool === "string"
      ? this.sdk.marketRegister.findByPool(pool).pool.pool
      : pool;
  }

  async #depositToPool(
    pool: IPoolContract,
    depositor: PrivateKeyAccount,
    amount: bigint,
    collateral: Asset,
  ): Promise<PoolDepositResult> {
    const { underlying, address } = pool;
    const { token: tokenIn, balance: depositAmount } = collateral;
    const poolName = this.sdk.labelAddress(address);
    const poolData = { pool: address, token: underlying, amount };
    let txHash: Hex | undefined;
    try {
      const formatted = this.sdk.tokensMeta.formatBN(tokenIn, depositAmount, {
        symbol: true,
      });
      const tokensOut = this.sdk.pools.getDepositTokensOut(address, tokenIn);
      if (tokensOut.length === 0) {
        throw new Error(`no tokens out found for pool ${poolName}`);
      }
      const metadata = this.sdk.pools.getDepositMetadata(
        address,
        tokenIn,
        tokensOut[0],
      );
      // Built on the pool service rather than `opportunities.prepare.deposit`:
      // a fork top-up must also reach pools the app no longer offers deposits
      // for (sunset pools), which that preparation refuses.
      const deposit = this.sdk.pools.addLiquidity({
        collateral: { token: tokenIn, balance: depositAmount },
        pool: address,
        wallet: depositor.address,
        meta: metadata,
      });
      if (!deposit) {
        throw new Error(`no deposit call could be created for ${poolName}`);
      }

      ({ hash: txHash } = await writeAndConfirm(
        this.anvil,
        `approval of ${formatted} for pool ${poolName}`,
        {
          account: depositor,
          address: tokenIn,
          abi: ierc20Abi,
          functionName: "approve",
          args: [metadata.approveTarget, depositAmount],
          chain: this.anvil.chain,
        },
      ));

      ({ hash: txHash } = await sendAndConfirm(this.anvil, {
        tx: deposit.tx,
        account: depositor,
        operation: `deposit of ${formatted} into pool ${poolName}`,
      }));
      this.#logger?.debug(`deposited ${formatted} into ${poolName}`);
      return { ...poolData, txHash, success: true };
    } catch (error) {
      if (error instanceof TransactionRevertedError) {
        txHash = error.hash;
      }
      this.#logger?.error(`failed to deposit to pool ${poolName}: ${error}`);
      return { ...poolData, txHash, success: false, error: error as Error };
    }
  }

  async #mintDegenNft(
    degenNft: Address,
    recipient: Address,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) return;
    try {
      const minter = await this.anvil.readContract({
        address: degenNft,
        abi: iDegenNftv2Abi,
        functionName: "minter",
      });
      await withImpersonation(this.anvil, minter, () =>
        writeAndConfirm(
          this.anvil,
          `mint of ${amount} degenNFT ${this.labelAddress(degenNft)}`,
          {
            account: minter,
            address: degenNft,
            abi: iDegenNftv2Abi,
            functionName: "mint",
            args: [recipient, BigInt(amount)],
            chain: this.anvil.chain,
          },
        ),
      );
    } catch (error) {
      throw new Error(
        `failed to mint ${amount} degenNFT ${degenNft} to borrower ${recipient}`,
        { cause: error },
      );
    }
  }

  async #createAccount(privateKey: Hex): Promise<PrivateKeyAccount> {
    const account = privateKeyToAccount(privateKey);
    await this.anvil.setBalance({
      address: account.address,
      value: parseEther("100"),
    });
    return account;
  }
}
