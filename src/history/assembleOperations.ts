import type { Address, Hex } from "viem";
import { AbstractAdapterContract } from "../plugins/adapters/index.js";
import type { ChainContractsRegister, ParsedCallV2 } from "../sdk/index.js";
import { classifyMulticallOperations } from "./classifyMulticallOperations.js";
import { extractProtocolCalls } from "./extractProtocolCalls.js";
import type { ExecuteResult, FacadeParsedCall } from "./internal-types.js";
import type {
  OperationMetadata,
  OuterFacadeOperation,
  PartialLiquidationOperation,
} from "./types.js";

export interface AssembleOperationsInput {
  facadeCalls: FacadeParsedCall[];
  executeResults: ExecuteResult[];
  register: ChainContractsRegister;
  underlying: Address;
  txHash: Hex;
  blockNumber: number;
  liquidationRemainingFunds?: bigint;
  phantomTokens?: Map<Address, Address>;
  strict?: boolean;
}

/**
 * Combines parsed facade calls with per-Execute transfer data into
 * fully classified {@link OuterFacadeOperation} entries.
 *
 * The flat `executeResults` array (one entry per Execute event across
 * the entire transaction) is sliced per facade call based on how many
 * adapter/unknown inner calls each one contains.
 */
export function assembleOperations(
  input: AssembleOperationsInput,
): OuterFacadeOperation[] {
  const {
    facadeCalls,
    executeResults,
    register,
    underlying,
    txHash,
    blockNumber,
    liquidationRemainingFunds,
    phantomTokens,
    strict,
  } = input;
  let offset = 0;
  const meta: OperationMetadata = { txHash, blockNumber };

  return facadeCalls.map(fc => {
    if (fc.operation === "PartiallyLiquidateCreditAccount") {
      return assemblePartialLiquidation(fc, meta);
    }

    const count = countAdapterCalls(fc.innerCalls, register);
    const sliced = executeResults.slice(offset, offset + count);
    offset += count;

    const protocolCalldatas = extractProtocolCalls(fc.trace, sliced);

    const multicall = classifyMulticallOperations(
      fc.innerCalls,
      sliced,
      protocolCalldatas,
      register,
      fc.creditAccount,
      underlying,
      strict,
      phantomTokens,
    );

    switch (fc.operation) {
      case "OpenCreditAccount":
        return {
          ...meta,
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          onBehalfOf: fc.parsed.rawArgs.onBehalfOf as Address,
          referralCode: fc.parsed.rawArgs.referralCode as bigint,
          multicall,
        };
      case "LiquidateCreditAccount":
        return {
          ...meta,
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          to: fc.parsed.rawArgs.to as Address,
          token: underlying,
          remainingFunds: liquidationRemainingFunds ?? 0n,
          multicall,
        };
      default:
        return {
          ...meta,
          operation: fc.operation,
          creditAccount: fc.creditAccount,
          multicall,
        };
    }
  });
}

/**
 * Counts inner calls that consume an Execute transfer entry:
 * adapter contracts and unknown addresses (not in register).
 * Known non-adapter contracts (facade) do not consume transfers.
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

function assemblePartialLiquidation(
  fc: FacadeParsedCall,
  meta: OperationMetadata,
): PartialLiquidationOperation {
  const { rawArgs } = fc.parsed;
  return {
    ...meta,
    operation: "PartiallyLiquidateCreditAccount",
    creditAccount: fc.creditAccount,
    token: rawArgs.token as Address,
    repaidAmount: rawArgs.repaidAmount as bigint,
    minSeizedAmount: rawArgs.minSeizedAmount as bigint,
    to: rawArgs.to as Address,
  };
}
