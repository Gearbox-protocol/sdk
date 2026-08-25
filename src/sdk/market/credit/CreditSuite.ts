import { type Address, isAddressEqual } from "viem";
import type {
  StrategyOpportunity,
  StrategyOpportunityDetail,
  Timestamp,
  Token,
} from "../../../model/index.js";
import type { CreditAccountData, CreditSuiteState } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import {
  getLegacyStrategyTarget,
  isSunsetStrategy,
} from "../../chain/chains.js";
import { MAX_UINT256, PERCENTAGE_FACTOR, RAY } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { IRouterContract } from "../../router/index.js";
import type {
  CreditSuiteStateHuman,
  MultiCall,
  RawTx,
} from "../../types/index.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { AddressMap } from "../../utils/index.js";
import type { MarketConfiguratorContract } from "../MarketConfiguratorContract.js";
import type { MarketSuite } from "../MarketSuite.js";
import {
  calcBorrowApy,
  calcQuotaRate,
  minSeizedAmount,
  optimalHFForPartialLiquidation,
  optimalRepaidAmount,
} from "../math.js";
import type { IRWAFactory, RWAOperationArgs } from "../rwa/types.js";
import { strategyName as formatStrategyName } from "../strategyName.js";
import {
  dominantCollateral,
  isStrategyCollateral,
  pickStrategyTargetCollateral,
  type StrategyCollateralProps,
} from "./collateralUtils.js";
import createCreditConfigurator from "./createCreditConfigurator.js";
import createCreditFacade from "./createCreditFacade.js";
import createCreditManager from "./createCreditManager.js";
import type {
  ICreditConfiguratorContract,
  ICreditFacadeContract,
  ICreditManagerContract,
  LiquidationFees,
  PartialLiquidationParams,
} from "./types.js";

/**
 * Amount of underlying seeded into each pool at market creation to protect
 * from inflation attacks, in raw token units. A suite whose remaining borrow
 * capacity is at or below this is treated as having nothing left to lend.
 **/
const MIN_STRATEGY_BORROW_AMOUNT = 100_000n;

/**
 * SDK aggregate for one credit-manager branch inside a market.
 *
 * @remarks
 * This is the market's "retail branch": it borrows
 * liquidity from the pool to open credit accounts under an isolated mandate.
 * The suite groups the three contracts that define that branch:
 * `creditManager` for debt, collateral, adapters, and account accounting;
 * `creditFacade` for user-facing account operations and multicalls; and
 * `creditConfigurator` for risk-parameter and adapter configuration.
 */
export class CreditSuite extends SDKConstruct {
  /**
   * Pool that supplies underlying liquidity to this credit manager.
   */
  public readonly pool: Address;

  /**
   * Wrapper around the core credit manager contract.
   *
   * @remarks
   * The credit manager owns account accounting, collateral checks, enabled
   * collateral token masks, adapter mappings, debt updates, and liquidation
   * calculations for this branch.
   */
  public readonly creditManager: ICreditManagerContract;
  /**
   * Wrapper around the credit facade contract used to build account
   * transactions such as open, close, liquidate, and multicall.
   */
  public readonly creditFacade: ICreditFacadeContract;
  /**
   * Wrapper around the credit configurator that mutates risk
   * parameters, collateral tokens, adapter permissions, and facade settings.
   */
  public readonly creditConfigurator: ICreditConfiguratorContract;

  /**
   * Original compressor contract snapshot for this credit suite.
   */
  public readonly state: CreditSuiteState;
  /**
   * Human-readable credit manager name from the core contract state.
   */
  public readonly name: string;

  /**
   * Creates a credit suite from one entry in a market compressor snapshot.
   *
   * @param sdk - Attached SDK instance.
   * @param data - Parent market snapshot part that contains the credit suite data.
   */
  constructor(sdk: OnchainSDK, data: CreditSuiteState) {
    super(sdk);
    this.name = data.creditManager.name;

    this.state = data;
    this.pool = data.creditManager.pool;

    this.creditManager = createCreditManager(sdk, this.state);
    this.creditFacade = createCreditFacade(sdk, this.state);
    this.creditConfigurator = createCreditConfigurator(sdk, this.state);
  }

  /**
   * Token borrowed from the pool and used as the account debt asset.
   */
  public get underlying(): Address {
    return this.creditManager.underlying;
  }

