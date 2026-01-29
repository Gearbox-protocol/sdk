import type { Address, Hash, Hex, PrivateKeyAccount } from "viem";
import {
  BaseError,
  erc20Abi,
  isAddress,
  parseEther,
  parseEventLogs,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ierc20Abi } from "../abi/iERC20.js";
import { iCreditFacadeV300Abi, iPoolV300Abi } from "../abi/v300.js";
import type {
  Asset,
  CreditAccountData,
  CreditSuite,
  ICreditAccountsService,
  ILogger,
  PoolContract,
  RawTx,
} from "../sdk/index.js";
import {
  ADDRESS_0X0,
  AddressMap,
  AddressSet,
  childLogger,
  formatBN,
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  SDKConstruct,
  sendRawTx,
} from "../sdk/index.js";
import { iDegenNftv2Abi } from "./abi.js";
import { claimFromFaucet } from "./claimFromFaucet.js";
import { type AnvilClient, extendAnvilClient } from "./createAnvilClient.js";
import { createMinter } from "./mint/index.js";

const DIRECT_TRANSFERS_QUOTA = 10_000n;

export class OpenTxRevertedError extends BaseError {
  public readonly txHash: Hash;

  constructor(txHash: Hash) {
    super("open credit account tx reverted");
    this.txHash = txHash;
  }
}

export interface AccountOpenerOptions {
  faucet?: Address;
  borrowerKey?: Hex;
  depositorKey?: Hex;
  poolDepositMultiplier?: bigint | string | number;
  minDebtMultiplier?: bigint | string | number;
  leverageDelta?: bigint | string | number;
  allowMint?: boolean;
}

export interface TargetAccount {
  creditManager: Address;
  /**
   * Everything will be swapped into this token in the end
   */
  target: Address;
  /**
   * This token will be provided as collateral, defaults to underlying token
   * Expected to be found on borrower's address before opening the account
   * Can be claimed from faucet
   *
   * TODO: not implemented
   */
  collateral?: Address;
  /**
   * These tokens will be transferred directly from faucet to credit account
   */
  directTransfer?: Address[];
  /**
   * Leverage, without percentage (e.g. "3" for 300%)
   */
  leverage?: number;
  /**
   * Slippage with percentage (e.g. 100 = 1%)
   */
  slippage?: number;
}

interface OpenAccountPreview {
  tx: RawTx;
  /**
   * Actual leverage, with percentage factor
   */
  leverage: bigint;
  /**
   * What user adds as collateral
   */
  collateral: Asset;
  minQuota: Asset[];
  averageQuota: Asset[];
  slippage: number;
}

export interface OpenAccountHumanizedPreview {
  creditManager: string;
  target: string;
  collateral: string;
  leverage: number;
  slippage: number;
  minQuota: string[];
  averageQuota: string[];
}

export interface OpenAccountResult {
  input: TargetAccount;
  humanizedInput?: OpenAccountHumanizedPreview;
  error?: Error;
  txHash?: string;
  rawTx?: Pick<RawTx, "to" | "callData" | "value">;
  account?: CreditAccountData;
}

export type PoolDepositResult = {
  pool: Address;
  token: Address;
  amount: bigint;
} & (
  | {
      success: true;
      txHash: Hex;
    }
  | { success: false; error: Error; txHash?: Hex }
);

export interface OpenAccountsResult {
  deposits: PoolDepositResult[];
  accounts: OpenAccountResult[];
}

export class AccountOpener extends SDKConstruct {
  public readonly borrowerKey: Hex;
  public readonly depositorKey: Hex;

  #service: ICreditAccountsService;
  #anvil: AnvilClient;
  #logger?: ILogger;
  #borrower?: PrivateKeyAccount;
  #depositor?: PrivateKeyAccount;
  #faucet?: Address;
  #poolDepositMultiplier: bigint;
  #minDebtMultiplier: bigint;
  #allowMint: boolean;
  #leverageDelta: bigint;

