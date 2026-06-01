import type { Address, Hex } from "viem";
import type {
  AssertAssignable,
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
import type { RampEvent } from "../index.js";
import type { PriceUpdate } from "../pricefeeds/index.js";

export interface ICreditConfiguratorContract extends IBaseContract {
  isPaused: boolean;

  checkRamps: () => Promise<RampEvent[]>;
  stateHuman: (raw?: boolean) => CreditConfiguratorStateHuman;
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
