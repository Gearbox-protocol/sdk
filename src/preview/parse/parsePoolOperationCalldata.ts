import type { Address, Hex } from "viem";
import type { OnchainSDK, PoolV310Contract } from "../../sdk/index.js";
import { UnsupportedPoolFunctionError } from "./errors.js";
import type { PoolOperation } from "./types.js";

export interface ParsePoolOperationCalldataProps {
  sdk: OnchainSDK;
  /** Resolved pool contract for the transaction target. */
  pool: PoolV310Contract;
  calldata: Hex;
}

/**
 * Decodes ERC4626 pool calldata into a {@link PoolOperation}. Supports every
 * deposit/mint/withdraw/redeem variant of `IPoolV3` (and the `IERC4626` base it
 * extends): `deposit`/`depositWithReferral`, `mint`/`mintWithReferral`,
 * `withdraw` and `redeem`. Any other selector throws
 * {@link UnsupportedPoolFunctionError}.
 */
export function parsePoolOperationCalldata(
  props: ParsePoolOperationCalldataProps,
): PoolOperation {
  const { sdk, pool, calldata } = props;
  const parsed = sdk.parseFunctionDataV2(pool.address, calldata);
  const functionName = parsed.functionName.split("(")[0];
  const { rawArgs } = parsed;

  const underlying = pool.underlying;

  switch (functionName) {
    case "deposit":
    case "depositWithReferral":
      return {
        operation: "Deposit",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        assets: rawArgs.assets as bigint,
        underlying,
        referralCode:
          functionName === "depositWithReferral"
            ? (rawArgs.referralCode as bigint)
            : undefined,
      };
    case "mint":
    case "mintWithReferral":
      return {
        operation: "Mint",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        shares: rawArgs.shares as bigint,
        underlying,
        referralCode:
          functionName === "mintWithReferral"
            ? (rawArgs.referralCode as bigint)
            : undefined,
      };
    case "withdraw":
      return {
        operation: "Withdraw",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        owner: rawArgs.owner as Address,
        assets: rawArgs.assets as bigint,
        underlying,
      };
    case "redeem":
      return {
        operation: "Redeem",
        pool: pool.address,
        receiver: rawArgs.receiver as Address,
        owner: rawArgs.owner as Address,
        shares: rawArgs.shares as bigint,
        underlying,
      };
    default:
      throw new UnsupportedPoolFunctionError(pool.address, parsed.functionName);
  }
}
