import type { Address } from "viem";
import { AbstractAdapterContract } from "../../plugins/adapters/index.js";
import type { OnchainSDK, ParsedCallV2 } from "../../sdk/index.js";
import type {
  AdapterOperation,
  InnerFacadeOperation,
  InnerOperation,
} from "./types.js";

export interface ClassifyInnerOperationsProps {
  sdk: OnchainSDK;
  /** Underlying token of the credit manager, used for debt operations. */
  underlying: Address;
}

/**
 * Maps each inner multicall entry to an {@link InnerOperation}:
 * - adapter and unknown targets become a pure-descriptor `Execute`
 *   {@link AdapterOperation};
 * - credit-facade self-calls map to the matching inner facade operation.
 *
 * Raw calldata has no execution trace, so the trace-derived adapter data
 * (`protocol`, `transfers`) and `legacy` are intentionally absent; they are only
 * recovered by trace-based flows (history, facade simulation).
 */
export function classifyInnerOperations(
  calls: ParsedCallV2[],
  props: ClassifyInnerOperationsProps,
): InnerOperation[] {
  const { sdk, underlying } = props;
  const result: InnerOperation[] = [];

  for (const call of calls) {
    const contract = sdk.getContract(call.target);

    // Adapter and unknown targets both produce the same calldata-only
    // descriptor; only credit-facade self-calls are classified separately.
    if (contract instanceof AbstractAdapterContract || contract === undefined) {
      result.push({
        operation: "Execute",
        adapter: call.target,
        adapterType: call.contractType,
        version: call.version,
        label: call.label,
        adapterFunctionName: call.functionName,
        adapterArgs: call.rawArgs,
        calldata: call.calldata,
      });
      continue;
    }

    const op = classifyFacadeInnerCall(call, underlying);
    if (op) {
      result.push(op);
    }
  }

  return result;
}

/**
 * Maps a credit-facade self-call to its {@link InnerFacadeOperation}.
 * Returns `null` for calls we do not track (e.g. `onDemandPriceUpdates`).
 *
 * Amounts come from calldata only; `withdrawCollateral` uses the calldata
 * amount and cannot resolve phantom tokens without an execution trace.
 */
function classifyFacadeInnerCall(
  call: ParsedCallV2,
  underlying: Address,
): InnerFacadeOperation | null {
  const functionName = call.functionName.split("(")[0];
  const { rawArgs } = call;

  switch (functionName) {
    case "increaseDebt":
      return {
        operation: "IncreaseBorrowedAmount",
        token: underlying,
        amount: rawArgs.amount as bigint,
      };
    case "decreaseDebt":
      return {
        operation: "DecreaseBorrowedAmount",
        token: underlying,
        amount: rawArgs.amount as bigint,
      };
    case "addCollateral":
    case "addCollateralWithPermit":
      return {
        operation: "AddCollateral",
        token: rawArgs.token as Address,
        amount: rawArgs.amount as bigint,
      };
    case "withdrawCollateral":
      return {
        operation: "WithdrawCollateral",
        token: rawArgs.token as Address,
        amount: rawArgs.amount as bigint,
        to: rawArgs.to as Address,
      };
    case "updateQuota":
      return {
        operation: "UpdateQuota",
        token: rawArgs.token as Address,
        change: rawArgs.quotaChange as bigint,
      };
    case "storeExpectedBalances": {
      const balanceDeltas = rawArgs.balanceDeltas as Array<{
        token: Address;
        amount: bigint;
      }>;
      return {
        operation: "StoreExpectedBalances",
        deltas: balanceDeltas.map(({ token, amount }) => ({
          token,
          balance: amount,
        })),
      };
    }
    case "compareBalances":
      return { operation: "CompareBalances" };
    default:
      return null;
  }
}
