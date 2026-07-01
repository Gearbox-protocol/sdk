import { type Address, type Hex, zeroAddress } from "viem";
import { AbstractAdapterContract } from "../../plugins/adapters/index.js";
import {
  CreditFacadeV310Contract,
  type CreditSuite,
  hexEq,
  type OnchainSDK,
  type ParsedCallV2,
  type SecuritizeRWAFactory,
} from "../../sdk/index.js";
import { classifyInnerOperations } from "./classifyInnerOperations.js";
import { extractExpectedBalanceChanges } from "./extractExpectedBalanceChanges.js";
import type { FacadeOperationMetadata, OuterFacadeOperation } from "./types.js";

export interface ParseRWAFactoryOperationCalldataProps {
  sdk: OnchainSDK;
  /** Resolved RWA factory contract for the transaction target. */
  factory: SecuritizeRWAFactory;
  calldata: Hex;
}

/**
 * Decodes a RWA-factory entry-point call into the matching
 * {@link OuterFacadeOperation}.
 *
 * RWA credit accounts are opened and managed through the market's RWA factory
 * (see `CreditAccountsServiceV310`) rather than the credit facade, but the inner
 * `calls` share the credit-facade multicall shape, so classification is
 * identical to {@link parseFacadeOperationCalldata}.
 *
 * The RWA factory calldata does not carry `onBehalfOf`, `referralCode` or the
 * new account address (all derived on-chain), so those are left as
 * `zeroAddress`/`0n`.
 */
export function parseRWAFactoryOperationCalldata(
  props: ParseRWAFactoryOperationCalldataProps,
): OuterFacadeOperation {
  const { sdk, factory, calldata } = props;
  const parsed = sdk.parseFunctionDataV2(factory.address, calldata);
  const functionName = parsed.functionName.split("(")[0];
  const { rawArgs } = parsed;

  const innerCalls = (rawArgs.calls ?? []) as ParsedCallV2[];

  const suite =
    functionName === "openCreditAccount"
      ? sdk.marketRegister.findCreditManager(rawArgs.creditManager as Address)
      : resolveSuiteForMulticall(sdk, factory, innerCalls);

  const metadata: FacadeOperationMetadata = {
    creditManager: suite.creditManager.address,
    creditFacade: suite.creditFacade.address,
  };

  const multicall = classifyInnerOperations(innerCalls, {
    sdk,
    underlying: suite.underlying,
  });
  const expectedBalanceChanges = extractExpectedBalanceChanges(innerCalls);

  switch (functionName) {
    case "openCreditAccount":
      return {
        ...metadata,
        operation: "OpenCreditAccount",
        creditAccount: zeroAddress,
        onBehalfOf: zeroAddress,
        referralCode: 0n,
        multicall,
        expectedBalanceChanges,
      };
    case "multicall":
      return {
        ...metadata,
        operation: "MultiCall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
        expectedBalanceChanges,
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
  factory: SecuritizeRWAFactory,
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
