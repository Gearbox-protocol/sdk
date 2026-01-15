import type { Address } from "viem";
import type { ierc20ZapperDepositsAbi } from "../../abi/iERC20ZapperDeposits.js";
import type { iethZapperDepositsAbi } from "../../abi/iETHZapperDeposits.js";
import type { iZapperAbi } from "../../abi/iZapper.js";
import type { iPoolV300Abi } from "../../abi/v300.js";
import type { PoolData_Legacy } from "../index.js";
import type { Asset } from "../router/index.js";

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

export interface AddLiquidityProps {
  collateral: Asset;
  pool: Address;
  account: Address;

  migrate: boolean;

  zapper: PoolData_Legacy["zappers"][Address][Address] | undefined;
  permit: PermitResult | undefined;
  nativeTokenAddress: Address;

  referralCode: bigint | undefined;
}
export type AddLiquidityCall = [
  | {
      target: Address;
      abi: typeof iethZapperDepositsAbi;
      functionName: "depositWithReferral";
      args: [Address, bigint];
      value: bigint;
    }
  | {
      target: Address;
      abi: typeof ierc20ZapperDepositsAbi;
      functionName: "depositWithReferralAndPermit";
      args: [bigint, Address, bigint, bigint, number, Address, Address];
    }
  | {
      target: Address;
      abi: typeof ierc20ZapperDepositsAbi;
      functionName: "depositWithReferral";
      args: [bigint, Address, bigint];
    }
  | {
      target: Address;
      abi: typeof iPoolV300Abi;
      functionName: "depositWithReferral";
      args: [bigint, Address, bigint];
    },
];

export interface RemoveLiquidityProps {
  pool: Address;
  amount: bigint;
  account: Address;
  permit: PermitResult | undefined;

  zapper: PoolData_Legacy["zappers"][Address][Address];
}
export type RemoveLiquidityCall = [
  | {
      target: Address;
      abi: typeof iZapperAbi;
      functionName: "redeemWithPermit";
      args: [bigint, Address, bigint, number, Address, Address];
    }
  | {
      target: Address;
      abi: typeof iZapperAbi;
      functionName: "redeem";
      args: [bigint, Address];
    }
  | {
      target: Address;
      abi: typeof iPoolV300Abi;
      functionName: "redeem";
      args: [bigint, Address, Address];
    },
];

export interface IPoolsService {
  /**
   * Add liquidity to a pool
   * @param props - {@link AddLiquidityProps}
   * @returns - {@link AddLiquidityCall}
   */
  addLiquidity(props: AddLiquidityProps): AddLiquidityCall;

  /**
   * Remove liquidity from a pool
   * @param props - {@link RemoveLiquidityProps}
   * @returns - {@link RemoveLiquidityCall}
   */
  removeLiquidity(props: RemoveLiquidityProps): RemoveLiquidityCall;
}
