import type { Address } from "viem";
import type { iPoolV310Abi } from "../../abi/310/generated.js";
import type { ierc20ZapperDepositsAbi } from "../../abi/iERC20ZapperDeposits.js";
import type { iethZapperDepositsAbi } from "../../abi/iETHZapperDeposits.js";
import type { iZapperAbi } from "../../abi/iZapper.js";
import type { Asset } from "../router/index.js";

interface IZapper {
  zapper: Address;
  tokenIn: Address;
  tokenOut: Address;
}

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

/**
 * Parameters for depositing liquidity into a Gearbox lending pool.
 *
 * When a `zapper` is provided, the deposit is routed through a zapper
 * contract that handles token conversions (e.g. native ETH wrapping or
 * ERC-20 permit-based approvals). Without a zapper, the deposit goes
 * directly to the pool contract.
 **/
export interface AddLiquidityProps {
  /**
   * Token and amount to deposit.
   **/
  collateral: Asset;
  /**
   * Address of the Gearbox lending pool.
   **/
  pool: Address;
  /**
   * Recipient of the pool shares (diesel tokens).
   **/
  account: Address;
  /**
   * Whether this deposit is part of a pool migration.
   * When `true`, a zapper is required.
   **/
  migrate: boolean;
  /**
   * Optional zapper to route the deposit through.
   **/
  zapper: IZapper | undefined;
  /**
   * Optional ERC-2612 permit for gasless token approval.
   **/
  permit: PermitResult | undefined;
  /**
   * Address of the chain's native-token wrapper (e.g. WETH).
   **/
  nativeTokenAddress: Address;
  /**
   * Optional referral code for tracking the deposit source.
   **/
  referralCode: bigint | undefined;
}

/**
 * Tuple describing a single contract call to execute an add-liquidity
 * operation. The exact variant depends on whether a zapper and/or
 * permit is used.
 **/
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
      abi: typeof iPoolV310Abi;
      functionName: "depositWithReferral";
      args: [bigint, Address, bigint];
    },
];

/**
 * Parameters for withdrawing liquidity from a Gearbox lending pool.
 *
 * Withdrawals are routed through a zapper that redeems pool shares
 * (diesel tokens) for the underlying asset.
 **/
export interface RemoveLiquidityProps {
  /**
   * Address of the Gearbox lending pool.
   **/
  pool: Address;
  /**
   * Amount of pool shares (diesel tokens) to redeem.
   **/
  amount: bigint;
  /**
   * Recipient of the redeemed underlying tokens.
   **/
  account: Address;
  /**
   * Optional ERC-2612 permit for gasless token approval.
   **/
  permit: PermitResult | undefined;
  /**
   * Zapper to route the redemption through.
   **/
  zapper: IZapper;
}

/**
 * Tuple describing a single contract call to execute a remove-liquidity
 * operation. The exact variant depends on whether a permit is used and
 * whether the withdrawal goes through a zapper or directly to the pool.
 **/
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
      abi: typeof iPoolV310Abi;
      functionName: "redeem";
      args: [bigint, Address, Address];
    },
];

/**
 * Service interface for pool liquidity operations.
 **/
export interface IPoolsService {
  /**
   * Construct a call to add liquidity to a Gearbox lending pool.
   *
   * @param props - {@link AddLiquidityProps}
   * @returns A single-element tuple with the encoded contract call.
   **/
  addLiquidity(props: AddLiquidityProps): AddLiquidityCall;

  /**
   * Construct a call to remove liquidity from a Gearbox lending pool.
   *
   * @param props - {@link RemoveLiquidityProps}
   * @returns A single-element tuple with the encoded contract call.
   **/
  removeLiquidity(props: RemoveLiquidityProps): RemoveLiquidityCall;
}
