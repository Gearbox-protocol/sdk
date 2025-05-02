import type { Address, Hash, PrivateKeyAccount } from "viem";
import { isAddress, parseEther, parseEventLogs } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { ierc20Abi } from "../abi/iERC20.js";
import { iCreditFacadeV300Abi, iPoolV300Abi } from "../abi/v300.js";
import type {
  Asset,
  CreditAccountData,
  CreditAccountsService,
  CreditSuite,
  ILogger,
  PoolContract,
  RawTx,
} from "../sdk/index.js";
import {
  ADDRESS_0X0,
  AddressMap,
  childLogger,
  formatBN,
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  SDKConstruct,
  sendRawTx,
} from "../sdk/index.js";
import { iDegenNftv2Abi } from "./abi.js";
import { type AnvilClient, createAnvilClient } from "./createAnvilClient.js";

export interface AccountOpenerOptions {
  faucet?: Address;
  borrower?: PrivateKeyAccount;
  poolDepositMultiplier?: bigint;
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
  leverage?: number;
  slippage?: number;
}

export interface OpenAccountResult {
  input: TargetAccount;
  error?: string;
  txHash?: string;
  rawTx?: RawTx;
  account?: CreditAccountData;
}

export class AccountOpener extends SDKConstruct {
  #service: CreditAccountsService;
  #anvil: AnvilClient;
  #logger?: ILogger;
  #borrower?: PrivateKeyAccount;
  #faucet?: Address;
  #poolDepositMultiplier: bigint;

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
    try {
      this.#faucet =
        options.faucet ?? service.sdk.addressProvider.getAddress("FAUCET");
    } catch (e) {
      this.#logger?.warn("faucet not found, will not claim from faucet");
    }
    this.#borrower = options.borrower;
    this.#poolDepositMultiplier = options.poolDepositMultiplier ?? 110_00n;
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
    depositIntoPools = true,
    claimFromFaucet = true,
  ): Promise<OpenAccountResult[]> {
    if (depositIntoPools) {
      try {
        await this.#depositIntoPools(targets);
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

    const results: OpenAccountResult[] = [];
    let success = 0;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      try {
        const result = await this.#openAccount(target, i + 1, targets.length);
        results.push(result);
        success += result.account ? 1 : 0;
      } catch (e) {
        results.push({
          input: target,
          error: `${e}`,
        });
      }
    }
    this.#logger?.info(`opened ${success}/${targets.length} accounts`);
    return results;
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
    const tx = await this.prepareOpen(input);

    let hash: Hash;
    try {
      hash = await sendRawTx(this.#anvil, {
        tx,
        account: borrower,
      });
      logger?.debug(`send transaction ${hash}`);
    } catch (e) {
      return {
        input,
        error: `${e}`,
        rawTx: tx,
      };
    }
    const receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      return {
        input,
        error: `open credit account tx reverted`,
        txHash: hash,
        rawTx: tx,
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
      txHash: hash,
      rawTx: tx,
      account,
    };
  }

  public async prepareOpen(input: TargetAccount): Promise<RawTx> {
    const { creditManager, target, slippage = 50 } = input;

    const borrower = await this.#getBorrower();
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(target);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      target: symbol,
    });
    const leverage = this.#getLeverage(input);
    const { minDebt, underlying } = cm.creditFacade;
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
        minDebt: this.sdk.tokensMeta.formatBN(underlying, minDebt),
        leverage: leverage.toString(),
        expectedUnderlyingBalance: this.sdk.tokensMeta.formatBN(
          underlying,
          expectedUnderlyingBalance,
        ),
      },
      "looking for open strategy",
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
    return tx;
  }

  public async getOpenedAccounts(): Promise<CreditAccountData[]> {
    return await this.#service.getCreditAccounts({
      owner: this.borrower,
    });
  }

  async #depositIntoPools(targets: TargetAccount[]): Promise<void> {
    this.#logger?.debug("checking and topping up pools if necessary");

    const minAvailableByPool: Record<Address, bigint> = {};
    for (const t of targets) {
      const leverage = this.#getLeverage(t);
      const cm = this.sdk.marketRegister.findCreditManager(t.creditManager);
      const { minDebt } = cm.creditFacade;
      minAvailableByPool[cm.pool] =
        (minAvailableByPool[cm.pool] ?? 0n) +
        (((minDebt * (leverage - PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR) *
          this.#poolDepositMultiplier) /
          PERCENTAGE_FACTOR;
    }

    let totalUSD = 0n;
    let deposits: [PoolContract, bigint][] = [];
    for (const [p, minAvailable] of Object.entries(minAvailableByPool)) {
      const market = this.sdk.marketRegister.findByPool(p as Address);
      const pool = market.pool.pool;
      let diff = minAvailable - pool.availableLiquidity;
      diff = diff < 0n ? 0n : diff;
      const [minS, availableS, diffS] = [
        minAvailable,
        pool.availableLiquidity,
        diff,
      ].map(v => this.sdk.tokensMeta.formatBN(pool.underlying, v));
      this.#logger?.debug(
        `Pool ${this.labelAddress(pool.address)} has ${availableS} liquidity, needs ${diffS} more for the minimum of ${minS} ${this.sdk.tokensMeta.symbol(pool.underlying)}`,
      );
      if (diff > 0n) {
        deposits.push([pool, diff]);
        totalUSD += market.priceOracle.convertToUSD(pool.underlying, diff);
      }
    }
    // pool.available * linearModel.U2 can be borrowed
    // U2 is currently at 90% in all pools
    totalUSD = (totalUSD * PERCENTAGE_FACTOR) / 8950n;
    this.#logger?.debug(
      `total USD to claim from faucet: ${formatBN(totalUSD, 8)}`,
    );

    const depositor = await this.#createAccount();
    this.#logger?.debug(`created depositor ${depositor.address}`);

    await this.#claimFromFaucet(depositor, "depositor", totalUSD);

    for (const [pool, amount] of deposits) {
      try {
        await this.#depositToPool(pool, depositor, amount);
      } catch (e) {
        this.#logger?.warn(`failed to deposit into ${pool.name}: ${e}`);
      }
    }
  }

  async #depositToPool(
    pool: PoolContract,
    depositor: PrivateKeyAccount,
    amount: bigint,
  ): Promise<void> {
    const { underlying, address } = pool;
    const poolName = this.sdk.provider.addressLabels.get(address);
    const amnt =
      this.sdk.tokensMeta.formatBN(pool.underlying, amount) +
      " " +
      this.sdk.tokensMeta.symbol(pool.underlying);
    this.#logger?.debug(`depositing ${amnt} into pool ${poolName}`);

    const allowance = await this.#anvil.readContract({
      address: underlying,
      abi: ierc20Abi,
      functionName: "balanceOf",
      args: [depositor.address],
    });
    this.#logger?.debug(
      `depositor balance in underlying: ${this.sdk.tokensMeta.formatBN(pool.underlying, allowance)}`,
    );
    let hash = await this.#anvil.writeContract({
      account: depositor,
      address: underlying,
      abi: ierc20Abi,
      functionName: "approve",
      args: [address, allowance],
      chain: this.#anvil.chain,
    });
    let receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(
        `tx ${hash} that approves underlying from depositor for pool ${poolName} reverted`,
      );
    }
    this.#logger?.debug(
      `depositor approved underlying for pool ${poolName}: ${hash}`,
    );
    hash = await this.#anvil.writeContract({
      account: depositor,
      address: address,
      abi: iPoolV300Abi,
      functionName: "deposit",
      args: [amount, depositor.address],
      chain: this.#anvil.chain,
    });
    receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(`tx ${hash} that deposits to pool ${poolName} reverted`);
    }
    this.#logger?.debug(`deposited ${amnt} into ${poolName}`);
  }

  /**
   * Creates borrower wallet,
   * Sets ETH balance,
   * Gets tokens from faucet,
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

    await this.#claimFromFaucet(borrower, "borrower", claimUSD);

    for (const [degenNFT, amount] of Object.entries(degenNFTS)) {
      await this.#mintDegenNft(degenNFT as Address, borrower.address, amount);
    }
    this.#logger?.debug("prepared borrower");
    return borrower;
  }

  async #claimFromFaucet(
    claimer: PrivateKeyAccount,
    role: string,
    amountUSD: bigint,
  ): Promise<void> {
    const [usr, amnt] = [claimer.address, formatBN(amountUSD, 8)];

    this.#logger?.debug(`${role} ${usr} claiming ${amnt} USD from faucet`);
    if (amountUSD === 0n) {
      this.#logger?.debug("amount is 0, skipping claim");
      return;
    }
    const hash = await this.#anvil.writeContract({
      account: claimer,
      address: this.faucet,
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
      args: [amountUSD],
      chain: this.#anvil.chain,
    });
    const receipt = await this.#anvil.waitForTransactionReceipt({
      hash,
    });
    if (receipt.status === "reverted") {
      throw new Error(
        `${role} ${usr} failed to claimed equivalent of ${amnt} USD from faucet, tx: ${hash}`,
      );
    }
    this.#logger?.debug(
      `${role} ${usr} claimed equivalent of ${amnt} USD from faucet, tx: ${hash}`,
    );
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
      this.#borrower = await this.#createAccount();
      this.#logger?.info(`created borrower ${this.#borrower.address}`);
    }
    return this.#borrower;
  }

  async #createAccount(): Promise<PrivateKeyAccount> {
    const acc = privateKeyToAccount(generatePrivateKey());
    await this.#anvil.setBalance({
      address: acc.address,
      value: parseEther("100"),
    });
    return acc;
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
        desiredQuota: this.sdk.tokensMeta.formatBN(underlying, desiredQuota),
        availableQuota: this.sdk.tokensMeta.formatBN(
          underlying,
          availableQuota,
        ),
        collateralAmount: this.sdk.tokensMeta.formatBN(
          collateral,
          collateralAmount,
        ),
        amount: this.sdk.tokensMeta.formatBN(underlying, amount),
        debt: this.sdk.tokensMeta.formatBN(underlying, debt),
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
    const d = 50n;
    return PERCENTAGE_FACTOR * (1n + (lt - d) / (PERCENTAGE_FACTOR - lt));
  }

  public get faucet(): Address {
    if (!this.#faucet) {
      throw new Error("faucet not found");
    }
    return this.#faucet;
  }
}
