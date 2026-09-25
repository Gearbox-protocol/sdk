import { type Address, isAddressEqual } from "viem";
import type {
  KycRequirement,
  StrategyOpportunity,
  StrategyOpportunityDetail,
  Token,
} from "../../../model/index.js";
import { isSunsetStrategy } from "../../chain/chains.js";
import { calcBorrowApy, calcQuotaRate } from "../math.js";
import { strategyName as formatStrategyName } from "../strategyName.js";
import type { CreditSuite } from "./CreditSuite.js";
import type { MaxBorrowAmount } from "./types.js";

/**
 * Amount of underlying seeded into each pool at market creation to protect
 * from inflation attacks, in raw token units. A strategy whose
 * {@link CreditSuiteStrategy.maxBorrowAmount} is at or below this is treated
 * as having nothing left to lend.
 **/
const MIN_STRATEGY_BORROW_AMOUNT = 100_000n;

/**
 * The leveraged strategy a credit suite runs: one target collateral bought
 * with underlying borrowed from the pool.
 *
 * A view over live suite state, see {@link CreditSuite.strategy}.
 */
export class CreditSuiteStrategy {
  /**
   * Credit suite this strategy borrows through.
   */
  public readonly suite: CreditSuite;
  /**
   * Collateral token a position in this strategy is built to hold.
   */
  public readonly targetCollateral: Address;

  constructor(suite: CreditSuite, targetCollateral: Address) {
    this.suite = suite;
    this.targetCollateral = targetCollateral;
  }

  /**
   * {@link targetCollateral} as the shared read model describes it.
   */
  public get token(): Token {
    return this.suite.sdk.tokensMeta.mustGetToken(this.targetCollateral);
  }

  /**
   * Display name of this strategy, e.g. `"wstETH / WETH"`.
   */
  public get name(): string {
    return formatStrategyName(this.token, this.suite.underlyingToken);
  }

  /**
   * Tokens a user can transfer from their wallet when opening a position in
   * this strategy:
   *
   * 1. unwrapped underlying (USDC, never dcUSDC)
   * 2. target collateral
   * 3. remaining CM collaterals in manager order, excluding phantom tokens
   *    and tokens without price
   */
  public get allowedDepositTokens(): Token[] {
    const { market, creditManager, sdk } = this.suite;
    const { tokensMeta } = sdk;
    const { targetCollateral } = this;
    const { mainPrices, reservePrices } = market.priceOracle;

    const rest = creditManager.collateralTokens.filter(token => {
      const contractType = tokensMeta.mustGet(token).contractType;
      return (
        !market.isUnderlyingLike(token) &&
        !isAddressEqual(token, targetCollateral) &&
        !contractType?.startsWith("PHANTOM_TOKEN::") &&
        (!!mainPrices.get(token)?.price || !!reservePrices.get(token)?.price)
      );
    });

    return [market.unwrappedUnderlying, targetCollateral, ...rest].map(token =>
      tokensMeta.mustGetToken(token),
    );
  }

  /**
   * Largest debt one new position can take right now, and which limit set
   * that number.
   *
   * `amount` is `0` whenever no position can be opened right now,
   * and `limit` explains why.
   *
   */
  public maxBorrowAmount(): MaxBorrowAmount {
    const { suite } = this;
    const lends = suite.maxBorrowAmount();
    if (lends.limit === "debtPerBlockLimit") {
      return lends;
    }

    // A tie keeps the market's own limit, which binds first.
    let value = lends.amount.value;
    let limit = lends.limit;
    const quota = suite.market.pool.pqk.quotaAvailable(this.targetCollateral);
    if (quota < value) {
      value = quota;
      limit = "quotaAvailable";
    }

    // The facade refuses every debt below minDebt, so a capacity under it
    // funds no position at all.
    if (value < suite.creditFacade.minDebt) {
      return {
        amount: suite.market.toUnderlyingAmount(0n),
        limit: "minDebt",
      };
    }

    return { amount: suite.market.toUnderlyingAmount(value), limit };
  }

