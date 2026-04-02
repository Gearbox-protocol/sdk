import { iPoolV310Abi } from "../../abi/310/generated.js";
import { ierc20ZapperDepositsAbi } from "../../abi/iERC20ZapperDeposits.js";
import { iethZapperDepositsAbi } from "../../abi/iETHZapperDeposits.js";
import { iZapperAbi } from "../../abi/iZapper.js";
import { SDKConstruct } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  AddLiquidityCall,
  AddLiquidityProps,
  RemoveLiquidityCall,
  RemoveLiquidityProps,
} from "./types.js";

/**
 * Base implementation of {@link IPoolsService}.
 *
 * Used to generate data for write operations on LP side (deposit to/withdraw from pool)
 **/
export abstract class AbstractPoolService extends SDKConstruct {
  #version: number;

  constructor(sdk: GearboxSDK, version: number) {
    super(sdk);

    this.#version = version;
    this.logger?.debug(`Created PoolService with version: ${this.#version}`);
  }

  /**
   * {@inheritDoc IPoolsService.addLiquidity}
   **/
  public addLiquidity({
    collateral,
    pool,
    account,
    zapper,
    permit,
    nativeTokenAddress,
    referralCode = 0n,
    migrate,
  }: AddLiquidityProps): AddLiquidityCall {
    if (zapper?.tokenIn === nativeTokenAddress) {
      return [
        {
          target: zapper.zapper,
          abi: iethZapperDepositsAbi,
          functionName: "depositWithReferral",
          args: [account, referralCode],
          value: collateral.balance,
        },
      ];
    } else if (zapper) {
      return permit
        ? [
            {
              target: zapper.zapper,
              abi: ierc20ZapperDepositsAbi,
              functionName: "depositWithReferralAndPermit",
              args: [
                collateral.balance,
                account,
                referralCode,
                permit.deadline,
                permit.v,
                permit.r,
                permit.s,
              ],
            },
          ]
        : [
            {
              target: zapper.zapper,
              abi: ierc20ZapperDepositsAbi,
              functionName: "depositWithReferral",
              args: [collateral.balance, account, referralCode],
            },
          ];
    } else {
      if (migrate) throw Error("No zapper for migration");

      return [
        {
          target: pool,
          abi: iPoolV310Abi,
          functionName: "depositWithReferral",
          args: [collateral.balance, account, referralCode],
        },
      ];
    }
  }

  /**
   * {@inheritDoc IPoolsService.removeLiquidity}
   **/
  public removeLiquidity({
    pool,
    amount,
    account,
    zapper,
    permit,
  }: RemoveLiquidityProps): RemoveLiquidityCall {
    if (zapper) {
      return permit
        ? [
            {
              target: zapper.zapper,
              abi: iZapperAbi,
              functionName: "redeemWithPermit",
              args: [
                amount,
                account,
                permit.deadline,
                permit.v,
                permit.r,
                permit.s,
              ],
            },
          ]
        : [
            {
              target: zapper.zapper,
              abi: iZapperAbi,
              functionName: "redeem",
              args: [amount, account],
            },
          ];
    } else {
      return [
        {
          target: pool,
          abi: iPoolV310Abi,
          functionName: "redeem",
          args: [amount, account, account],
        },
      ];
    }
  }
}
