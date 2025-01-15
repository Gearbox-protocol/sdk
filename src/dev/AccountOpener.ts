import type { Address, PrivateKeyAccount } from "viem";
import { isAddress, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import type {
  Asset,
  CreditAccountData,
  CreditAccountsService,
  CreditSuite,
  ILogger,
} from "../sdk";
import {
  ADDRESS_0X0,
  AddressMap,
  childLogger,
  formatBN,
  iDegenNftv2Abi,
  ierc20Abi,
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  SDKConstruct,
  sendRawTx,
} from "../sdk";
import { type AnvilClient, createAnvilClient } from "./createAnvilClient";

export interface AccountOpenerOptions {
  faucet?: Address;
}

export interface TargetAccount {
  creditManager: Address;
  collateral: Address;
  leverage?: number;
  slippage?: number;
}

export class AccountOpener extends SDKConstruct {
  #service: CreditAccountsService;
  #anvil: AnvilClient;
  #logger?: ILogger;
  #borrower?: PrivateKeyAccount;
  #faucet: Address;

  constructor(
    service: CreditAccountsService,
    options: AccountOpenerOptions = {},
  ) {
    super(service.sdk);
    this.#service = service;
    this.#logger = childLogger("AccountOpener", service.sdk.logger);
    this.#anvil = createAnvilClient({
      chain: service.sdk.provider.chain,
      transport: service.sdk.provider.transport,
    });
    this.#faucet =
      options.faucet ?? service.sdk.addressProvider.getAddress("FAUCET");
  }

  public get borrower(): Address {
    if (!this.#borrower) {
      throw new Error("borrower can be used only after openCreditAccounts");
    }
    return this.#borrower.address;
  }

  /**
   * Tries to open account with underlying only in each CM
   */
  public async openCreditAccounts(
    targets: TargetAccount[],
  ): Promise<CreditAccountData[]> {
    await this.#prepareBorrower(targets);

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

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      try {
        await this.#openAccount(target, i + 1, targets.length);
      } catch (e) {
        this.#logger?.error(e);
      }
    }
    const accounts = await this.getOpenedAccounts();
    this.#logger?.info(`opened ${accounts.length} accounts`);
    return accounts;
  }

  async #openAccount(
    { creditManager, collateral, leverage = 4, slippage = 50 }: TargetAccount,
    index: number,
    total: number,
  ): Promise<void> {
    const borrower = await this.#getBorrower();
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(collateral);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      collateral: symbol,
    });
    logger?.debug(`opening account #${index}/${total}`);
    const { minDebt, underlying } = cm.creditFacade;

    const expectedBalances: Asset[] = [];
    const leftoverBalances: Asset[] = [];
    for (const t of Object.keys(cm.collateralTokens)) {
      const token = t as Address;
      expectedBalances.push({
        token,
        balance: token === underlying ? BigInt(leverage) * minDebt : 1n,
      });
      leftoverBalances.push({
        token,
        balance: 1n,
      });
    }
    logger?.debug("looking for open strategy");
    const strategy = await this.sdk.router.findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances,
      leftoverBalances,
      slippage,
      target: collateral,
    });
    logger?.debug(strategy, "found open strategy");
    const debt = minDebt * BigInt(leverage - 1);
    const averageQuota = this.#getCollateralQuota(
      cm,
      collateral,
      strategy.amount,
      debt,
    );
    const minQuota = this.#getCollateralQuota(
      cm,
      collateral,
      strategy.minAmount,
      debt,
    );
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
    const hash = await sendRawTx(this.#anvil, {
      tx,
      account: borrower,
    });
    logger?.debug(`send transaction ${hash}`);
    const receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(`open credit account tx ${hash} reverted`);
    }
    logger?.info(`opened credit account ${index}/${total}`);
  }

  public async getOpenedAccounts(): Promise<CreditAccountData[]> {
    return await this.#service.getCreditAccounts({
      owner: this.borrower,
    });
  }

  /**
   * Creates borrower wallet,
   * Sets ETH balance,
   * Gets tokens from faucet,
   * Approves collateral tokens to credit manager,
   * Gets DEGEN_NFT,
   */
  async #prepareBorrower(targets: TargetAccount[]): Promise<PrivateKeyAccount> {
    const borrower = await this.#getBorrower();

    // each account will have minDebt in USD, see how much we need to claim from faucet
    let claimUSD = 0n;
    // collect all degen nfts
    let degenNFTS: Record<Address, number> = {};
    for (const target of targets) {
      const cm = this.sdk.marketRegister.findCreditManager(
        target.creditManager,
      );
      const market = this.sdk.marketRegister.findByCreditManager(
        target.creditManager,
      );
      const { minDebt, degenNFT } = cm.creditFacade;

      claimUSD += market.priceOracle.convertToUSD(cm.underlying, minDebt);

      if (isAddress(degenNFT) && degenNFT !== ADDRESS_0X0) {
        degenNFTS[degenNFT] = (degenNFTS[degenNFT] ?? 0) + 1;
      }
    }
    claimUSD = (claimUSD * 11n) / 10n; // 10% more to be safe

    this.#logger?.debug(`claiming ${formatBN(claimUSD, 8)} USD from faucet`);
    let hash = await this.#anvil.writeContract({
      account: borrower,
      address: this.#faucet,
      abi: [
        {
          type: "function",
          inputs: [
            { name: "amountUSD", internalType: "uint256", type: "uint256" },
          ],
          name: "claim",
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "claim",
      args: [claimUSD],
      chain: this.#anvil.chain,
    });
    let receipt = await this.#anvil.waitForTransactionReceipt({
      hash,
    });
    if (receipt.status === "reverted") {
      throw new Error(
        `borrower ${borrower.address} failed to claimed equivalent of ${formatBN(claimUSD, 8)} USD from faucet, tx: ${hash}`,
      );
    }
    this.#logger?.debug(
      `borrower ${borrower.address} claimed equivalent of ${formatBN(claimUSD, 8)} USD from faucet, tx: ${hash}`,
    );

    for (const [degenNFT, amount] of Object.entries(degenNFTS)) {
      await this.#mintDegenNft(degenNFT as Address, borrower.address, amount);
    }
    this.#logger?.debug("prepared borrower");
    return borrower;
  }

  async #approve(token: Address, cm: CreditSuite): Promise<void> {
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
      this.#borrower = privateKeyToAccount(generatePrivateKey());
      await this.#anvil.setBalance({
        address: this.#borrower.address,
        value: parseEther("100"),
      });
      this.#logger?.info(`created borrower ${this.#borrower.address}`);
    }
    return this.#borrower;
  }

  #getCollateralQuota(
    cm: CreditSuite,
    collateral: Address,
    amount: bigint,
    debt: bigint,
  ): Asset[] {
    const { underlying, collateralTokens } = cm;
    const inUnderlying = collateral.toLowerCase() === underlying.toLowerCase();
    if (inUnderlying) {
      return [];
    }
    const collateralLT = BigInt(collateralTokens[collateral]);
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
    const desiredQuota = this.#calcQuota(amount, debt, collateralLT);

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
}
