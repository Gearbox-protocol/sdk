import { type Address, zeroAddress } from "viem";
import type {
  InnerFacadeOperation,
  InnerOperation,
} from "../../history/index.js";
import {
  AbstractAdapterContract,
  type AdapterOperation,
  type LegacyAdapterOperation,
} from "../../plugins/adapters/index.js";
import type { OnchainSDK, ParsedCallV2 } from "../../sdk/index.js";

export interface ClassifyInnerOperationsProps {
  sdk: OnchainSDK;
  /** Underlying token of the credit manager, used for debt operations. */
  underlying: Address;
}

/**
 * Calldata-only counterpart of the SDK's `classifyMulticallOperations`.
 *
 * Maps each inner multicall entry to an {@link InnerOperation}:
 * - adapter targets become an `Execute` {@link AdapterOperation};
 * - credit-facade self-calls map to the matching inner facade operation;
 * - unknown targets fall back to a generic `Execute`.
 *
 * Since raw calldata has no execution trace, `transfers` is always empty and
 * `legacy` is a zeroed placeholder; protocol-level fields mirror the adapter
 * call.
 */
export function classifyInnerOperations(
  calls: ParsedCallV2[],
  props: ClassifyInnerOperationsProps,
): InnerOperation[] {
  const { sdk, underlying } = props;
  const result: InnerOperation[] = [];

  for (const call of calls) {
    const contract = sdk.getContract(call.target);

    if (contract instanceof AbstractAdapterContract) {
      result.push({
        operation: "Execute",
        adapter: call.target,
        protocol: contract.targetContract,
        adapterType: call.contractType,
        version: call.version,
        label: call.label,
        adapterFunctionName: call.functionName,
        adapterArgs: call.rawArgs,
        // TODO: mirror the adapter call into the protocol fields for now. The
        // real protocol-level call (adapter -> target contract) only exists in
        // the execution call trace, which is not available from raw calldata.
        // Recovering the actual protocol function/args requires a call trace.
        protocolFunctionName: call.functionName,
        protocolArgs: call.rawArgs,
        transfers: [],
        legacy: mockLegacyOperation(),
      });
      continue;
    }

    if (contract !== undefined) {
      const op = classifyFacadeInnerCall(call, underlying);
      if (op) result.push(op);
      continue;
    }

    result.push({
      operation: "Execute",
      adapter: call.target,
      protocol: call.target,
      adapterType: call.contractType,
      version: call.version,
      label: call.label,
      adapterFunctionName: call.functionName,
      adapterArgs: call.rawArgs,
      // TODO: mirror the adapter call into the protocol fields for now. The
      // real protocol-level call (adapter -> target contract) only exists in
      // the execution call trace, which is not available from raw calldata.
      // Recovering the actual protocol function/args requires a call trace.
      protocolFunctionName: call.functionName,
      protocolArgs: call.rawArgs,
      transfers: [],
      legacy: mockLegacyOperation(),
    });
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
    default:
      return null;
  }
}

/**
 * Zeroed `Swap` placeholder used where execution-trace transfers are not
 * available from raw calldata.
 */
function mockLegacyOperation(): LegacyAdapterOperation {
  return {
    operation: "Swap",
    from: zeroAddress,
    fromAmount: "0",
    to: zeroAddress,
    toAmount: "0",
  };
}
