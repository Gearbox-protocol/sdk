import type { Address, Hex } from "viem";
import type { Bps, Leverage } from "../../../model/index.js";
import type {
  PermitResult,
  PrepareUpdateQuotasProps,
} from "../../accounts/types.js";
import type {
  AssertAssignable,
  Asset,
  CreditFacadeState,
  CreditManagerState,
  IBaseContract,
} from "../../base/index.js";
import type {
  CreditConfiguratorStateHuman,
  CreditFacadeStateHuman,
  CreditManagerStateHuman,
  MultiCall,
  RawTx,
} from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type { IAdapterContract } from "../adapters/index.js";
import type { PriceUpdate } from "../pricefeeds/index.js";
import type { RampEvent } from "./CreditConfiguratorV310Contract.js";

export interface ICreditConfiguratorContract extends IBaseContract {
  isPaused: boolean;

  checkRamps: () => Promise<RampEvent[]>;
  stateHuman: (raw?: boolean) => CreditConfiguratorStateHuman;
}

/**
 * Fee parameters of a liquidation, with the suite's expiration already resolved.
 **/
export interface LiquidationFees {
  /** Protocol's cut of the liquidated collateral, in basis points. */
  feeLiquidation: Bps;
  /** Price the liquidator pays for collateral, in basis points. */
  liquidationDiscount: Bps;
}

/**
 * Expected balance change of one token, as the facade's `storeExpectedBalances`
 * takes it. Negative amounts mark tokens the multicall spends.
 */
export interface BalanceDelta {
  token: Address;
  /**
   * Signed balance change, `int256` on-chain.
   */
  amount: bigint;
}

/**
 * Quota a credit account currently holds for one token, in pool underlying
 * units. Enough to decide whether the quota needs a disabling call.
 */
export interface CreditAccountTokenQuota {
  token: Address;
  quota: bigint;
}

/**
 * Wrapper around the core credit manager contract.
 */
export interface ICreditManagerContract extends IBaseContract {
  /**
   * Account factory contract address.
   */
  accountFactory: Address;
  /**
   * Underlying token address.
   */
  underlying: Address;
  /**
   * Address of the pool credit manager is connected to.
   */
  pool: Address;
  /**
   * Address of the connected credit facade.
   */
  creditFacade: Address;
  /**
   * Address of the connected credit configurator.
   */
  creditConfigurator: Address;
  /**
   * Maximum number of tokens that a credit account can have enabled as collateral.
   */
  maxEnabledTokens: number;
  /**
   * Percentage of accrued interest in bps taken by the protocol as profit.
   */
  feeInterest: number;
  /**
   * Percentage of liquidated account value in bps taken by the protocol as profit.
   */
  feeLiquidation: number;
  /**
   * Percentage of liquidated account value in bps that is used to repay debt
   * (i.e. `100% - liquidation premium`).
   */
  liquidationDiscount: number;
  /**
   * Percentage of liquidated expired account value in bps taken by the protocol as profit.
   */
  feeLiquidationExpired: number;
  /**
   * Percentage of liquidated expired account value in bps that is used to repay debt.
   */
  liquidationDiscountExpired: number;

  /**
   * Mapping targetContract => adapter
   */
  adapters: AddressMap<IAdapterContract>;
  /**
   * Mapping collateral token address => liquidation threshold
   */
  liquidationThresholds: AddressMap<number>;
  /**
   * List of collateral tokens
   */
  collateralTokens: Address[];

  /**
   * Collateral tokens a leveraged position can be built around: the underlying
   * is excluded, because borrowing an asset against itself is not a position,
   * and so is anything whose liquidation threshold is `0` or at least `100%`,
   * which would mean unbounded leverage.
   */
  readonly leverageableCollaterals: Address[];

  /**
   * Percentage of liquidated account value in bps paid to the liquidator
   * (i.e. `100% - liquidationDiscount`).
   */
  readonly liquidationPremium: Bps;

  /**
   * Highest leverage a collateral's liquidation threshold allows,
   * `1 / (1 - lt)`.
   *
   * @param collateral - Collateral token address.
   * @throws If the credit manager does not value the token.
   */
  maxLeverage: (collateral: Address) => Leverage;

  stateHuman: (raw?: boolean) => CreditManagerStateHuman;
}

/**
 * Wrapper around the credit facade contract used to build account
 * transactions such as open, close, liquidate, and multicall.
 */
export interface ICreditFacadeContract extends IBaseContract {
  /**
   * Degen NFT address (`address(0)` when Degen mode is disabled).
   */
  degenNFT: Address;
  /**
   * Bot list address.
   */
  botList: Address;
  /**
   * Whether the credit facade is expirable.
   */
  expirable: boolean;
  /**
   * Expiration timestamp (only meaningful when `expirable` is `true`).
   */
  expirationDate: number;
  /**
   * Maximum amount that can be borrowed by a credit manager in a single
   * block, expressed as a multiple of `maxDebt`.
   */
  maxDebtPerBlockMultiplier: number;
  /**
   * Minimum credit account debt allowed by the facade, in underlying.
   */
  minDebt: bigint;
  /**
   * Maximum credit account debt allowed by the facade, in underlying.
   */
  maxDebt: bigint;
  /**
   * Bit mask encoding the set of forbidden tokens.
   */
  forbiddenTokensMask: bigint;
  /**
   * Whether the facade is currently paused.
   */
  isPaused: boolean;

  /**
   * Underlying token of the connected credit manager.
   */
  readonly underlying: Address;

  stateHuman: (raw?: boolean) => CreditFacadeStateHuman;

