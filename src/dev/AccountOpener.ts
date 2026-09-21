import type { Address, Hash, Hex, PrivateKeyAccount } from "viem";
import { BaseError, isAddressEqual, parseEventLogs } from "viem";
import { iCreditFacadeV310Abi } from "../abi/310/generated.js";
import type { ChainId } from "../model/index.js";
import type {
  Asset,
  CreditAccountData,
  ILogger,
  IPoolContract,
  RawTx,
} from "../onchain/index.js";
import {
  AddressMap,
  AddressSet,
  AssetsMap,
  childLogger,
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SDKConstruct,
  sendRawTx,
} from "../onchain/index.js";
import type { GearboxSDK } from "../sdk/index.js";
import {
  AnvilAccountEnvironment,
  type AnvilAccountEnvironmentOptions,
  type PoolDepositResult,
} from "./AnvilAccountEnvironment.js";

export type { PoolDepositResult } from "./AnvilAccountEnvironment.js";

const DIRECT_TRANSFERS_QUOTA = 10_000n;

export class OpenTxRevertedError extends BaseError {
  public readonly txHash: Hash;

  constructor(txHash: Hash) {
    super("open credit account tx reverted");
    this.txHash = txHash;
  }
}

export interface AccountOpenerOptions extends AnvilAccountEnvironmentOptions {
  /**
   * Chain to use. May be omitted when the GearboxSDK covers exactly one chain.
   */
  chainId?: ChainId;
  poolDepositMultiplier?: bigint | string | number;
  minDebtMultiplier?: bigint | string | number;
  leverageDelta?: bigint | string | number;
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

export interface OpenAccountsResult {
  deposits: PoolDepositResult[];
  accounts: OpenAccountResult[];
}

export class AccountOpener extends SDKConstruct {
  #logger?: ILogger;
  #environment: AnvilAccountEnvironment;
  #poolDepositMultiplier: bigint;
  #minDebtMultiplier: bigint;
  #leverageDelta: bigint;
  #gearbox: GearboxSDK<"onchain" | "both">;

  constructor(
    gearbox: GearboxSDK<"onchain" | "both">,
    options_: AccountOpenerOptions = {},
  ) {
    const environment = AnvilAccountEnvironment.fromGearbox(gearbox, options_);
    super(environment.sdk);
    const {
      poolDepositMultiplier = 3_00_00n,
      minDebtMultiplier = 101_00n,
      leverageDelta = 500n,
    } = options_;
    this.#logger = childLogger("AccountOpener", environment.sdk.logger);
    this.#environment = environment;
    this.#poolDepositMultiplier = BigInt(poolDepositMultiplier);
    this.#minDebtMultiplier = BigInt(minDebtMultiplier);
    this.#leverageDelta = BigInt(leverageDelta);
    this.#gearbox = gearbox;
    this.#logger?.info(
      {
        poolDepositMultiplier: this.#poolDepositMultiplier.toString(),
        minDebtMultiplier: this.#minDebtMultiplier.toString(),
        leverageDelta: this.#leverageDelta.toString(),
      },
      "account opener options",
    );
  }

  public get borrowerKey(): Hex {
    return this.#environment.borrowerKey;
  }

  public get depositorKey(): Hex {
    return this.#environment.depositorKey;
  }

  public get borrower(): PrivateKeyAccount {
    return this.#environment.borrower;
  }

  public get depositor(): PrivateKeyAccount {
    return this.#environment.depositor;
  }