  constructor(
    service: ICreditAccountsService,
    options_: AccountOpenerOptions = {},
  ) {
    super(service.sdk);
    const {
      borrowerKey,
      depositorKey,
      faucet,
      poolDepositMultiplier = 3_00_00n,
      minDebtMultiplier = 101_00n,
      leverageDelta = 500n,
      allowMint = false,
    } = options_;
    this.#service = service;
    this.#allowMint = allowMint;
    this.#logger = childLogger("AccountOpener", service.sdk.logger);
    this.#anvil = extendAnvilClient(service.sdk.client);
    try {
      this.#faucet = faucet ?? service.sdk.addressProvider.getAddress("FAUCET");
    } catch (_e) {
      this.#logger?.warn("faucet not found, will not claim from faucet");
    }
    this.borrowerKey = borrowerKey ?? generatePrivateKey();
    this.depositorKey = depositorKey ?? generatePrivateKey();
    this.#poolDepositMultiplier = BigInt(poolDepositMultiplier);
    this.#minDebtMultiplier = BigInt(minDebtMultiplier);
    this.#leverageDelta = BigInt(leverageDelta);
    this.#logger?.info(
      {
        borrower: privateKeyToAccount(this.borrowerKey).address,
        depositor: privateKeyToAccount(this.depositorKey).address,
        faucet: this.faucet,
        poolDepositMultiplier: this.#poolDepositMultiplier.toString(),
        minDebtMultiplier: this.#minDebtMultiplier.toString(),
        leverageDelta: this.#leverageDelta.toString(),
        allowMint: this.#allowMint,
      },
      "account opener options",
    );
  }

  public get borrower(): PrivateKeyAccount {
    if (!this.#borrower) {
      throw new Error("borrower can be used only after openCreditAccounts");
    }
    return this.#borrower;
  }

  public get depositor(): PrivateKeyAccount {
    if (!this.#depositor) {
      throw new Error("depositor can be used only after openCreditAccounts");
    }
    return this.#depositor;
  }

  /**
   * Tries to open account with underlying only in each CM
   */
  public async openCreditAccounts(
    targets: TargetAccount[],
    depositIntoPools = true,
    claimFromFaucet = true,
  ): Promise<OpenAccountsResult> {
    this.#logger?.info(
      {
        targets,
        depositIntoPools,
        claimFromFaucet,
      },
      "opening credit accounts",
    );
    let deposits: PoolDepositResult[] = [];
    if (depositIntoPools) {
      try {
        deposits = await this.#depositIntoPools(targets);
      } catch (e) {
        this.#logger?.warn(`failed to deposit into pools: ${e}`);
      }
    }

    if (claimFromFaucet) {
      await this.#prepareBorrower(targets);
    }

    const toApprove = new AddressMap<Set<Address>>();
    for (const c of targets) {
      const cm = this.sdk.marketRegister.findCreditManager(c.creditManager);
      const toApproveOnCM = toApprove.get(c.creditManager) ?? new Set();
      toApproveOnCM.add(cm.underlying);
      toApprove.upsert(c.creditManager, toApproveOnCM);
    }
    for (const [cmAddr, tokens] of toApprove.entries()) {
      const cm = this.sdk.marketRegister.findCreditManager(cmAddr);
      for (const token of tokens) {
        await this.#approve(token, cm);
      }
    }

    const accounts: OpenAccountResult[] = [];
    let success = 0;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      try {
        const result = await this.#openAccount(target, i + 1, targets.length);
        accounts.push(result);
        success += result.account ? 1 : 0;
        if (result.error) {
          this.#logger?.error(
            new Error(`failed to open account #${i + 1}/${targets.length}`, {
              cause: result.error,
            }),
          );
        }
      } catch (e) {
        this.#logger?.error(
          new Error(`failed to open account #${i + 1}/${targets.length}`, {
            cause: e,
          }),
        );
        accounts.push({
          input: target,
          error: e as Error,
        });
      }
    }
    this.#logger?.info(`opened ${success}/${targets.length} accounts`);
    try {
      await this.#directlyDistributeTokens(accounts);
      this.#logger?.info("distributed direct transfer tokens");
    } catch (e) {
      this.#logger?.error(`failed to distribute tokens: ${e}`);
    }
    return { deposits, accounts };
  }

  async #openAccount(
    input: TargetAccount,
    index: number,
    total: number,
  ): Promise<OpenAccountResult> {
    const { creditManager, target: collateral } = input;
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(collateral);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      collateral: symbol,
    });
    logger?.debug(`opening account #${index}/${total}`);
    const borrower = await this.#getBorrower();
    const preview = await this.prepareOpen(input);
    const humanizedInput = this.#humanizePreview(input, preview);

    let hash: Hash;
    try {
      hash = await sendRawTx(this.#anvil, {
        tx: preview.tx,
        account: borrower,
      });
      logger?.debug(`send transaction ${hash}`);
    } catch (e) {
      return {
        input,
        humanizedInput,
        error: e as Error,
        rawTx: {
          to: preview.tx.to,
          callData: preview.tx.callData,
          value: preview.tx.value,
        },
      };
    }
    const receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      return {
        input,
        humanizedInput,
        error: new OpenTxRevertedError(hash),
        txHash: hash,
        rawTx: {
          to: preview.tx.to,
          callData: preview.tx.callData,
          value: preview.tx.value,
        },
      };
    }
    logger?.info(`opened credit account ${index}/${total}`);
    const logs = parseEventLogs({
      abi: iCreditFacadeV300Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    logger?.info(`found ${logs.length} logs`);
    let account: CreditAccountData | undefined;
    if (logs.length > 0) {
      try {
        logger?.debug(
          `getting credit account data for ${logs[0].args.creditAccount}`,
        );
        account = await this.#service.getCreditAccountData(
          logs[0].args.creditAccount,
        );
      } catch (e) {
        logger?.error(`failed to get credit account data: ${e}`);
      }
    }
    return {
      input,
      humanizedInput,
      txHash: hash,
      rawTx: {
        to: preview.tx.to,
        callData: preview.tx.callData,
        value: preview.tx.value,
      },
      account,
    };
  }

  public async prepareOpen(input: TargetAccount): Promise<OpenAccountPreview> {
    const { creditManager, target, slippage = 50, directTransfer = [] } = input;

    const borrower = await this.#getBorrower();
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(target);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      target: symbol,
    });
    const leverage = this.#getLeverage(input);
    const { underlying } = cm.creditFacade;
    const minDebt =
      (this.#minDebtMultiplier * cm.creditFacade.minDebt) / PERCENTAGE_FACTOR;
    const expectedUnderlyingBalance = (minDebt * leverage) / PERCENTAGE_FACTOR;
    const expectedBalances: Asset[] = [];
    const leftoverBalances: Asset[] = [];
    for (const t of cm.creditManager.collateralTokens) {
      const token = t as Address;
      expectedBalances.push({
        token,
        balance: token === underlying ? expectedUnderlyingBalance : 1n,
      });
      leftoverBalances.push({
        token,
        balance: 1n,
      });
    }
    logger?.debug(
      {
        minDebt: this.sdk.tokensMeta.formatBN(underlying, minDebt, {
          symbol: true,
        }),
        leverage: leverage.toString(),
        expectedUnderlyingBalance: this.sdk.tokensMeta.formatBN(
          underlying,
          expectedUnderlyingBalance,
          { symbol: true },
        ),
      },
      "looking for open strategy",
    );

    let borrowerBalance = await this.#anvil.readContract({
      address: underlying,
      abi: ierc20Abi,
      functionName: "balanceOf",
      args: [borrower.address],
    });
    if (borrowerBalance < minDebt) {
      this.#logger?.warn(
        `borrower balance in underlying: ${this.sdk.tokensMeta.formatBN(underlying, borrowerBalance, { symbol: true })} is less than the minimum debt: ${this.sdk.tokensMeta.formatBN(underlying, minDebt, { symbol: true })}`,
      );
      if (this.#allowMint) {
        // it would be better to mint it once, since many accounts share underlying
        borrowerBalance = await this.#tryMint(
          underlying,
          borrower,
          minDebt - borrowerBalance,
        );
      }
    }
    this.#logger?.debug(
      `borrower balance in underlying: ${this.sdk.tokensMeta.formatBN(underlying, borrowerBalance, { symbol: true })}`,
    );

    const strategy = await this.sdk.routerFor(cm).findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances,
      leftoverBalances,
      slippage,
      target,
    });
    logger?.debug(strategy, "found open strategy");
    const debt = (minDebt * (leverage - PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;
    const averageQuota = this.#getCollateralQuota(
      cm,
      target,
      strategy.amount,
      debt,
      logger,
    );
    const minQuota = this.#getCollateralQuota(
      cm,
      target,
      strategy.minAmount,
      debt,
      logger,
    );
    for (const token of directTransfer) {
      averageQuota.push({ token, balance: DIRECT_TRANSFERS_QUOTA });
      minQuota.push({ token, balance: DIRECT_TRANSFERS_QUOTA });
    }
    logger?.debug({ averageQuota, minQuota }, "calculated quotas");
    const { tx, calls } = await this.#service.openCA({
      creditManager: cm.creditManager.address,
      averageQuota,
      minQuota,
      collateral: [{ token: underlying, balance: minDebt }],
      debt,
      calls: strategy.calls,
      ethAmount: 0n,
      permits: {},
      to: borrower.address,
      referralCode: 0n,
    });
    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      logger?.debug(
        `call #${i + 1}: ${this.sdk.parseFunctionData(call.target, call.callData)}`,
      );
    }
    logger?.debug("prepared open account transaction");
    return {
      tx,
      leverage,
      collateral: { token: underlying, balance: minDebt },
      minQuota,
      averageQuota,
      slippage,
    };
  }

  public async getOpenedAccounts(): Promise<CreditAccountData[]> {
    return await this.#service.getCreditAccounts({
      owner: this.borrower.address,
    });
  }

  async #depositIntoPools(
    targets: TargetAccount[],
  ): Promise<PoolDepositResult[]> {
    this.#logger?.debug("checking and topping up pools if necessary");

    const minAvailableByPool: Record<Address, bigint> = {};

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const leverage = this.#getLeverage(t);
      const cm = this.sdk.marketRegister.findCreditManager(t.creditManager);
      const minDebt =
        (this.#minDebtMultiplier * cm.creditFacade.minDebt) / PERCENTAGE_FACTOR;
      let amount =
        (((minDebt * (leverage - PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR) *
          this.#poolDepositMultiplier) /
        PERCENTAGE_FACTOR;
      amount =
        amount > cm.creditFacade.maxDebt ? cm.creditFacade.maxDebt : amount;
      minAvailableByPool[cm.pool] =
        (minAvailableByPool[cm.pool] ?? 0n) + amount;
      this.#logger?.debug(
        `target #${i + 1} (${this.labelAddress(t.target)}) needs ${this.sdk.tokensMeta.formatBN(cm.underlying, amount, { symbol: true })} in pool (leverage: ${Number(leverage / PERCENTAGE_FACTOR)}%)`,
      );
    }

    const deposits: [PoolContract, bigint][] = [];
    const claims: AddressMap<bigint> = new AddressMap();
    for (const [p, minAvailable] of Object.entries(minAvailableByPool)) {
      const market = this.sdk.marketRegister.findByPool(p as Address);
      const pool = market.pool.pool;
      let diff = minAvailable - pool.availableLiquidity;
      diff = diff < 0n ? 0n : diff;
      const [minS, availableS, diffS] = [
        minAvailable,
        pool.availableLiquidity,
        diff,
      ].map(v =>
        this.sdk.tokensMeta.formatBN(pool.underlying, v, { symbol: true }),
      );
      this.#logger?.debug(
        `Pool ${this.labelAddress(pool.address)} has ${availableS} liquidity, needs ${diffS} more for the minimum of ${minS}`,
      );
      if (diff > 0n) {
        deposits.push([pool, diff]);
        let claim = claims.get(pool.underlying) ?? 0n;
        // pool.available * linearModel.U2 can be borrowed
        // U2 is currently at 90% in all pools
        claim += (diff * PERCENTAGE_FACTOR) / 8950n;
        claims.upsert(pool.underlying, claim);
      }
    }

    const depositor = await this.#getDepositor();
    this.#logger?.debug(`depositor: ${depositor.address}`);

    try {
      await this.#claimFromFaucet(depositor, "depositor", claims);
    } catch (e) {
      if (this.#allowMint) {
        this.#logger?.error(`depositor failed to claim from faucet: ${e}`);
      } else {
        throw e;
      }
    }

    const results: PoolDepositResult[] = [];
    for (const [pool, amount] of deposits) {
      const result = await this.#depositToPool(pool, depositor, amount);
      results.push(result);
    }
    return results;
  }

  async #depositToPool(
    pool: PoolContract,
    depositor: PrivateKeyAccount,
    amount: bigint,
  ): Promise<PoolDepositResult> {
    const { underlying, address } = pool;
    const poolName = this.sdk.labelAddress(address);
    const poolData = {
      pool: address,
      token: underlying,
      amount,
    };
    let txHash: Hex | undefined;
    try {
      const amnt = this.sdk.tokensMeta.formatBN(pool.underlying, amount, {
        symbol: true,
      });
      this.#logger?.debug(`depositing ${amnt} into pool ${poolName}`);

      let allowance = await this.#anvil.readContract({
        address: underlying,
        abi: ierc20Abi,
        functionName: "balanceOf",
        args: [depositor.address],
      });
      if (allowance < amount) {
        this.#logger?.warn(
          `depositor balance in underlying: ${this.sdk.tokensMeta.formatBN(pool.underlying, allowance, { symbol: true })} is less than the amount to deposit: ${amnt}`,
        );
        if (this.#allowMint) {
          allowance = await this.#tryMint(
            underlying,
            depositor,
            amount - allowance,
          );
        }
      }

      this.#logger?.debug(
        `depositor balance in underlying: ${this.sdk.tokensMeta.formatBN(pool.underlying, allowance, { symbol: true })}`,
      );

      txHash = await this.#anvil.writeContract({
        account: depositor,
        address: underlying,
        abi: ierc20Abi,
        functionName: "approve",
        args: [address, allowance],
        chain: this.#anvil.chain,
      });
      let receipt = await this.#anvil.waitForTransactionReceipt({
        hash: txHash,
      });
      if (receipt.status === "reverted") {
        throw new Error(
          `tx ${txHash} that approves underlying from depositor for pool ${poolName} reverted`,
        );
      }
      this.#logger?.debug(
        `depositor approved underlying for pool ${poolName}: ${txHash}`,
      );
      txHash = await this.#anvil.writeContract({
        account: depositor,
        address: address,
        abi: iPoolV300Abi,
        functionName: "deposit",
        args: [amount, depositor.address],
        chain: this.#anvil.chain,
      });
      receipt = await this.#anvil.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status === "reverted") {
        throw new Error(
          `tx ${txHash} that deposits to pool ${poolName} reverted`,
        );
      }
      this.#logger?.debug(`deposited ${amnt} into ${poolName}`);
      return {
        ...poolData,
        txHash,
        success: true,
      };
    } catch (e) {
      this.#logger?.error(`failed to deposit to pool ${poolName}: ${e}`);
      return {
        ...poolData,
        txHash,
        success: false,
        error: e as Error,
      };
    }
  }

  /**
   * Tries to mint tokens, returns the balance after attempt (success or not)
   * @param token
   * @param dest
   * @param amount
   */
  async #tryMint(
    token: Address,
    dest: PrivateKeyAccount,
    amount: bigint,
  ): Promise<bigint> {
    const minter = createMinter(this.sdk, this.#anvil, token);
    return minter.tryMint(token, dest.address, amount);
  }

  /**
   * Creates borrower wallet,
   * Sets ETH balance,
   * Gets tokens from faucet,
   * Gets DEGEN_NFT,
   */
  async #prepareBorrower(targets: TargetAccount[]): Promise<PrivateKeyAccount> {
    const borrower = await this.#getBorrower();

    // each account will have minDebt*minDebtMultiplier in USD, see how much we need to claim from faucet
    // collect all degen nfts
    const degenNFTS: Record<Address, number> = {};
    const claims: AddressMap<bigint> = new AddressMap();
    for (const target of targets) {
      const cm = this.sdk.marketRegister.findCreditManager(
        target.creditManager,
      );
      const market = this.sdk.marketRegister.findByCreditManager(
        target.creditManager,
      );
      const { degenNFT } = cm.creditFacade;
      const minDebt =
        (this.#minDebtMultiplier * cm.creditFacade.minDebt) / PERCENTAGE_FACTOR;

      const claim = claims.get(cm.underlying) ?? 0n;
      // 10% more to be safe
      claims.upsert(cm.underlying, claim + (minDebt * 11n) / 10n);

      if (isAddress(degenNFT) && degenNFT !== ADDRESS_0X0) {
        degenNFTS[degenNFT] = (degenNFTS[degenNFT] ?? 0) + 1;
      }
    }

    await this.#claimFromFaucet(borrower, "borrower", claims);

    for (const [degenNFT, amount] of Object.entries(degenNFTS)) {
      await this.#mintDegenNft(degenNFT as Address, borrower.address, amount);
    }
    this.#logger?.debug("prepared borrower");
    return borrower;
  }

  async #claimFromFaucet(
    claimer: PrivateKeyAccount,
    role: string,
    claims: AddressMap<bigint>,
  ): Promise<void> {
    await claimFromFaucet({
      sdk: this.sdk,
      publicClient: this.#anvil,
      wallet: this.#anvil,
      faucet: this.faucet,
      claimer,
      role,
      amount: claims.entries().map(([k, v]) => ({ token: k, amount: v })),
      logger: this.#logger,
    });
  }

  async #approve(token: Address, cm: CreditSuite): Promise<void> {
    // TODO: check if collateral is already approved
    const borrower = await this.#getBorrower();
    const symbol = this.#service.sdk.tokensMeta.symbol(token);
    try {
      if (symbol === "USDT") {
        const hash = await this.#anvil.writeContract({
          account: borrower,
          address: token,
          abi: ierc20Abi,
          functionName: "approve",
          args: [cm.creditManager.address, 0n],
          chain: this.#anvil.chain,
        });
        await this.#anvil.waitForTransactionReceipt({
          hash,
        });
      }

      const hash = await this.#anvil.writeContract({
        account: borrower,
        address: token,
        abi: ierc20Abi,
        functionName: "approve",
        args: [cm.creditManager.address, MAX_UINT256],
        chain: this.#anvil.chain,
      });
      const receipt = await this.#anvil.waitForTransactionReceipt({
        hash,
      });

      if (receipt.status === "reverted") {
        this.#logger?.error(
          `failed to allowed credit manager ${cm.creditManager.name} to spend ${symbol} (${token}), tx reverted: ${hash}`,
        );
      } else {
        this.#logger?.debug(
          `allowed credit manager ${cm.creditManager.name} to spend ${symbol} (${token}), tx: ${hash}`,
        );
      }
    } catch (e) {
      this.#logger?.error(
        `failed to allowed credit manager ${cm.creditManager.name} to spend ${symbol} (${token}): ${e}`,
      );
    }
  }

  async #mintDegenNft(
    degenNFT: Address,
    to: Address,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      return;
    }
    let minter: Address | undefined;
    try {
      minter = await this.#anvil.readContract({
        address: degenNFT,
        abi: iDegenNftv2Abi,
        functionName: "minter",
      });
    } catch (e) {
      this.#logger?.error(`failed to get minter of degenNFT ${degenNFT}: ${e}`);
      return;
    }

    try {
      await this.#anvil.impersonateAccount({ address: minter });
      await this.#anvil.setBalance({
        address: minter,
        value: parseEther("100"),
      });
      const hash = await this.#anvil.writeContract({
        account: minter,
        address: degenNFT,
        abi: iDegenNftv2Abi,
        functionName: "mint",
        args: [to, BigInt(amount)],
        chain: this.#anvil.chain,
      });
      const receipt = await this.#anvil.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status === "reverted") {
        this.#logger?.error(
          `failed to mint ${amount} degenNFT ${degenNFT} to borrower ${to}, tx reverted: ${hash}`,
        );
      }
      this.#logger?.debug(
        `minted ${amount} degenNFT ${degenNFT} to borrower ${to}, tx: ${hash}`,
      );
    } catch (e) {
      this.#logger?.error(
        `failed to mint ${amount} degenNFT ${degenNFT} to borrower ${to}: ${e}`,
      );
    } finally {
      await this.#anvil.stopImpersonatingAccount({ address: minter });
    }
  }

  async #getBorrower(): Promise<PrivateKeyAccount> {
    if (!this.#borrower) {
      this.#borrower = await this.#createAccount(this.borrowerKey);
      this.#logger?.info(`created borrower ${this.#borrower.address}`);
    }
    return this.borrower;
  }

  async #getDepositor(): Promise<PrivateKeyAccount> {
    if (!this.#depositor) {
      this.#depositor = await this.#createAccount(this.depositorKey);
      this.#logger?.info(`created depositor ${this.#depositor.address}`);
    }
    return this.depositor;
  }

  async #createAccount(privateKey: Hex): Promise<PrivateKeyAccount> {
    const acc = privateKeyToAccount(privateKey);
    await this.#anvil.setBalance({
      address: acc.address,
      value: parseEther("100"),
    });
    return acc;
  }

  /**
   * Claims tokens from faucet, uniformly distributes them to accounts
   * @param targets
   * @returns
   */
  async #directlyDistributeTokens(targets: OpenAccountResult[]): Promise<void> {
    const tokens = new AddressSet(
      targets.flatMap(t => t.input.directTransfer ?? []),
    );
    if (tokens.size === 0) {
      return;
    }
    const distributorKey = generatePrivateKey();
    const distributor = privateKeyToAccount(distributorKey);
    await this.#anvil.setBalance({
      address: distributor.address,
      value: parseEther("100"),
    });
    await claimFromFaucet({
      sdk: this.sdk,
      publicClient: this.#anvil,
      wallet: this.#anvil,
      faucet: this.faucet,
      claimer: distributor,
      role: "reward token distributor",
      logger: this.#logger,
    });

    const actualBalances = await this.#anvil.multicall({
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
    const tokensArr = tokens.asArray();
    for (let i = 0; i < tokensArr.length; i++) {
      const token = tokensArr[i];
      const balance = actualBalances[i];
      this.#logger?.debug(
        `${this.labelAddress(token)} balance: ${this.sdk.tokensMeta.formatBN(token, balance)}`,
      );
    }
    for (const { account, input } of targets) {
      if (!account) {
        continue;
      }
      const directTransfer = new AddressSet(input.directTransfer);
      for (let i = 0; i < tokensArr.length; i++) {
        const token = tokensArr[i];
        if (!directTransfer.has(token)) {
          continue;
        }
        const balance = actualBalances[i] / BigInt(targets.length);
        this.#logger?.debug(
          `sending ${balance} ${token} to ${account.creditAccount}`,
        );
        const hash = await this.#anvil.writeContract({
          account: distributor,
          address: token,
          abi: erc20Abi,
          functionName: "transfer",
          args: [account.creditAccount, balance],
          chain: this.#anvil.chain,
        });
        const receipt = await this.#anvil.waitForTransactionReceipt({
          hash,
        });
        if (receipt.status === "reverted") {
          this.#logger?.error(
            `failed to send ${token} to ${account.creditAccount}, tx ${hash} reverted`,
          );
        } else {
          this.#logger?.debug(
            `sent ${token} to ${account.creditAccount}, tx: ${hash}`,
          );
        }
      }
    }
  }

  #getCollateralQuota(
    cm: CreditSuite,
    collateral: Address,
    collateralAmount: bigint,
    debt: bigint,
    logger?: ILogger,
  ): Asset[] {
    const {
      underlying,
      creditManager: { liquidationThresholds },
    } = cm;
    const inUnderlying = collateral.toLowerCase() === underlying.toLowerCase();
    if (inUnderlying) {
      return [];
    }
    const collateralLT = BigInt(liquidationThresholds.mustGet(collateral));
    const market = this.sdk.marketRegister.findByCreditManager(
      cm.creditManager.address,
    );
    const quotaInfo = market.pool.pqk.quotas.mustGet(collateral);
    const availableQuota = quotaInfo.limit - quotaInfo.totalQuoted;
    if (availableQuota <= 0n) {
      throw new Error(
        `quota exceeded for asset ${this.labelAddress(collateral)} in ${cm.name}`,
      );
    }
    const oracle = this.sdk.marketRegister.findByCreditManager(
      cm.creditManager.address,
    ).priceOracle;
    const amount = oracle.convert(collateral, underlying, collateralAmount);
    const desiredQuota = this.#calcQuota(amount, debt, collateralLT);
    logger?.debug(
      {
        desiredQuota: this.sdk.tokensMeta.formatBN(underlying, desiredQuota, {
          symbol: true,
        }),
        availableQuota: this.sdk.tokensMeta.formatBN(
          underlying,
          availableQuota,
          { symbol: true },
        ),
        collateralAmount: this.sdk.tokensMeta.formatBN(
          collateral,
          collateralAmount,
          { symbol: true },
        ),
        amount: this.sdk.tokensMeta.formatBN(underlying, amount, {
          symbol: true,
        }),
        debt: this.sdk.tokensMeta.formatBN(underlying, debt, { symbol: true }),
        lt: Number(collateralLT),
      },
      "calculated quota",
    );
    return [
      {
        token: collateral,
        balance: desiredQuota < availableQuota ? desiredQuota : availableQuota,
      },
    ];
  }

  #calcQuota(amount: bigint, debt: bigint, lt: bigint): bigint {
    let quota = (amount * lt) / PERCENTAGE_FACTOR;
    quota = debt < quota ? debt : quota;

    quota = (quota * (PERCENTAGE_FACTOR + 500n)) / PERCENTAGE_FACTOR;

    return (quota / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR;
  }

  /**
   * Returns leverage in percentage factor format
   * @param param0
   * @returns
   */
  #getLeverage({ creditManager, target, leverage }: TargetAccount): bigint {
    if (leverage) {
      return BigInt(leverage) * PERCENTAGE_FACTOR;
    }
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const lt = BigInt(cm.creditManager.liquidationThresholds.mustGet(target));
    const d = this.#leverageDelta;
    let result = PERCENTAGE_FACTOR * (1n + (lt - d) / (PERCENTAGE_FACTOR - lt));
    // cap at 10x
    result =
      result > PERCENTAGE_FACTOR * 10n ? PERCENTAGE_FACTOR * 10n : result;
    // rounding to 0.1 precision
    result = BigInt(Math.floor(Number(result) / 1000) * 1000);
    return result;
  }

  #humanizePreview(
    input: TargetAccount,
    preview: OpenAccountPreview,
  ): OpenAccountHumanizedPreview {
    return {
      creditManager: this.sdk.labelAddress(input.creditManager),
      target: this.sdk.labelAddress(input.target),
      leverage: Number(preview.leverage),
      slippage: preview.slippage,
      collateral: this.sdk.tokensMeta.formatBN(preview.collateral, {
        symbol: true,
      }),
      minQuota: preview.minQuota
        .filter(q => q.balance > 10n)
        .map(q => this.sdk.tokensMeta.formatBN(q, { symbol: true })),
      averageQuota: preview.averageQuota
        .filter(q => q.balance > 10n)
        .map(q => this.sdk.tokensMeta.formatBN(q, { symbol: true })),
    };
  }

  public get faucet(): Address {
    if (!this.#faucet) {
      throw new Error("faucet not found");
    }
    return this.#faucet;
  }
}
