import type { Abi } from "abitype";
import type { Address, ContractFunctionArgs, ContractFunctionName } from "viem";
import type { ZapperData } from "../market/index.js";
import type { Asset } from "../router/index.js";
import type { PoolData_Legacy } from "../sdk-legacy/index.js";

interface PermitResult {
  r: Address;
  s: Address;
  v: number;

  token: Address;
  owner: Address;
  spender: Address;
  value: bigint;

  deadline: bigint;
  nonce: bigint;
}

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

export interface AddLiquidityProps {
  collateral: Asset;
  pool: Address;
  wallet: Address;
  meta: DepositMetadata;

  permit?: PermitResult;
  referralCode?: bigint;
}

export interface RemoveLiquidityProps {
  pool: Address;
  amount: bigint;
  account: Address;
  permit: PermitResult | undefined;

  zapper: PoolData_Legacy["zappers"][Address][Address];
}

export interface DepositMetadata {
  /**
   * Zapper that will perform the deposit, undefined in case of direct pool underlying deposit
   */
  zapper?: ZapperData;
  /**
   * Before deposit user will nedd to call approve method on token that he wants to deposit,
   * this is the spender address that will be used to call approve method.
   *
   */
  approveTarget: Address;
  /**
   * If true, user can avoid approval step and deposit with permit
   */
  permissible: boolean;
}

export interface IPoolsService {
  /**
   * Returns list of tokens that can be deposited to a pool
   * @param pool
   */
  getDepositTokensIn(pool: Address): Address[];
  /**
   * Returns list of tokens that user can receive after depositing to a pool,
   * depends on the pool type and the token being deposited (one of returned by {@link getDepositTokensIn}).
   *
   * Can return empty array if no tokens can be received (e.g. for KYC underlying on demand)
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
   * @param tokenOut can be undefined if deposit is not resulting in a token out (e.g. for KYC underlying on demand)
   */
  getDepositMetadata(
    pool: Address,
    tokenIn: Address,
    tokenOut?: Address,
  ): DepositMetadata;

  /**
   * Returns contract call parameters for adding liquidity to a pool
   * Or undefined if no deposit action is required (e.g. for KYC underlying on demand)
   * @param props - {@link AddLiquidityProps}
   * @returns - {@link AddLiquidityCall}
   */
  addLiquidity(props: AddLiquidityProps): PoolServiceCall | undefined;

  /**
   * Remove liquidity from a pool
   * @param props - {@link RemoveLiquidityProps}
   * @returns - {@link RemoveLiquidityCall}
   */
  removeLiquidity(props: RemoveLiquidityProps): PoolServiceCall;
}