  /**
   * Tries to open account with underlying only in each CM
   */
  public async openCreditAccounts(
    targets: TargetAccount[],
    depositIntoPools = true,
    claimFromFaucet = true,
  ): Promise<OpenAccountsResult> {
    await this.#ensureAttached();
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
      await this.#environment.prepareBorrower(
        targets.map(target => ({
          ...target,
          collateral: this.#getCollateral(target),
        })),
      );
    }

    const toApprove = new AddressMap<AddressSet>();
    for (const c of targets) {
      const toApproveOnCM = toApprove.get(c.creditManager) ?? new AddressSet();
      toApproveOnCM.add(this.#getCollateralToken(c));
      toApprove.upsert(c.creditManager, toApproveOnCM);
    }
    // Setup fails loudly, so this orchestration boundary keeps the batch
    // best-effort: a failure only skips the targets that needed that setup.
    const setupErrors = new Map<TargetAccount, Error[]>();
    const recordSetupError = (target: TargetAccount, error: Error): void => {
      setupErrors.set(target, [...(setupErrors.get(target) ?? []), error]);
    };
    for (const [cmAddr, tokens] of toApprove.entries()) {
      const cm = this.sdk.marketRegister.findCreditManager(cmAddr);
      for (const token of tokens) {
        try {
          await this.#environment.approve(token, cm);
        } catch (e) {
          const error = e as Error;
          for (const target of targets) {
            if (
              isAddressEqual(target.creditManager, cmAddr) &&
              isAddressEqual(this.#getCollateralToken(target), token)
            ) {
              recordSetupError(target, error);
            }
          }
          this.#logger?.error(error);
        }
      }
    }

    const accounts: OpenAccountResult[] = [];
    let success = 0;
    await this.#environment.grantKycAccess(targets, {
      onTargetError: (target, error) => {
        recordSetupError(target as TargetAccount, error);
        this.#logger?.error(error);
      },
    });
    // pool deposits and environment setup above changed the state prepare reads
    await this.#environment.sync();
    for (const [i, target] of targets.entries()) {
      const label = `account #${i + 1}/${targets.length}`;
      const errors = setupErrors.get(target);
      if (errors) {
        const error =
          errors.length === 1
            ? errors[0]
            : new AggregateError(
                errors,
                "multiple account setup operations failed",
              );
        this.#logger?.error(
          new Error(`skipping ${label}, its setup failed`, {
            cause: error,
          }),
        );
        accounts.push({ input: target, error });
        continue;
      }
      const result = await this.#openAccount(target, i + 1, targets.length);
      accounts.push(result);
      if (result.account) success += 1;
      if (result.error) {
        this.#logger?.error(
          new Error(`failed to open ${label}`, { cause: result.error }),
        );
      }
    }
    this.#logger?.info(`opened ${success}/${targets.length} accounts`);
    try {
      await this.#environment.distributeTokens(
        accounts.map(({ account, input }) => ({
          creditAccount: account?.creditAccount,
          directTransfer: input.directTransfer,
        })),
      );
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
    let logger: ILogger | undefined;
    let preview: OpenAccountPreview;
    try {
      const cm = this.sdk.marketRegister.findCreditManager(input.creditManager);
      logger = this.#logger?.child?.({
        creditManager: cm.name,
        target: this.sdk.tokensMeta.symbol(input.target),
      });
      logger?.debug(`opening account #${index}/${total}`);
      preview = await this.prepareOpen(input);
    } catch (e) {
      return { input, error: e as Error };
    }
    const borrower = await this.#environment.getBorrower();
    const humanizedInput = this.#humanizePreview(input, preview);

    let hash: Hash;
    try {
      hash = await sendRawTx(this.#environment.anvil, {
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
    const receipt = await this.#environment.anvil.waitForTransactionReceipt({
      hash,
    });
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
      abi: iCreditFacadeV310Abi,
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
        account = await this.sdk.accounts.getCreditAccountData(
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
    await this.#ensureAttached();
    const { creditManager, target, slippage = 50, directTransfer = [] } = input;

    const borrower = await this.#environment.getBorrower();
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(target);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      target: symbol,
    });
    const leverage = this.#getLeverage(input);
    const collateral = this.#getCollateral(input);
    logger?.debug(
      {
        collateral: this.sdk.tokensMeta.formatBN(collateral, { symbol: true }),
        leverage: leverage.toString(),
      },
      "looking for open strategy",
    );

    // The environment owns funding: it mints the shortfall when minting is enabled
    // and throws a contextual error when the borrower still cannot cover it.
    const borrowerBalance = await this.#environment.ensureTokenBalance(
      borrower.address,
      collateral.token,
      collateral.balance,
    );
    this.#logger?.debug(
      `borrower balance: ${this.sdk.tokensMeta.formatBN(collateral.token, borrowerBalance, { symbol: true })}`,
    );

    const { prepare, execute } = this.#gearbox.opportunities;
    const chainId = this.sdk.chainId;
    const sim = await prepare.openNewStrategy(
      { chainId, creditManager: cm.creditManager.address },
      {
        collateral: [collateral],
        leverage: (leverage * LEVERAGE_DECIMALS) / PERCENTAGE_FACTOR,
        targetToken: target,
        slippage,
      },
    );
    if (!sim.ok) {
      throw new Error(
        `failed to prepare open strategy: ${sim.error.code}: ${sim.error.message}`,
        { cause: sim.error },
      );
    }
    const { state } = sim.data;
    const calls = await this.#environment.decorateOpenCalls(cm, state.calls);
    logger?.debug(
      { calls: calls.length, totalDebt: state.totalDebt.value },
      "found open strategy",
    );

    const directQuotas = directTransfer.map(token => ({
      token,
      balance: DIRECT_TRANSFERS_QUOTA,
    }));
    const averageQuota = [...state.averageQuota, ...directQuotas];
    const minQuota = [...state.minQuota, ...directQuotas];
    logger?.debug({ averageQuota, minQuota }, "calculated quotas");

    const tx = await execute.buildTx({
      kind: "open",
      chainId,
      creditManager: cm.creditManager.address,
      wallet: borrower.address,
      sim: {
        ...sim,
        data: {
          ...sim.data,
          state: { ...state, calls, averageQuota, minQuota },
        },
      },
      collateral: [collateral],
      ethAmount: 0n,
      targetToken: target,
      signaturesToCache: await this.#environment.signRwaRequirements(
        cm,
        target,
      ),
    });
    logger?.debug(
      `open account tx: ${this.sdk.stringifyFunctionData(tx.to, tx.callData)}`,
    );
    logger?.debug("prepared open account transaction");
    return {
      tx,
      leverage,
      collateral,
      minQuota,
      averageQuota,
      slippage,
    };
  }

  public async getOpenedAccounts(): Promise<CreditAccountData[]> {
    await this.#ensureAttached();
    return await this.sdk.accounts.getCreditAccounts({
      owner: this.borrower.address,
    });
  }

  async #depositIntoPools(
    targets: TargetAccount[],
  ): Promise<PoolDepositResult[]> {
    this.#logger?.debug("checking and topping up pools if necessary");

    const minAvailableByPool = new AssetsMap();

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
      minAvailableByPool.inc(cm.pool, amount);
      this.#logger?.debug(
        `target #${i + 1} (${this.labelAddress(t.target)}) needs ${this.sdk.tokensMeta.formatBN(cm.underlying, amount, { symbol: true })} in pool (leverage: ${Number(leverage) / Number(PERCENTAGE_FACTOR)}x)`,
      );
    }

    const deposits: [IPoolContract, bigint][] = [];
    for (const [p, minAvailable] of minAvailableByPool.entries()) {
      const market = this.sdk.marketRegister.findByPool(p);
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
      }
    }
    return this.#environment.topUpPools(this.#gearbox, deposits);
  }

  async #ensureAttached(): Promise<void> {
    await this.#gearbox.attach();
  }

  #getCollateralToken({ creditManager, collateral }: TargetAccount): Address {
    return (
      collateral ??
      this.sdk.marketRegister.findCreditManager(creditManager).underlying
    );
  }

  /**
   * Collateral worth minDebt * minDebtMultiplier in underlying
   */
  #getCollateral(input: TargetAccount): Asset {
    const cm = this.sdk.marketRegister.findCreditManager(input.creditManager);
    const { underlying } = cm;
    const token = this.#getCollateralToken(input);
    const minDebt =
      (this.#minDebtMultiplier * cm.creditFacade.minDebt) / PERCENTAGE_FACTOR;
    if (token.toLowerCase() === underlying.toLowerCase()) {
      return { token, balance: minDebt };
    }
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      cm.creditManager.address,
    );
    return { token, balance: priceOracle.convert(underlying, token, minDebt) };
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
      leverage: Number(preview.leverage) / Number(PERCENTAGE_FACTOR),
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
    return this.#environment.faucet;
  }
}
