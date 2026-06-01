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
