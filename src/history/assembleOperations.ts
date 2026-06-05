import type { Address } from "viem";
import { AbstractAdapterContract } from "../plugins/adapters/index.js";
import type { TokenTransfer } from "../preview/parse/index.js";
import type {
  AddressMap,
  ChainContractsRegister,
  ParsedCallV2,
} from "../sdk/index.js";
import { classifyMulticallOperations } from "./classifyMulticallOperations.js";
import { extractAdapterCallTraces } from "./extractAdapterCallTraces.js";
import type { WithdrawCollateralEventInfo } from "./extractTransfers.js";
import type { FacadeParsedCall } from "./internal-types.js";
import type {
  FacadeOperationMetadata,
  OuterFacadeOperation,
  PartialLiquidationOperation,
} from "./types.js";

export interface AssembleOperationsInput {
  facadeCalls: FacadeParsedCall[];
  /**
   * ERC-20 transfers grouped per facade `Execute` event, one inner array per
   * Execute event across the whole transaction, in emission order. Sliced per
   * facade call and consumed one inner array per adapter/unknown inner call.
   */
  executeTransfers: TokenTransfer[][];
  register: ChainContractsRegister;
  underlying: Address;
  liquidationRemainingFunds?: bigint;
  phantomTokens?: AddressMap<Address>;
  withdrawCollateralEvents?: WithdrawCollateralEventInfo[];
  strict?: boolean;
}

/**
 * Combines parsed facade calls with per-Execute transfer data into
 * fully classified {@link OuterFacadeOperation} entries.
 *
 * The flat `executeTransfers` array (one inner array per Execute event across
 * the entire transaction) is sliced per facade call based on how many
 * adapter/unknown inner calls each one contains.
 */
export function assembleOperations(
  input: AssembleOperationsInput,
): Omit<OuterFacadeOperation, keyof FacadeOperationMetadata>[] {
  const {
    facadeCalls,
    executeTransfers,
    register,
    underlying,
    liquidationRemainingFunds,
    phantomTokens,
    withdrawCollateralEvents = [],
    strict,
  } = input;
  let executeOffset = 0;
  let withdrawOffset = 0;

  return facadeCalls.map(fc => {
    if (fc.operation === "PartiallyLiquidateCreditAccount") {
      return assemblePartialLiquidation(fc);
    }

    const count = countAdapterCalls(fc.innerCalls, register);
    const sliced = executeTransfers.slice(executeOffset, executeOffset + count);
    executeOffset += count;

    const withdrawCount = countWithdrawCollateralCalls(fc.innerCalls);
    const slicedWithdrawEvents = withdrawCollateralEvents.slice(
      withdrawOffset,
      withdrawOffset + withdrawCount,
    );
    withdrawOffset += withdrawCount;

    const adapterTraces = extractAdapterCallTraces(fc.trace);

    const multicall = classifyMulticallOperations({
      innerCalls: fc.innerCalls,
      executeTransfers: sliced,
      adapterTraces,
      register,
      creditAccount: fc.creditAccount,
      underlying,
      strict,
      phantomTokens,
      withdrawCollateralEvents: slicedWithdrawEvents,
    });

    switch (fc.operation) {
      case "OpenCreditAccount":
        return {
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          onBehalfOf: fc.parsed.rawArgs.onBehalfOf as Address,
          referralCode: fc.parsed.rawArgs.referralCode as bigint,
          multicall,
        };
      case "LiquidateCreditAccount":
        return {
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          to: fc.parsed.rawArgs.to as Address,
          token: underlying,
          remainingFunds: liquidationRemainingFunds ?? 0n,
          multicall,
        };
      default:
        return {
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          multicall,
        };
    }
  });
}

/**
 * Counts inner calls that consume an Execute transfer entry: adapter contracts
 * and unknown addresses (not in register). Known non-adapter contracts (facade)
 * do not consume transfers.
 *
 * The count determines how many `executeTransfers` entries belong to this
 * facade call and matches the number of adapter call traces returned by
 * {@link extractAdapterCallTraces}.
 */
function countAdapterCalls(
  innerCalls: ParsedCallV2[],
  register: ChainContractsRegister,
): number {
  return innerCalls.filter(call => {
    const contract = register.getContract(call.target);
    return !contract || contract instanceof AbstractAdapterContract;
  }).length;
}

function countWithdrawCollateralCalls(innerCalls: ParsedCallV2[]): number {
  return innerCalls.filter(call =>
    call.functionName.startsWith("withdrawCollateral"),
  ).length;
}

function assemblePartialLiquidation(
  fc: FacadeParsedCall,
): Omit<PartialLiquidationOperation, keyof FacadeOperationMetadata> {
  const { rawArgs } = fc.parsed;
  return {
    operation: "PartiallyLiquidateCreditAccount",
    creditAccount: fc.creditAccount,
    token: rawArgs.token as Address,
    repaidAmount: rawArgs.repaidAmount as bigint,
    minSeizedAmount: rawArgs.minSeizedAmount as bigint,
    to: rawArgs.to as Address,
  };
}
