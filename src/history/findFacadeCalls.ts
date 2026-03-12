import {
  type Address,
  decodeFunctionResult,
  type Hex,
  isAddressEqual,
} from "viem";
import { iCreditFacadeV310Abi } from "../abi/310/generated.js";
import type { ChainContractsRegister, ParsedCallV2 } from "../sdk/index.js";
import { UnknownFacadeCallError } from "./errors.js";
import type {
  CallTrace,
  FacadeCallType,
  FacadeParsedCall,
} from "./internal-types.js";
import { collectTraces } from "./trace-utils.js";

const FACADE_CALL_TYPES: Record<string, FacadeCallType> = {
  multicall: "MultiCall",
  botMulticall: "BotMulticall",
  openCreditAccount: "OpenCreditAccount",
  closeCreditAccount: "CloseCreditAccount",
  liquidateCreditAccount: "LiquidateCreditAccount",
  partiallyLiquidateCreditAccount: "PartiallyLiquidateCreditAccount",
};

/**
 * Extracts the credit account address from a parsed facade call.
 * For `openCreditAccount` the address is the return value (decoded from
 * trace output); for all other call types it is `rawArgs.creditAccount`.
 */
function extractCreditAccount(
  operation: FacadeCallType,
  rawArgs: Record<string, unknown>,
  traceOutput: Hex,
): Address {
  if (operation === "OpenCreditAccount") {
    return decodeFunctionResult({
      abi: iCreditFacadeV310Abi,
      functionName: "openCreditAccount",
      data: traceOutput,
    });
  }
  const ca = rawArgs.creditAccount as Address | undefined;
  if (!ca) {
    throw new Error(`missing creditAccount arg in ${operation} call`);
  }
  return ca;
}

/**
 * Walks a `debug_traceTransaction` callTracer tree, finds all non-reverted
 * calls to the credit facade, parses them via the register, and returns
 * structured {@link FacadeParsedCall} entries for the given credit account.
 */
export function findFacadeCalls(
  trace: CallTrace,
  creditFacade: Address,
  creditAccount: Address,
  register: ChainContractsRegister,
  strict?: boolean,
): FacadeParsedCall[] {
  const facadeTraces = collectTraces(trace, creditFacade);
  const results: FacadeParsedCall[] = [];

  for (const trace of facadeTraces) {
    const parsed = register.parseFunctionDataV2(
      creditFacade,
      trace.input,
      strict,
    );

    const name = parsed.functionName.split("(")[0];
    const operation = FACADE_CALL_TYPES[name];
    if (!operation) {
      if (strict) {
        throw new UnknownFacadeCallError(creditFacade, parsed.functionName);
      }
      continue;
    }

    const ca = extractCreditAccount(operation, parsed.rawArgs, trace.output);
    if (!isAddressEqual(ca, creditAccount)) {
      continue;
    }

    results.push({
      operation,
      creditAccount: ca,
      parsed,
      innerCalls: (parsed.rawArgs.calls as ParsedCallV2[]) ?? [],
      trace,
    });
  }

  return results;
}
