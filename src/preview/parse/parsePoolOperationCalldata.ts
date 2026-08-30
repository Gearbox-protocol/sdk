import type { Address, Hex } from "viem";
import { type SDKReturn, sdkErr, sdkOk } from "../../model/index.js";
import type { OnchainSDK, PoolV310Contract } from "../../onchain/index.js";
import type { UnsupportedPoolFunctionError } from "./errors.js";
import type { PoolOperation } from "./types.js";

/**
 * Decodes pool calldata into a {@link PoolOperation}.
 *
 * @param sdk - The SDK instance.
 * @param pool - The pool contract.
 * @param calldata - The calldata to parse.
 * @returns The parsed operation behind `ok`, or the refusal.
 */
export function parsePoolOperationCalldata(
  sdk: OnchainSDK,
  pool: PoolV310Contract,
  calldata: Hex,
): SDKReturn<PoolOperation, UnsupportedPoolFunctionError> {
  const parsed = sdk.parseFunctionDataV2(pool.address, calldata);
  const functionName = parsed.functionName.split("(")[0];
  const { rawArgs } = parsed;

  const underlying = pool.underlying;

  switch (functionName) {
    case "deposit":
    case "depositWithReferral":
      return sdkOk({
        operation: "Deposit",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        assets: rawArgs.assets as bigint,
        underlying,
        tokenIn: underlying,
        tokenOut: pool.address,
        zapper: undefined,
        referralCode:
          functionName === "depositWithReferral"
            ? (rawArgs.referralCode as bigint)
            : undefined,
      });
    case "mint":
    case "mintWithReferral":
      return sdkOk({
        operation: "Mint",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        shares: rawArgs.shares as bigint,
        underlying,
        tokenIn: underlying,
        tokenOut: pool.address,
        zapper: undefined,
        referralCode:
          functionName === "mintWithReferral"
            ? (rawArgs.referralCode as bigint)
            : undefined,
      });
    case "withdraw":
      return sdkOk({
        operation: "Withdraw",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        owner: rawArgs.owner as Address,
        assets: rawArgs.assets as bigint,
        underlying,
        tokenIn: pool.address,
        tokenOut: underlying,
        zapper: undefined,
      });
    case "redeem":
      return sdkOk({
        operation: "Redeem",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        owner: rawArgs.owner as Address,
        shares: rawArgs.shares as bigint,
        underlying,
        tokenIn: pool.address,
        tokenOut: underlying,
        zapper: undefined,
      });
    default:
      return sdkErr({
        code: "unsupportedPoolFunction",
        message: `unsupported pool function "${parsed.functionName}" on ${pool.address}`,
        pool: pool.address,
        functionName: parsed.functionName,
      } satisfies UnsupportedPoolFunctionError);
  }
}