  /**
   * Whether this strategy is offered as an opportunity right now: it lends
   * more than the pool's seed amount, and its target can be opened today.
   */
  public get isListed(): boolean {
    return (
      this.maxBorrowAmount().amount.value > MIN_STRATEGY_BORROW_AMOUNT &&
      // Lookup is lenient because the target also names existing positions:
      // a legacy target skips the collateral check, and a picked one may lack quota.
      // Listing needs a target that can be opened today.
      this.suite.isStrategyCollateral(this.targetCollateral, true)
    );
  }

  /**
   * Describes this strategy as the shared read model does. Whether it is
   * listed at all is {@link isListed}.
   */
  public opportunity(): StrategyOpportunity {
    const { suite, targetCollateral } = this;
    const { market, creditManager: cm } = suite;
    const { pool } = market.pool;
    const oracle = market.priceOracle;

    const debtParams = pool.creditManagerDebtParams.get(cm.address);
    const borrowed = debtParams?.borrowed ?? 0n;

    return {
      kind: "strategy",
      chainId: suite.chainId,
      creditManager: cm.address,
      targetCollateral: this.token,
      name: this.name,
      curator: market.curator,
      underlyingToken: suite.underlyingToken,
      totalBorrowed: oracle.toAmount(pool.underlying, borrowed),
      allowedDepositTokens: this.allowedDepositTokens,
      paused: suite.isPaused,
      rwa: market.rwa,
      // a pool being wound down takes every strategy borrowing from it with it
      sunset:
        market.sunset || isSunsetStrategy(cm.address, suite.sdk.networkType),
      liquidationThreshold: cm.liquidationThresholds.mustGet(targetCollateral),
      liquidationPremium: cm.liquidationPremium,
      liquidationFee: cm.feeLiquidation,
      expirationDate: suite.expirationDate,
      borrowApy: calcBorrowApy(pool.baseInterestRate, cm.feeInterest),
      quotaRate: calcQuotaRate(
        market.pool.pqk.quotaRate(targetCollateral),
        cm.feeInterest,
      ),
      availableLiquidity: oracle.toAmount(
        pool.underlying,
        pool.availableLiquidity,
      ),
      minDebt: oracle.toAmount(pool.underlying, suite.creditFacade.minDebt),
      totalDebtLimit: oracle.toAmount(pool.underlying, debtParams?.limit ?? 0n),
      maxBorrowAmount: oracle.toAmount(
        pool.underlying,
        this.maxBorrowAmount().amount.value,
      ),
      maxLeverage: cm.maxLeverage(targetCollateral),
    };
  }

  /**
   * {@link opportunity} plus the data only its detail screen needs.
   */
  public opportunityDetail(): StrategyOpportunityDetail {
    const { market } = this.suite;
    return {
      ...this.opportunity(),
      rateCurve: market.pool.rateCurve,
      priceFeeds: market.priceFeedSummary(this.targetCollateral),
    };
  }

  /**
   * The KYC gate of this strategy; `null` when there is none.
   * Wallet-independent.
   */
  public async kycRequirement(): Promise<KycRequirement | null> {
    const nft = await this.suite.degenNFT();
    if (!nft) {
      return null;
    }
    const tokens = await nft.getTokens();
    const token =
      tokens.find(t => isAddressEqual(t, this.targetCollateral)) ?? tokens[0];
    return {
      protocol: nft.protocol,
      token: token ? this.suite.sdk.tokensMeta.getToken(token) : undefined,
      registrationLink: nft.registrationLink,
    };
  }

  /**
   * Whether `wallet` may open this strategy today; `true` when there is no
   * KYC gate.
   */
  public async isEligible(wallet: Address): Promise<boolean> {
    const nft = await this.suite.degenNFT();
    if (!nft) {
      return true;
    }
    const requirements = await nft.getOpenAccountRequirements(wallet, {
      tokenOutAddress: this.targetCollateral,
    });
    return nft.isRegistered(requirements);
  }
}