  /**
   * Parent market that contains this credit manager
   */
  public get market(): MarketSuite {
    return this.sdk.marketRegister.findByCreditManager(
      this.creditManager.address,
    );
  }

  /**
   * Market configurator that governs this credit suite and its parent pool.
   */
  public get marketConfigurator(): MarketConfiguratorContract {
    return this.market.configurator;
  }

  /**
   * Factory that opens and manages the accounts of this suite, defined only
   * for RWA markets.
   */
  public get rwaFactory(): IRWAFactory | undefined {
    return this.market.rwaFactory;
  }

  /**
   * Builds a transaction that executes a multicall on one of this suite's
   * credit accounts.
   *
   * @param creditAccount - Account to operate on.
   * @param calls - Multicall body.
   * @param rwaOptions - Factory-specific args, ignored on non-RWA markets.
   */
  public multicallTx(
    creditAccount: Address,
    calls: MultiCall[],
    rwaOptions?: RWAOperationArgs,
  ): RawTx {
    const { rwaFactory } = this;
    return rwaFactory
      ? rwaFactory.multicall(creditAccount, calls, rwaOptions)
      : this.creditFacade.multicall(creditAccount, calls);
  }

  /**
   * Builds a transaction that opens a new credit account in this suite.
   *
   * @param to - Owner of the new account.
   * @param calls - Multicall body executed on the new account.
   * @param referralCode - Referral code, facade path only.
   * @param rwaOptions - Factory-specific args, ignored on non-RWA markets.
   */
  public openCreditAccountTx(
    to: Address,
    calls: MultiCall[],
    referralCode?: bigint,
    rwaOptions?: RWAOperationArgs,
  ): RawTx {
    const { rwaFactory } = this;
    return rwaFactory
      ? rwaFactory.openCreditAccount(
          this.creditManager.address,
          calls,
          rwaOptions,
        )
      : this.creditFacade.openCreditAccount(to, calls, referralCode ?? 0n);
  }

  /**
   * Router configured for this credit suite.
   */
  public get router(): IRouterContract {
    return this.sdk.routerFor(this);
  }

  /**
   * Whether this suite's facade is past its configured expiration timestamp.
   *
   * @remarks
   * Expired credit suites can have different liquidation parameters on-chain.
   * Non-expirable facades and facades with zero expiration are treated as not
   * expired.
   */
  public get isExpired(): boolean {
    return (
      this.creditFacade.expirable &&
      this.creditFacade.expirationDate > 0 &&
      this.creditFacade.expirationDate < this.sdk.timestamp
    );
  }

  /**
   * Moment the facade expires, after which positions can no longer be opened
   * and open ones become liquidatable, or `null` when it is not expirable.
   *
   * @remarks
   * The facade stores `0` for a non-expirable suite, which as a timestamp
   * would read as 1970 rather than as "never".
   */
  public get expirationDate(): Timestamp | null {
    const { expirationDate } = this.creditFacade;
    return expirationDate > 0 ? expirationDate : null;
  }

  /**
   * Liquidation fee pair in effect right now, resolving {@link isExpired} once
   * for both.
   */
  public liquidationFees(): LiquidationFees {
    const cm = this.creditManager;
    return this.isExpired
      ? {
          feeLiquidation: cm.feeLiquidationExpired,
          liquidationDiscount: cm.liquidationDiscountExpired,
        }
      : {
          feeLiquidation: cm.feeLiquidation,
          liquidationDiscount: cm.liquidationDiscount,
        };
  }

  /**
   * Whether this suite can be used right now. A paused pool blocks borrowing,
   * so the suite is unusable even when its own facade is live.
   */
  public get isPaused(): boolean {
    return this.creditFacade.isPaused || this.market.pool.isPaused;
  }

  /**
   * Tokens forbidden by the facade.
   */
  public get forbiddenTokens(): Address[] {
    const mask = this.creditFacade.forbiddenTokensMask;
    if (mask === 0n) {
      return [];
    }
    return this.creditManager.collateralTokens.filter(
      (_, i) => (mask & (1n << BigInt(i))) !== 0n,
    );
  }

