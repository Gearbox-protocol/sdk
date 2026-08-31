import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem";
import type { Amount, PoolPosition, TokenAmount } from "../../model/index.js";
import type { Asset, PermitResult } from "../base/index.js";
import type { IZapperContract } from "../market/index.js";
import type { MultiCall, RawTx } from "../types/transactions.js";

export type PoolServiceCall<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<
    abi,
    "nonpayable" | "payable"
  > = ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<
    abi,
    "nonpayable" | "payable",
    functionName
  > = ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
> = {
  abi: abi;
  functionName: functionName;
  args: args;
  target: Address;
  value?: bigint;
};

export interface PoolServiceCallResult {
  tx: RawTx;
  calls: Array<MultiCall>;
}

export interface AddLiquidityProps {
  /**
   * Token and amount to deposit.
   **/
  collateral: Asset;
  /**
   * Address of the Gearbox lending pool.
   **/
  pool: Address;
  wallet: Address;
  meta: DepositMetadata;

  permit?: PermitResult;
  referralCode?: bigint;
}

/**
 * Parameters for withdrawing liquidity from a Gearbox lending pool.
 *
 * A direct withdrawal goes to the pool itself; anything else is routed through
 * a zapper that redeems the share-like token it minted.
 **/
export interface RemoveLiquidityProps {
  /**
   * Address of the Gearbox lending pool.
   **/
  pool: Address;
  /**
   * Amount of underlying the wallet wants back, matching
   * {@link PoolSimulation.tokenOut} when {@link RemoveLiquidityProps.mode} is
   * `"withdraw"`. Amount of pool shares to burn when `mode` is `"redeem"`.
   **/
  amount: bigint;
  wallet: Address;
  permit: PermitResult | undefined;

  meta: WithdrawalMetadata;

  /**
   * `withdraw` calls the pool's ERC-4626 `withdraw(assets, …)`; `redeem` calls
   * `redeem(shares, …)` or the zapper's redeem with shares directly.
   *
   * @default "withdraw"
   **/
  mode?: "withdraw" | "redeem";
}

export type MarketType = "rwa-on-demand" | "rwa-default" | "classic";

export interface DepositMetadata {
  /**
   * Zapper that will perform the deposit, undefined in case of direct pool underlying deposit
   */
  zapper?: IZapperContract;
  /**
   * Before deposit user will nedd to call approve method on token that he wants to deposit,
   * this is the spender address that will be used to call approve method.
   */
  approveTarget: Address;
  /**
   * If true, user can avoid approval step and deposit with permit
   */
  permissible: boolean;
  /**
   * Type of deposit
   * @default "classic"
   */
  type?: MarketType;
}

export interface WithdrawalMetadata {
  /**
   * Zapper that will perform the withdrawal, undefined in case of direct pool underlying withdrawal
   */
  zapper?: IZapperContract;
  /**
   * Before withdrawal user will need to call approve method on token that he wants to withdraw (diesel token),
   * this is the spender address that will be used to call approve method.
   */
  approveTarget?: Address;
  /**
   * If true, user can avoid approval step and withdrawal with permit
   */
  permissible: boolean;
  /**
   * Type of withdrawal
   * @default "classic"
   */
  type?: MarketType;
}

/**
 * Props shared by {@link IPoolsService.simulateDeposit},
 * {@link IPoolsService.simulateWithdraw}, and
 * {@link IPoolsService.simulateRedeem}.
 **/
export interface SimulatePoolOperationProps {
  /**
   * Address of the Gearbox lending pool.
   **/
  pool: Address;
  /**
   * Operation amount. Means `tokenIn` on deposit and redeem, `tokenOut` on
   * withdraw — see each method's docs.
   **/
  amount: bigint;
  /**
   * Token the user parts with. Defaults to the pool underlying for deposits and
   * to the pool shares (diesel token) for withdrawals.
   **/
  tokenIn?: Address;
  /**
   * Token the user receives. Defaults to the only route available for `tokenIn`;
   * required when several routes exist.
   **/
  tokenOut?: Address;
}

/**
 * Both sides of a simulated pool operation, converted at the pool's current
 * share rate.
 **/
export interface PoolSimulation {
  /**
   * Token and amount leaving the wallet — exactly what was asked for.
   **/
  tokenIn: TokenAmount;
  /**
   * Token and amount arriving in the wallet at the rate the pool state implies.
   **/
  tokenOut: TokenAmount;
  /**
   * Zapper the operation would be routed through; unset for direct pool
   * operations.
   **/
  zapper?: Address;
  /**
   * Withdrawals only: underlying the pool can actually pay out right now,
   * shaved by a hair so a withdrawal sized against it does not fail on rounding.
   *
   * The conversion is a rate, not a promise that the pool is liquid enough, so
   * compare `tokenOut.value` against `availableLiquidity.value` to see if the
   * withdrawal fits.
   **/
  availableLiquidity?: Amount;
}

