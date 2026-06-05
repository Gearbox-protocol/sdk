import { type Address, type Hex, isAddressEqual } from "viem";
import {
  AbstractAdapterContract,
  swapFromTransfers,
  toNetTransfers,
} from "../plugins/adapters/index.js";
import type {
  AddressMap,
  ChainContractsRegister,
  ParsedCallV2,
} from "../sdk/index.js";
import {
  TransferAlignmentError,
  UnknownAdapterError,
  WithdrawCollateralAlignmentError,
} from "./errors.js";
import type { WithdrawCollateralEventInfo } from "./extractTransfers.js";
import type { ExecuteResult } from "./internal-types.js";
import type {
  AdapterOperation,
  InnerFacadeOperation,
  InnerOperation,
} from "./types.js";

export interface ClassifyMulticallOperationsInput {
  innerCalls: ParsedCallV2[];
  executeResults: ExecuteResult[];
  protocolCalldatas: Hex[];
  register: ChainContractsRegister;
  creditAccount: Address;
  underlying: Address;
  strict?: boolean;
  phantomTokens?: AddressMap<Address>;
  withdrawCollateralEvents?: WithdrawCollateralEventInfo[];
}

/**
 * Classifies each multicall inner call into a {@link InnerOperation}:
 *
 * - **Adapter calls** (target registered as an adapter): decodes the
 *   protocol-level call via `adapter.parseProtocolCall()`, classifies the
 *   legacy operation via `adapter.classifyLegacyOperation()`, and consumes the
 *   next entry from `executeResults` (one Execute event per adapter call).
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
  input: ClassifyMulticallOperationsInput,
): InnerOperation[] {
  const {
    innerCalls,
    executeResults,
    protocolCalldatas,
    register,
    creditAccount,
    underlying,
    strict,
    phantomTokens,
    withdrawCollateralEvents,
  } = input;
  let transferIdx = 0;
  let withdrawIdx = 0;
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
      const protocol = contract.parseProtocolCall(
        protocolCalldata,
        targetContract,
        strict,
      );
      const legacy = contract.classifyLegacyOperation(
        call,
        toNetTransfers(transfers, creditAccount),
      );
      result.push({
        operation: "Execute",
        adapter: call.target,
        adapterType: call.contractType,
        version: call.version,
        label: call.label,
        adapterFunctionName: call.functionName,
        adapterArgs: call.rawArgs,
        protocol,
        transfers,
        legacy,
      } satisfies AdapterOperation);
      continue;
    }

    if (contract !== undefined) {
      const isWithdraw = call.functionName.startsWith("withdrawCollateral");
      const withdrawEvent = isWithdraw
        ? withdrawCollateralEvents?.[withdrawIdx++]
        : undefined;
      const op = classifyFacadeInnerCall(
        call,
        underlying,
        phantomTokens,
        withdrawEvent,
      );
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
      adapterType: call.contractType,
      version: call.version,
      label: call.label,
      adapterFunctionName: call.functionName,
      adapterArgs: call.rawArgs,
      protocol: {
        contract: targetContract,
        functionName: call.functionName,
        functionArgs: call.rawArgs,
      },
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

  if (
    withdrawCollateralEvents &&
    withdrawCollateralEvents.length > 0 &&
    withdrawIdx !== withdrawCollateralEvents.length
  ) {
    throw new WithdrawCollateralAlignmentError(
      withdrawCollateralEvents.length,
      withdrawIdx,
    );
  }

  return result;
}

function classifyFacadeInnerCall(
  call: ParsedCallV2,
  underlying: Address,
  phantomTokens?: AddressMap<Address>,
  withdrawEvent?: WithdrawCollateralEventInfo,
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
      // Prefer the facade event amount: it handles MAX_UINT256 shortcut for "withdraw all"
      // and is already in deposited-token in case of phantom token.
      const amount = withdrawEvent
        ? withdrawEvent.amount
        : (rawArgs.amount as bigint);
      return {
        operation: "WithdrawCollateral",
        token: depositedToken ?? calldataToken,
        amount,
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
  phantomTokens?: AddressMap<Address>,
): Address | undefined {
  if (!phantomTokens) return undefined;
  for (const [phantom, deposited] of phantomTokens.entries()) {
    if (isAddressEqual(phantom, calldataToken)) return deposited;
  }
  return undefined;
}