  /**
   * The single target collateral of this suite's strategy, or `undefined` when
   * none can be resolved.
   *
   * Resolution, in order:
   * 1. a hardcoded legacy mapping for this credit manager, when that token is
   *    still a collateral of the manager (it may be absent on an older
   *    snapshot, or after it was delisted);
   * 2. the collateral with the biggest index in
   *    {@link ICreditManagerContract.collateralTokens} that
   *    {@link isStrategyCollateral} accepts with quota required;
   * 3. the biggest-index collateral that {@link isStrategyCollateral} accepts
   *    without quota.
   */
  public get strategyTargetCollateral(): Address | undefined {
    const legacy = getLegacyStrategyTarget(
      this.creditManager.address,
      this.chainId,
    );
    if (legacy && this.creditManager.liquidationThresholds.has(legacy)) {
      return legacy;
    }

    return pickStrategyTargetCollateral(
      this.creditManager.collateralTokens.map(token =>
        this.#strategyCollateralProps(token),
      ),
    );
  }

  /**
   * Largest debt a single new position can take on right now: the tightest of
   * this manager's remaining debt limit, the pool's free liquidity and the
   * facade's per-account maximum.
   */
  public get maxBorrowAmount(): bigint {
    const { pool } = this.market.pool;
    const debtParams = pool.creditManagerDebtParams.get(
      this.creditManager.address,
    );
    return BigIntMath.min(
      debtParams?.available ?? MAX_UINT256,
      pool.availableLiquidity,
      this.creditFacade.maxDebt,
    );
  }

  /**
   * Display name of this suite's leveraged strategy, e.g. `"wstETH / WETH"`,
   * or `undefined` when {@link strategyTargetCollateral} cannot be resolved.
   */
  public get strategyName(): string | undefined {
    const collateral = this.strategyTargetCollateral;
    if (!collateral) {
      return undefined;
    }
    return formatStrategyName(
      this.tokensMeta.mustGetToken(collateral),
      this.market.underlyingToken,
    );
  }

  /**
   * Describes this suite's leveraged strategy as the shared read model does,
   * or `undefined` when {@link strategyTargetCollateral} cannot be resolved or
   * {@link maxBorrowAmount} is at or below {@link MIN_STRATEGY_BORROW_AMOUNT}.
   */
  public strategyOpportunity(): StrategyOpportunity | undefined {
    if (this.maxBorrowAmount <= MIN_STRATEGY_BORROW_AMOUNT) {
      return undefined;
    }

    const collateral = this.strategyTargetCollateral;
    if (!collateral) {
      return undefined;
    }

    const { market, creditManager: cm } = this;
    const { pool } = market.pool;
    const oracle = market.priceOracle;

    const liquidationThreshold = cm.liquidationThresholds.mustGet(collateral);
    const maxLeverage = cm.maxLeverage(collateral);
    const debtParams = pool.creditManagerDebtParams.get(cm.address);
    const borrowed = debtParams?.borrowed ?? 0n;

    return {
      kind: "strategy",
      chainId: this.chainId,
      creditManager: cm.address,
      targetCollateral: this.tokensMeta.mustGetToken(collateral),
      name: this.strategyName ?? this.market.underlyingToken.symbol,
      curator: market.curator,
      underlyingToken: market.underlyingToken,
      totalBorrow: oracle.toAmount(pool.underlying, borrowed),
      allowedDepositTokens: this.#allowedDepositTokens(collateral),
      paused: this.isPaused,
      rwa: market.rwa,
      // a pool being wound down takes every strategy borrowing from it with it
      sunset:
        market.sunset || isSunsetStrategy(cm.address, this.sdk.networkType),
      liquidationThreshold,
      liquidationPremium: cm.liquidationPremium,
      liquidationFee: cm.feeLiquidation,
      expirationDate: this.expirationDate,
      borrowApy: calcBorrowApy(pool.baseInterestRate, cm.feeInterest),
      quotaRate: calcQuotaRate(
        market.pool.pqk.quotaRate(collateral),
        cm.feeInterest,
      ),
      availableLiquidity: oracle.toAmount(
        pool.underlying,
        pool.availableLiquidity,
      ),
      minDebt: oracle.toAmount(pool.underlying, this.creditFacade.minDebt),
      totalDebtLimit: oracle.toAmount(pool.underlying, debtParams?.limit ?? 0n),
      maxBorrowAmount: oracle.toAmount(pool.underlying, this.maxBorrowAmount),
      maxLeverage,
    };
  }

