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

export interface ParseRWAFactoryOperationCalldataProps {
  sdk: OnchainSDK;
  /** Resolved RWA factory contract for the transaction target. */
  factory: IRWAFactory;
  calldata: Hex;
}

/**
 * Decodes a RWA-factory entry-point call into the matching
 * {@link RWAOperation}.
 *
 * RWA credit accounts are opened and managed through the market's RWA factory
 * (see `CreditAccountsServiceV310`) rather than the credit facade, but the
 * inner `calls` share the credit-facade multicall shape, so classification is
 * identical to {@link parseFacadeOperationCalldata}.
 *
 * Dispatches on the factory's contract type; supporting a new factory type
 * requires a new branch here.
 */
export function parseRWAFactoryOperationCalldata(
  props: ParseRWAFactoryOperationCalldataProps,
): RWAOperation {
  // Captured before the guard: with a single known factory type, a failed
  // narrowing leaves `props.factory` typed as `never`.
  const { contractType, address } = props.factory;
  if (isRWAFactory(props.factory, RWA_FACTORY_SECURITIZE)) {
    return parseSecuritizeOperationCalldata(props);
  }
  throw new Error(
    `unsupported RWA factory type "${contractType}" on ${address}`,
  );
}

/**
 * Securitize branch of {@link parseRWAFactoryOperationCalldata}: decodes
 * `openCreditAccount(creditManager, calls, tokensToRegister, signaturesToCache)`
 * and `multicall(creditAccount, calls, tokensToRegister, signaturesToCache)`.
 *
 * In the template flow `tokensToRegister`/`signaturesToCache` are empty; the
 * real values come from the factory's open-account requirements (see
 * `checkPrerequisites`).
 */
function parseSecuritizeOperationCalldata(
  props: ParseRWAFactoryOperationCalldataProps,
): RWAOperation {
  const { sdk, factory, calldata } = props;
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
