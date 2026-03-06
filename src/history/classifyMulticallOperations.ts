import { type Address, type Hex, isAddressEqual } from "viem";
import {
  AbstractAdapterContract,
  type AdapterOperation,
  swapFromTransfers,
  toNetTransfers,
} from "../plugins/adapters/index.js";
import type { ChainContractsRegister, ParsedCallV2 } from "../sdk/index.js";
import { TransferAlignmentError, UnknownAdapterError } from "./errors.js";
import type {
  InnerFacadeOperation,
  InnerOperation,
} from "./inner-operations.js";
import type { ExecuteResult } from "./internal-types.js";

/**
 * Classifies each multicall inner call into a {@link InnerOperation}:
 *
 * - **Adapter calls** (target registered as an adapter): delegates to
 *   `adapter.parseAdapterOperation()` and consumes the next entry from
 *   `executeTransfers` (one Execute event per adapter call).
 *
 * - **Facade self-calls** (`increaseDebt`, `updateQuota`, etc.): mapped
 *   directly from `functionName` / `rawArgs`. No transfer consumed.
 *
 * - **Unknown contracts** (address not in register): treated as adapter
 *   calls with a fallback to generic `Swap` from transfers.
 *
 * Skips facade calls we're not interested in (`onDemandPriceUpdates`, `disableToken`, etc.).
 *
 * @throws {TransferAlignmentError} if the number of adapter calls does not
 *   match the number of Execute transfers.
 * @throws {UnknownAdapterError} if strict is true and an inner call target
 *   is not in the register.
 */
export function classifyMulticallOperations(
  innerCalls: ParsedCallV2[],
  executeResults: ExecuteResult[],
  protocolCalldatas: Hex[],
  register: ChainContractsRegister,
  creditAccount: Address,
  underlying: Address,
  strict?: boolean,
  phantomTokens?: Map<Address, Address>,
): InnerOperation[] {
  let transferIdx = 0;
  const result: InnerOperation[] = [];

  for (const call of innerCalls) {
    const contract = register.getContract(call.target);

    if (contract instanceof AbstractAdapterContract) {
      const idx = transferIdx++;
      const executeResult = executeResults[idx];
      if (!executeResult) {
        throw new TransferAlignmentError(executeResults.length, transferIdx);
      }
      const { transfers, targetContract } = executeResult;
      const protocolCalldata = protocolCalldatas[idx];
      const partial = contract.parseAdapterOperation(
        call,
        transfers,
        creditAccount,
        protocolCalldata,
        strict,
      );
      if (partial) result.push({ ...partial, protocol: targetContract });
      continue;
    }

    if (contract !== undefined) {
      const op = classifyFacadeInnerCall(call, underlying, phantomTokens);
      if (op) result.push(op);
      continue;
    }

    if (strict) {
      throw new UnknownAdapterError(call.target);
    }

    const unknownIdx = transferIdx++;
    const unknownResult = executeResults[unknownIdx];
    if (!unknownResult) {
      throw new TransferAlignmentError(executeResults.length, transferIdx);
    }
    const { transfers, targetContract } = unknownResult;
    const netTransfers = toNetTransfers(transfers, creditAccount);
    result.push({
      operation: "Execute",
      adapter: call.target,
      protocol: targetContract,
      adapterType: call.contractType,
      version: call.version,
      label: call.label,
      adapterFunctionName: call.functionName,
      adapterArgs: call.rawArgs,
      protocolFunctionName: call.functionName,
      protocolArgs: call.rawArgs,
      transfers,
      legacy: {
        operation: "Swap" as const,
        ...swapFromTransfers(netTransfers),
      },
    } satisfies AdapterOperation);
  }

  if (transferIdx !== executeResults.length) {
    throw new TransferAlignmentError(executeResults.length, transferIdx);
  }

  return result;
}

function classifyFacadeInnerCall(
  call: ParsedCallV2,
  underlying: Address,
  phantomTokens?: Map<Address, Address>,
): InnerFacadeOperation | null {
  const { functionName: sig, rawArgs } = call;
  const functionName = sig.split("(")[0];
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
    case "withdrawCollateral": {
      const calldataToken = rawArgs.token as Address;
      const depositedToken = findPhantomDepositedToken(
        calldataToken,
        phantomTokens,
      );
      return {
        operation: "WithdrawCollateral",
        token: depositedToken ?? calldataToken,
        amount: rawArgs.amount as bigint,
        to: rawArgs.to as Address,
        ...(depositedToken ? { phantomToken: calldataToken } : {}),
      };
    }
    case "updateQuota":
      return {
        operation: "UpdateQuota",
        token: rawArgs.token as Address,
        change: rawArgs.quotaChange as bigint,
      };
    // other unclassified facade calls, for example onDemandPriceUpdates
    // https://github.com/Gearbox-protocol/core-v3/blob/b038597d9070d9fd18593a6ae9c3d28ca931bb73/contracts/credit/CreditFacadeV3.sol#L534
    default:
      return null;
  }
}

function findPhantomDepositedToken(
  calldataToken: Address,
  phantomTokens?: Map<Address, Address>,
): Address | undefined {
  if (!phantomTokens) return undefined;
  for (const [phantom, deposited] of phantomTokens) {
    if (isAddressEqual(phantom, calldataToken)) return deposited;
  }
  return undefined;
}
