import type { Address, Hex } from "viem";
import { AbstractAdapterContract } from "../../plugins/adapters/index.js";
import {
  CreditFacadeV310Contract,
  type CreditSuite,
  hexEq,
  type IRWAFactory,
  isRWAFactory,
  type OnchainSDK,
  type ParsedCallV2,
  RWA_FACTORY_SECURITIZE,
  type RWAOperationArgs,
  type SecuritizeRegisterMessage,
} from "../../sdk/index.js";
import { classifyInnerOperations } from "./classifyInnerOperations.js";
import type { RWAOperation, RWAOperationMetadata } from "./types-rwa.js";

/**
 * Decodes a RWA-factory entry-point call into the matching
 * {@link RWAOperation}.
 *
 * @param sdk - The SDK instance.
 * @param factory - The RWA factory contract.
 * @param calldata - The calldata to parse.
 * @returns The parsed operation.
 */
export function parseRWAFactoryOperationCalldata(
  sdk: OnchainSDK,
  factory: IRWAFactory,
  calldata: Hex,
): RWAOperation {
  // Captured before the guard: with a single known factory type, a failed
  // narrowing leaves `factory` typed as `never`.
  const { contractType, address } = factory;
  if (isRWAFactory(factory, RWA_FACTORY_SECURITIZE)) {
    return parseSecuritizeOperationCalldata(sdk, factory, calldata);
  }
  throw new Error(
    `unsupported RWA factory type "${contractType}" on ${address}`,
  );
}

/**
 * Securitize branch of {@link parseRWAFactoryOperationCalldata}
 *
 * In the template flow `tokensToRegister`/`signaturesToCache` are empty; the
 * real values come from the factory's open-account requirements (see
 * `checkPrerequisites`).
 */
function parseSecuritizeOperationCalldata(
  sdk: OnchainSDK,
  factory: IRWAFactory,
  calldata: Hex,
): RWAOperation {
  const parsed = sdk.parseFunctionDataV2(factory.address, calldata);
  const functionName = parsed.functionName.split("(")[0];
  const { rawArgs } = parsed;

  const innerCalls = (rawArgs.calls ?? []) as ParsedCallV2[];
  const args: RWAOperationArgs = {
    type: RWA_FACTORY_SECURITIZE,
    tokensToRegister: [
      ...((rawArgs.tokensToRegister ?? []) as readonly Address[]),
    ],
    signaturesToCache: [
      ...((rawArgs.signaturesToCache ??
        []) as readonly SecuritizeRegisterMessage[]),
    ],
  };

  const suite =
    functionName === "openCreditAccount"
      ? sdk.marketRegister.findCreditManager(rawArgs.creditManager as Address)
      : resolveSuiteForMulticall(sdk, factory, innerCalls);

  const metadata: RWAOperationMetadata = {
    factory: factory.address,
    creditManager: suite.creditManager.address,
    creditFacade: suite.creditFacade.address,
  };

  const multicall = classifyInnerOperations(innerCalls, {
    sdk,
    underlying: suite.underlying,
  });

  switch (functionName) {
    case "openCreditAccount":
      return {
        ...metadata,
        operation: "RWAOpenCreditAccount",
        multicall,
        args,
      };
    case "multicall":
      return {
        ...metadata,
        operation: "RWAMulticall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
        args,
      };
    default:
      throw new Error(
        `unsupported RWA factory function "${parsed.functionName}" on ${factory.address}`,
      );
  }
}

/**
 * Resolves the {@link CreditSuite} for a RWA-factory `multicall`, whose calldata
 * only carries the credit account address.
 *
 * Finds it based on credit facades and adapters which are targets of calls
 */
function resolveSuiteForMulticall(
  sdk: OnchainSDK,
  factory: IRWAFactory,
  innerCalls: ParsedCallV2[],
): CreditSuite {
  for (const call of innerCalls) {
    const contract = sdk.getContract(call.target);
    if (contract instanceof CreditFacadeV310Contract) {
      const suite = sdk.marketRegister.creditManagers.find(cm =>
        hexEq(cm.creditFacade.address, call.target),
      );
      if (suite) {
        return suite;
      }
    }
    if (contract instanceof AbstractAdapterContract) {
      return sdk.marketRegister.findCreditManager(contract.creditManager);
    }
  }

  throw new Error(
    `cannot resolve credit manager for RWA factory multicall on ${factory.address}`,
  );
}
