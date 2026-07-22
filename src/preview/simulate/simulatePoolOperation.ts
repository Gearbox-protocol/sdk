import type { ContractFunctionParameters } from "viem";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import { iZapperAbi } from "../../abi/iZapper.js";

import type { PoolOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";
import { asPreviewSimulationError } from "./errors.js";
import type {
  PoolOperationSimulationResult,
  SimulationInput,
} from "./types.js";

/** ERC4626 preview read paired with each pool operation kind. */
type PreviewFunctionName =
  | "previewDeposit"
  | "previewMint"
  | "previewWithdraw"
  | "previewRedeem";

function previewRead(operation: PoolOperation): {
  functionName: PreviewFunctionName;
  amount: bigint;
} {
  switch (operation.operation) {
    case "Deposit":
      return { functionName: "previewDeposit", amount: operation.assets };
    case "Mint":
      return { functionName: "previewMint", amount: operation.shares };
    case "Withdraw":
      return { functionName: "previewWithdraw", amount: operation.assets };
    case "Redeem":
      return { functionName: "previewRedeem", amount: operation.shares };
  }
}

/**
 * Builds the preview read that converts the operation's known amount into its
 * counterpart. Direct operations read the pool's ERC4626 preview; zapper-routed
 * operations (only ever `Deposit`/`Redeem`) read the zapper's
 * `previewDeposit`/`previewRedeem`, which account for the zapper's own
 * conversion in addition to the pool's.
 */
function previewContract(operation: PoolOperation): ContractFunctionParameters {
  const { functionName, amount } = previewRead(operation);
  if (operation.zapper) {
    return {
      address: operation.zapper,
      abi: iZapperAbi,
      functionName,
      args: [amount],
    };
  }
  return {
    address: operation.pool,
    abi: iPoolV310Abi,
    functionName,
    args: [amount],
  };
}

/**
 * Maps a pool operation and its preview result to the amounts of tokens going
 * in (user -> pool) and out (pool -> user). `previewAmount` is the counterpart
 * amount returned by the matching preview read (shares for deposit/withdraw,
 * assets for mint/redeem, and the zapper's converted amount for zapper-routed
 * deposit/redeem).
 */
function amountsInOut(
  operation: PoolOperation,
  previewAmount: bigint,
): PoolOperationSimulationResult {
  switch (operation.operation) {
    case "Deposit":
      return { amountIn: operation.assets, amountOut: previewAmount };
    case "Mint":
      return { amountIn: previewAmount, amountOut: operation.shares };
    case "Withdraw":
      return { amountIn: previewAmount, amountOut: operation.assets };
    case "Redeem":
      return { amountIn: operation.shares, amountOut: previewAmount };
  }
}

/**
 * Simulates a pool deposit/mint/withdraw/redeem (direct or zapper-routed) and
 * returns the resulting token amounts going in and out. Throws a
 * {@link PreviewSimulationError} with the decoded revert when the preview read
 * fails.
 *
 * Performs the matching preview read (the pool's ERC4626
 * `previewDeposit`/`previewMint`/`previewWithdraw`/`previewRedeem`, or the
 * zapper's `previewDeposit`/`previewRedeem`) to convert the calldata-known
 * amount into its counterpart. It works on every network the SDK supports.
 *
 * It does not execute the calldata, so it ignores balance/allowance
 * prerequisites (preview reads succeed regardless).
 */
export async function simulatePoolOperation(
  input: SimulationInput<PoolOperation>,
  options: PreviewOperationOptions = {},
): Promise<PoolOperationSimulationResult> {
  const { sdk, operation } = input;
  const { blockNumber, logger } = options;

  try {
    const previewAmount = (await sdk.client.readContract({
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber,
      ...previewContract(operation),
    })) as bigint;

    return amountsInOut(operation, previewAmount);
  } catch (cause) {
    const error = asPreviewSimulationError(cause, "multicall");
    logger?.error(error, "pool operation simulation failed");
    throw error;
  }
}