/**
 * Props for {@link IPoolsService.listPositions}.
 **/
export interface ListPoolPositionsProps {
  /**
   * Wallet whose pool shares to describe.
   **/
  wallet: Address;
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * Service interface for pool liquidity operations.
 **/
export interface IPoolsService {
  /**
   * Lists all pool positions a wallet holds.
   *
   * @param props - {@link ListPoolPositionsProps}
   **/
  listPositions(props: ListPoolPositionsProps): Promise<PoolPosition[]>;

  /**
   * Returns list of tokens that can be deposited to a pool
   * @param pool
   */
  getDepositTokensIn(pool: Address): Address[];
  /**
   * Returns list of tokens that user can receive after depositing to a pool,
   * depends on the pool type and the token being deposited (one of returned by {@link getDepositTokensIn}).
   *
   * Can return empty array if no tokens can be received (e.g. for RWA underlying on demand)
   *
   * @param pool
   * @param tokenIn
   */
  getDepositTokensOut(pool: Address, tokenIn: Address): Address[];

  /**
   * After user chooses tokenIn from {@link getDepositTokensIn} and tokenOut from {@link getDepositTokensOut},
   * this method returns metadata that will be used to perform the deposit.
   *
   * @param pool
   * @param tokenIn
   * @param tokenOut can be undefined if deposit is not resulting in a token out (e.g. for RWA underlying on demand)
   */
  getDepositMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): DepositMetadata;

  /**
   * Returns a list of tokens that can be redeemed from a pool
   * @param pool
   */
  getWithdrawalTokensIn(pool: Address): Address[];

  /**
   * Returns a list of tokens that can be received after redeeming from a pool
   * @param pool
   * @param tokenIn token that will be redeemed from the pool
   */
  getWithdrawalTokensOut(pool: Address, tokenIn: Address): Address[];

  /**
   * After user chooses tokenIn from {@link getWithdrawalTokensIn} and tokenOut from {@link getWithdrawalTokensOut},
   * this method returns metadata that will be used to perform the withdrawal.
   * @param pool
   * @param tokenIn
   * @param tokenOut
   */
  getWithdrawalMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): WithdrawalMetadata;

  /**
   * Simulates a deposit and reports what the wallet would receive.
   *
   * The ERC-4626 conversion of the pool, computed from the state the SDK already
   * holds rather than read back from the chain, so the answer is synchronous and
   * as fresh as the loaded market. Nothing is executed, so balances and
   * allowances are irrelevant.
   *
   * A zapper leg converts one-for-one — every zapper wraps rather than trades —
   * so a routed deposit reports the same amount as a direct one.
   *
   * @param props - {@link SimulatePoolOperationProps}
   * @returns {@link PoolSimulation}
   * @throws If the token pair has no route, or if `tokenOut` is omitted while
   * several routes exist (RWA on-demand markets have no rate at all).
   **/
  simulateDeposit(props: SimulatePoolOperationProps): PoolSimulation;

  /**
   * Simulates a withdrawal and reports what the wallet would receive.
   *
   * The mirror of {@link simulateDeposit}: `amount` is the underlying the
   * wallet wants back, and the result is the shares it costs at the pool's
   * current rate.
   *
   * @param props - {@link SimulatePoolOperationProps}
   * @returns {@link PoolSimulation}
   * @throws If the token pair has no route, or if `tokenOut` is omitted while
   * several routes exist.
   **/
  simulateWithdraw(props: SimulatePoolOperationProps): PoolSimulation;

  /**
   * Simulates a redemption and reports what the wallet would receive.
   *
   * The ERC-4626 `previewRedeem` mirror: `amount` is the shares to burn, and
   * the result is the underlying they convert to, less the pool's withdrawal
   * fee.
   *
   * @param props - {@link SimulatePoolOperationProps}
   * @returns {@link PoolSimulation}
   * @throws If the token pair has no route, or if `tokenOut` is omitted while
   * several routes exist.
   **/
  simulateRedeem(props: SimulatePoolOperationProps): PoolSimulation;

  /**
   * Returns contract call parameters for adding liquidity to a pool
   * Or undefined if no deposit action is required (e.g. for RWA underlying on demand)
   * @param props - {@link AddLiquidityProps}
   * @returns - {@link AddLiquidityCall}
   */
  addLiquidity(props: AddLiquidityProps): PoolServiceCallResult | undefined;

  /**
   * Construct a call to remove liquidity from a Gearbox lending pool.
   *
   * @param props - {@link RemoveLiquidityProps}
   * @returns - {@link RemoveLiquidityCall}
   */
  removeLiquidity(props: RemoveLiquidityProps): PoolServiceCallResult;
}