  /**
   * Builds a raw transaction that liquidates a credit account.
   *
   * @param ca Credit account to liquidate.
   * @param to Recipient of the liquidator's reward.
   * @param calls Multicall body executed during liquidation.
   * @param lossPolicyData Optional loss policy payload forwarded to the facade.
   */
  liquidateCreditAccount(
    ca: Address,
    to: Address,
    calls: MultiCall[],
    lossPolicyData?: Hex,
  ): RawTx;

  /**
   * Builds a raw transaction that partially liquidates a credit account's
   * debt in exchange for discounted collateral.
   */
  partiallyLiquidateCreditAccount(
    ca: Address,
    token: Address,
    repaidAmount: bigint,
    minSeizedAmount: bigint,
    to: Address,
    updates: PriceUpdate[],
  ): RawTx;

  /**
   * Builds a raw transaction that closes a credit account.
   */
  closeCreditAccount(ca: Address, calls: MultiCall[]): RawTx;

  /**
   * Builds a raw transaction that executes an owner-driven multicall on a
   * credit account.
   */
  multicall(ca: Address, calls: MultiCall[]): RawTx;

  /**
   * Builds a raw transaction that executes a bot-driven multicall on a
   * credit account.
   */
  botMulticall(ca: Address, calls: MultiCall[]): RawTx;

  /**
   * Builds a raw transaction that opens a new credit account.
   */
  openCreditAccount(
    to: Address,
    calls: MultiCall[],
    referralCode: bigint,
  ): RawTx;

  /**
   * Encodes an `increaseDebt` multicall entry.
   */
  prepareIncreaseDebt(amount: bigint): MultiCall;

  /**
   * Encodes an `increaseDebt` or `decreaseDebt` multicall entry.
   */
  prepareChangeDebt(change: bigint, isDecrease: boolean): MultiCall;

  /**
   * Encodes a `decreaseDebt` multicall entry that repays the whole debt.
   */
  prepareDecreaseDebtFull(): MultiCall;

  /**
   * Encodes a `withdrawCollateral` multicall entry.
   */
  prepareWithdrawCollateral(
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall;

  /**
   * Encodes `addCollateral` / `addCollateralWithPermit` multicall entries, one
   * per asset, using the permit when one is available for the asset's token.
   */
  prepareAddCollateral(
    assets: Asset[],
    permits: Record<string, PermitResult>,
  ): MultiCall[];

  /**
   * Encodes `updateQuota` multicall entries from average and min quota assets.
   */
  prepareUpdateQuotas(props: PrepareUpdateQuotasProps): MultiCall[];

  /**
   * Encodes `updateQuota` multicall entries that zero out the quotas the
   * account currently holds.
   */
  prepareDisableQuotas(tokens: CreditAccountTokenQuota[]): MultiCall[];

  /**
   * Encodes a `setBotPermissions` multicall entry.
   */
  prepareSetBotPermissions(bot: Address, permissions: bigint): MultiCall;

  /**
   * Encodes an `onDemandPriceUpdates` multicall entry.
   */
  prepareOnDemandPriceUpdates(updates: PriceUpdate[]): MultiCall;

  /**
   * Encodes a `storeExpectedBalances` multicall entry.
   */
  prepareStoreExpectedBalances(deltas: BalanceDelta[]): MultiCall;

  /**
   * Encodes a `compareBalances` multicall entry.
   */
  prepareCompareBalances(): MultiCall;
}

/**
 * Partial liquidation parameters a caller wants to pin down instead of letting
 * {@link CreditSuite.partialLiquidationParams} derive them.
 *
 * @remarks
 * The defaults are derived in order - `optimalHF` feeds `repaidAmount`, which
 * feeds `minSeizedAmount` - so overriding one still lets the ones after it
 * follow from the override.
 **/
export interface PartialLiquidationParams {
  /**
   * Collateral token to seize.
   * If omitted, the most valuable enabled non-underlying collateral token
   * (by oracle)
   */
  tokenOut?: Address;
  /**
   * Amount of underlying token to repay.
   * If omitted, computed internally
   */
  repaidAmount?: bigint;
  /**
   * Minimum amount of `token` to seize from `creditAccount`.
   * If `token` is a phantom token, it's withdrawn first, and its `depositedToken` is then sent to the liquidator.
   * In this case, `minSeizedAmount` is denominated in `depositedToken`.
   * If omitted, computed internally.
   */
  minSeizedAmount?: bigint;
  /**
   * Target health factor for partial liquidation (4 digits precision, 10000 = 100%).
   * If omitted, defaults to {@link CreditSuite.optimalHFForPartialLiquidation}.
   * Only used when `repaidAmount` is not explicitly provided.
   */
  optimalHF?: bigint;
}

// Compile-time check: ICreditManagerContract covers every abi-inferred
// CreditManagerState field (minus the ones intentionally overridden). The
// pair forces exact key coverage AND exact field types.
type CreditManagerStateFields = Omit<
  CreditManagerState,
  "baseParams" | "collateralTokens" | "name"
>;
type _CreditManagerContractCoversAbi = AssertAssignable<
  Pick<ICreditManagerContract, keyof CreditManagerStateFields>,
  CreditManagerStateFields
>;
type _CreditManagerContractNoAbiDrift = AssertAssignable<
  CreditManagerStateFields,
  Pick<ICreditManagerContract, keyof CreditManagerStateFields>
>;

// Same check for ICreditFacadeContract / CreditFacadeState.
type CreditFacadeStateFields = Omit<CreditFacadeState, "baseParams">;
type _CreditFacadeContractCoversAbi = AssertAssignable<
  Pick<ICreditFacadeContract, keyof CreditFacadeStateFields>,
  CreditFacadeStateFields
>;
type _CreditFacadeContractNoAbiDrift = AssertAssignable<
  CreditFacadeStateFields,
  Pick<ICreditFacadeContract, keyof CreditFacadeStateFields>
>;
