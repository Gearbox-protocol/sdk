import type { Address } from "viem";
import type {
  AssertAssignable,
  CreditManagerDebtParams,
  IBaseContract,
  PoolState,
} from "../../base/index.js";
import type {
  InterestRateModelStateHuman,
  PoolStateHuman,
  RateKeeperStateHuman,
  RawTx,
} from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type { IRWAFactory } from "../rwa/types.js";
import type { PoolQuotaKeeperV310Contract } from "./PoolQuotaKeeperV310Contract.js";

export type RateKeeperType = `RATE_KEEPER::${string}`;
export type InterestRateModelType = `IRM::${string}`;

export interface IRateKeeperContract extends IBaseContract {
  readonly rates: AddressMap<number>;

  stateHuman: (raw?: boolean) => RateKeeperStateHuman;
}

export interface IInterestRateModelContract extends IBaseContract {
  stateHuman: (raw?: boolean) => InterestRateModelStateHuman;
}

/**
 * Wrapper around the Gearbox lending pool contract.
 * Pool implements ERC4626
 */
export interface IPoolContract extends IBaseContract {
  /**
   * Pool share token symbol (ERC20 metadata).
   */
  symbol: string;
  /**
   * Pool shares decimals, matches underlying token decimals.
   */
  decimals: number;
  /**
   * Total pool share token supply (ERC20).
   */
  totalSupply: bigint;
  /**
   * Pool quota keeper contract address.
   */
  quotaKeeper: Address;
  /**
   * Interest rate model contract address.
   */
  interestRateModel: Address;
  /**
   * Pool's underlying token, same as `asset()`.
   * For RWA markets this is a wrapped token (e.g. dcUSDC, rather than USDC)
   */
  underlying: Address;
  /**
   * Available liquidity in the pool.
   */
  availableLiquidity: bigint;
  /**
   * Amount of underlying that would be in the pool if debt principal, base
   * interest and quota revenue were fully repaid.
   */
  expectedLiquidity: bigint;
  /**
   * Current cumulative base interest index in ray.
   */
  baseInterestIndex: bigint;
  /**
   * Annual interest rate in ray that credit account owners pay per unit of
   * borrowed capital.
   */
  baseInterestRate: bigint;
  /**
   * Current pool share / underlying conversion rate, computed by the
   * compressor
   */
  dieselRate: bigint;
  /**
   * Current annual supply rate for depositors, computed by the compressor
   */
  supplyRate: bigint;
  /**
   * Withdrawal fee in bps
   */
  withdrawFee: bigint;
  /**
   * Total borrowed amount across all credit managers (principal only).
   */
  totalBorrowed: bigint;
  /**
   * Total debt limit (`MAX_UINT256` means no limit).
   */
  totalDebtLimit: bigint;
  /**
   * Cumulative base interest index stored as of last update in ray.
   */
  baseInterestIndexLU: bigint;
  /**
   * Expected liquidity stored as of last update.
   */
  expectedLiquidityLU: bigint;
  /**
   * Current annual quota revenue in underlying tokens.
   */
  quotaRevenue: bigint;
  /**
   * Timestamp of the last base interest rate and index update.
   */
  lastBaseInterestUpdate: number;
  /**
   * Timestamp of the last quota revenue update.
   */
  lastQuotaRevenueUpdate: number;
  /**
   * Whether the pool is currently paused.
   */
  isPaused: boolean;

  /**
   * Per-credit-manager debt parameters indexed by credit manager address.
   */
  readonly creditManagerDebtParams: AddressMap<CreditManagerDebtParams>;

  /**
   * RWA factory associated with the pool's underlying, when the underlying
   * is an RWA token. `undefined` for regular ERC-20 underlyings.
   */
  readonly rwaFactory: IRWAFactory | undefined;

  /**
   * Liquidity currently drawn by credit managers, i.e. the part of the
   * expected liquidity that is not sitting in the pool. Never negative.
   */
  readonly borrowed: bigint;

  /**
   * Underlying the pool's shares are worth, converted at the current share
   * rate. Unlike {@link totalSupply}, this is denominated in the underlying.
   */
  readonly totalAssets: bigint;

  /**
   * Diesel shares `wallet` holds. The pool contract is its own ERC-20.
   **/
  getShareBalance(wallet: Address, blockNumber?: bigint): Promise<bigint>;

  /**
   * Underlying `shares` of diesel are worth at the current share rate, with
   * no withdrawal fee. An empty pool (diesel rate still zero) converts
   * one-for-one. This is what the shares are worth, not what leaving with
   * them would pay.
   */
  sharesToUnderlying(shares: bigint): bigint;

  /**
   * Shares minted (or burned) for this much underlying at the current share
   * rate, with no withdrawal fee. Rounds down as `previewDeposit`; pass
   * `true` to round up as `previewWithdraw`'s conversion (fee inflation is
   * the caller's). An empty pool converts one-for-one.
   */
  underlyingToShares(underlying: bigint, roundUp?: boolean): bigint;

  /**
   * The token the pool's underlying wraps, or the underlying itself when it
   * wraps nothing. An RWA market borrows a compliance wrapper that converts
   * one-for-one with an ordinary token, and only that token means anything to
   * a reader.
   */
  readonly unwrappedUnderlying: Address;

  stateHuman: (raw?: boolean) => PoolStateHuman;

  /**
   * Deposits underlying assets into the pool on behalf of a user with a
   * referral code.
   */
  depositWithReferral(
    amount: bigint,
    onBehalfOf: Address,
    referralCode: bigint,
  ): RawTx;

  /**
   * Redeems pool shares from the owner and sends the underlying assets to
   * the receiver.
   */
  redeem(amount: bigint, owner: Address, receiver: Address): RawTx;

  /**
   * Burns as many of the owner's shares as it takes to send `assets` of the
   * underlying to the receiver.
   */
  withdraw(assets: bigint, receiver: Address, owner: Address): RawTx;
}

// Compile-time check: IPoolContract covers every abi-inferred PoolState field
// (minus the ones intentionally overridden).
type PoolStateFields = Omit<
  PoolState,
  "baseParams" | "creditManagerDebtParams" | "name"
>;
type _PoolContractCoversAbi = AssertAssignable<
  Pick<IPoolContract, keyof PoolStateFields>,
  PoolStateFields
>;
type _PoolContractNoAbiDrift = AssertAssignable<
  PoolStateFields,
  Pick<IPoolContract, keyof PoolStateFields>
>;

export type PoolQuotaKeeperContract = PoolQuotaKeeperV310Contract;
