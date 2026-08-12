import type { Address } from "viem";
import type {
  Bps,
  StrategyOpportunity,
  StrategyOpportunityDetail,
  Timestamp,
} from "../../../model/index.js";
import type { CreditAccountData, CreditSuiteState } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import { isSunsetStrategy } from "../../chain/chains.js";
import { MAX_UINT256, PERCENTAGE_FACTOR, RAY } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { IRouterContract } from "../../router/index.js";
import type { CreditSuiteStateHuman } from "../../types/index.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { AddressMap } from "../../utils/index.js";
import type { MarketConfiguratorContract } from "../MarketConfiguratorContract.js";
import type { MarketSuite } from "../MarketSuite.js";
import {
  additionalBorrowApyBps,
  borrowApyBps,
  minSeizedAmount,
  optimalHFForPartialLiquidation,
  optimalRepaidAmount,
} from "../math.js";
import createCreditConfigurator from "./createCreditConfigurator.js";
import createCreditFacade from "./createCreditFacade.js";
import createCreditManager from "./createCreditManager.js";
import { mustGetDominantCollateral } from "./dominantCollateral.js";
import type {
  ICreditConfiguratorContract,
  ICreditFacadeContract,
  ICreditManagerContract,
  LiquidationFees,
  PartialLiquidationParams,
} from "./types.js";

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
   * Collateral tokens a leveraged position can be built around in this suite:
   * the ones the credit manager can lever up, narrowed to those the market
   * still accepts quota for.
   */
  public get strategyCollaterals(): Address[] {
    const { pqk } = this.market.pool;
    return this.creditManager.leverageableCollaterals.filter(token =>
      pqk.hasActiveQuota(token),
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
   * Display name of a leveraged position built on one collateral token, e.g.
   * `"wstETH / WETH"`.
   *
   * @param collateral - Target collateral of the position.
   */
  public strategyName(collateral: Address): string {
    return `${this.tokensMeta.symbol(collateral)} / ${this.market.underlyingToken.symbol}`;
  }

  /**
   * Describes a leveraged position built on one collateral token as the shared
   * read model does.
   *
   * @param collateral - Target collateral of the position.
   * @throws If the credit manager does not value the collateral.
   */
  public strategyOpportunity(collateral: Address): StrategyOpportunity {
    const { market, creditManager: cm } = this;
    const { pool } = market.pool;
    const oracle = market.priceOracle;

    const liquidationThreshold = cm.liquidationThresholds.mustGet(collateral);
    const maxLeverage = cm.maxLeverage(collateral);
    const borrowed =
      pool.creditManagerDebtParams.get(cm.address)?.borrowed ?? 0n;

    return {
      kind: "strategy",
      chainId: this.chainId,
      creditManager: cm.address,
      targetCollateral: this.tokensMeta.mustGetToken(collateral),
      name: this.strategyName(collateral),
      curator: market.curator,
      underlyingToken: market.underlyingToken,
      totalBorrow: oracle.toAmount(pool.underlying, borrowed),
      collateralTokens: market.collateralTokens,
      paused: this.isPaused,
      rwa: market.rwa,
      sunset: isSunsetStrategy(cm.address, collateral, this.sdk.networkType),
      liquidationThreshold,
      liquidationPremium: cm.liquidationPremium,
      liquidationFee: cm.feeLiquidation,
      expirationDate: this.expirationDate,
      borrowApy: borrowApyBps(pool.baseInterestRate, cm.feeInterest),
      additionalBorrowApy: additionalBorrowApyBps(
        market.pool.pqk.quotaRate(collateral),
        maxLeverage,
      ),
      maxBorrowAmount: oracle.toAmount(pool.underlying, this.maxBorrowAmount),
      maxLeverage,
    };
  }

  /**
   * {@link strategyOpportunity} plus the data only its detail screen needs.
   *
   * @param collateral - Target collateral of the position.
   */
  public strategyOpportunityDetail(
    collateral: Address,
  ): StrategyOpportunityDetail {
    return {
      ...this.strategyOpportunity(collateral),
      rateCurve: this.market.pool.rateCurve,
      priceFeeds: this.market.priceFeedSummary(collateral),
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
    return mustGetDominantCollateral(ca, this.market);
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