  /**
   * {@link strategyOpportunity} plus the data only its detail screen needs.
   */
  public strategyOpportunityDetail(): StrategyOpportunityDetail | undefined {
    const opportunity = this.strategyOpportunity();
    if (!opportunity) {
      return undefined;
    }
    return {
      ...opportunity,
      rateCurve: this.market.pool.rateCurve,
      priceFeeds: this.market.priceFeedSummary(
        opportunity.targetCollateral.address,
      ),
    };
  }

  /**
   * Everything a partial liquidation of credit account needs, with any parameter the
   * caller pinned down taken as given and the rest derived from current state.
   *
   * @param ca - Credit account to partially liquidate.
   * @param overrides - Parameters to use instead of the derived defaults.
   * @throws If a derived `tokenOut` cannot be picked, or if the seized token is
   * not a collateral token of this credit manager.
   */
  public partialLiquidationParams(
    ca: CreditAccountData,
    overrides: PartialLiquidationParams = {},
  ): Required<PartialLiquidationParams> {
    const tokenOut = overrides.tokenOut ?? this.#bestTokenOut(ca);
    const optimalHF =
      overrides.optimalHF ?? this.optimalHFForPartialLiquidation(ca);
    const repaidAmount =
      overrides.repaidAmount ??
      this.#optimalRepaidAmount(ca, tokenOut, optimalHF);
    const minSeizedAmount =
      overrides.minSeizedAmount ??
      this.#minSeizedAmount(tokenOut, repaidAmount);
    return { tokenOut, optimalHF, repaidAmount, minSeizedAmount };
  }

  /**
   * Health factor a partial liquidation of `ca` should target, in basis points.
   *
   * @param ca - Credit account to partially liquidate.
   */
  public optimalHFForPartialLiquidation(ca: CreditAccountData): bigint {
    return optimalHFForPartialLiquidation(this.#borrowRate(ca));
  }

  /**
   * Collateral token a partial liquidation seizes by default.
   *
   * Ported from solidity:
   * https://github.com/Gearbox-protocol/router-v3/blob/main/contracts/liquidation/AbstractLiquidator.sol#L270
   */
  #bestTokenOut(ca: CreditAccountData): Address {
    const collateral = dominantCollateral(ca, this.market);
    if (!collateral) {
      throw new Error(
        `cannot determine tokenOut for partial liquidation of ${this.labelAddress(ca.creditAccount)}: no enabled non-underlying collateral with value`,
      );
    }
    return collateral;
  }

  /**
   * Tokens a user can transfer from their wallet when opening an account in
   * this suite:
   *
   * 1. unwrapped underlying (USDC, never dcUSDC)
   * 2. target collateral
   * 3. remaining CM collaterals in manager order, no phantoms
   */
  #allowedDepositTokens(targetCollateral: Address): Token[] {
    const unwrappedUnderlying = this.market.unwrappedUnderlying;
    const contractUnderlying = this.underlying;
    const skip = (token: Address) =>
      isAddressEqual(token, unwrappedUnderlying) ||
      isAddressEqual(token, contractUnderlying) ||
      isAddressEqual(token, targetCollateral);

    const rest = this.creditManager.collateralTokens.filter(token => {
      const contractType = this.tokensMeta.mustGet(token).contractType;
      return !skip(token) && !contractType?.startsWith("PHANTOM_TOKEN::");
    });

    return [unwrappedUnderlying, targetCollateral, ...rest].map(token =>
      this.tokensMeta.mustGetToken(token),
    );
  }

  /**
   * Shared inputs of {@link isStrategyCollateral} for one of this suite's
   * collateral tokens.
   */
  #strategyCollateralProps(token: Address): StrategyCollateralProps {
    const meta = this.tokensMeta.mustGet(token);
    return {
      token,
      underlying: this.creditManager.underlying,
      unwrappedUnderlying: this.market.pool.unwrappedUnderlying,
      liquidationThreshold:
        this.creditManager.liquidationThresholds.mustGet(token),
      contractType: meta.contractType,
      isExpired: meta.isExpired,
      // PriceFeedCompressor guarantees price == 0 whenever success == false,
      // so the success flag needs no separate check
      mainPrice: this.market.priceOracle.mainPrices.get(token)?.price,
      hasActiveQuota: this.market.pool.pqk.hasActiveQuota(token),
    };
  }

  /**
   * Minimum amount of `token` that must be seized when repaying `repaidAmount`
   * of underlying.
   */
  #minSeizedAmount(token: Address, repaidAmount: bigint): bigint {
    const { market } = this;
    const tokenAmount = market.priceOracle.convert(
      market.underlying,
      token,
      repaidAmount,
    );
    return minSeizedAmount(
      tokenAmount,
      this.liquidationFees().liquidationDiscount,
    );
  }

  /**
   * Amount of underlying to repay to bring `ca`'s health factor close to
   * `optimalHF` by seizing `token`.
   *
   * @throws If `token` is not a collateral token of this credit manager.
   */
  #optimalRepaidAmount(
    ca: CreditAccountData,
    token: Address,
    optimalHF: bigint,
  ): bigint {
    const { creditManager: cm, market } = this;
    const { feeLiquidation, liquidationDiscount } = this.liquidationFees();

    const ltTokenOut = cm.liquidationThresholds.get(token);
    if (ltTokenOut === undefined) {
      throw new Error(
        `token ${this.labelAddress(token)} is not a collateral token in credit manager ${this.labelAddress(cm.address)}`,
      );
    }

    return optimalRepaidAmount({
      totalDebt: ca.debt + ca.accruedInterest + ca.accruedFees,
      twvUnderlying: market.priceOracle.convertFromUSD(
        market.underlying,
        ca.twvUSD,
      ),
      minDebt: this.creditFacade.minDebt,
      optimalHF,
      discount: BigInt(liquidationDiscount) - BigInt(feeLiquidation),
      ltTokenOut: BigInt(ltTokenOut),
    });
  }

  /**
   * Blended annual cost of credit account's debt, in basis points: base interest weighted
   * by the account's share of its own total debt, plus the quota rates of the
   * collaterals it actually holds, both marked up by the interest fee.
   */
  #borrowRate(ca: CreditAccountData): bigint {
    // R = Debt * baserate with fee / (total value or debt)
    // Qr = sum(quota rate * quota amount) * (1+fee) / (total value or debt)
    // Total = r+qr
    const { creditManager } = this;
    const { pool } = this.market;
    const { feeInterest } = creditManager;
    const { baseInterestRate } = pool.pool;
    const baseRateWithFee =
      baseInterestRate * (BigInt(feeInterest) + PERCENTAGE_FACTOR);
    const totalDebt = ca.debt + ca.accruedInterest + ca.accruedFees;
    const r = (ca.debt * baseRateWithFee) / (totalDebt * RAY);

    const caTokens = new AddressMap(ca.tokens.map(t => [t.token, t]));
    let qr = 0n;

    for (const t of creditManager.collateralTokens) {
      const b = caTokens.get(t);
      if (b) {
        qr += b.quota * BigInt(pool.pqk.quotas.get(t)?.rate ?? 0);
      }
    }
    qr = (qr * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;
    qr /= totalDebt;
    return r + qr;
  }

  /**
   * Whether the facade, manager, or configurator has observed logs that require
   * a credit-suite resync.
   */
  override get dirty(): boolean {
    // TODO: any other ways to get dirty, adapters maybe?
    return (
      this.creditFacade.dirty ||
      this.creditManager.dirty ||
      this.creditConfigurator.dirty
    );
  }

  /**
   * Credit contracts whose events are enough to detect stale suite state.
   *
   * @internal
   */
  public override get watchAddresses(): Set<Address> {
    return new Set([
      this.creditConfigurator.address,
      this.creditManager.address,
      this.creditFacade.address,
    ]);
  }

  /**
   * Returns a label-enriched, JSON-friendly view of this credit suite.
   *
   * @param raw - Whether child wrappers should keep raw numeric values instead
   * of applying human formatting where they support both modes.
   */
  public stateHuman(raw = true): CreditSuiteStateHuman {
    return {
      isExpired: this.isExpired,
      creditFacade: this.creditFacade.stateHuman(raw),
      creditManager: this.creditManager.stateHuman(raw),
      creditConfigurator: this.creditConfigurator.stateHuman(raw),
    };
  }
}
