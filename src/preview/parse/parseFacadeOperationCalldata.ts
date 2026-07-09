import { type Address, type Hex, isAddressEqual, zeroAddress } from "viem";
import type {
  CreditFacadeV310Contract,
  OnchainSDK,
  ParsedCallV2,
} from "../../sdk/index.js";
import { classifyInnerOperations } from "./classifyInnerOperations.js";
import type { FacadeOperationMetadata, OuterFacadeOperation } from "./types.js";

/**
 * Decodes a credit-facade entry-point call into the matching
 * {@link OuterFacadeOperation}.
 *
 * Transaction-level metadata (`txHash`, `blockNumber`, `timestamp`) is not part
 * of the base `preview` operation: those values are only known once the
 * transaction is mined and are added in `history` mode. `creditAccount` is
 * `zeroAddress` for `openCreditAccount` (the address is assigned on-chain).
 *
 * @param sdk - The SDK instance.
 * @param facade - The credit facade contract.
 * @param calldata - The calldata to parse.
 * @returns The parsed operation.
 */
export function parseFacadeOperationCalldata(
  sdk: OnchainSDK,
  facade: CreditFacadeV310Contract,
  calldata: Hex,
): OuterFacadeOperation {
  const parsed = sdk.parseFunctionDataV2(facade.address, calldata);
  const functionName = parsed.functionName.split("(")[0];
  const { rawArgs } = parsed;

  const suite = sdk.marketRegister.creditManagers.find(cm =>
    isAddressEqual(cm.creditFacade.address, facade.address),
  );
  if (!suite) {
    throw new Error(`no credit suite found for facade ${facade.address}`);
  }

  const metadata: FacadeOperationMetadata = {
    creditManager: suite.creditManager.address,
    creditFacade: facade.address,
  };

  const innerCalls = (rawArgs.calls ?? []) as ParsedCallV2[];
  const multicall = classifyInnerOperations(innerCalls, {
    sdk,
    underlying: suite.underlying,
  });

  switch (functionName) {
    case "multicall":
      return {
        ...metadata,
        operation: "MultiCall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
      };
    case "botMulticall":
      return {
        ...metadata,
        operation: "BotMulticall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
      };
    case "openCreditAccount":
      return {
        ...metadata,
        operation: "OpenCreditAccount",
        creditAccount: zeroAddress,
        onBehalfOf: rawArgs.onBehalfOf as Address,
        referralCode: rawArgs.referralCode as bigint,
        multicall,
      };
    case "closeCreditAccount":
      return {
        ...metadata,
        operation: "CloseCreditAccount",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
      };
    case "liquidateCreditAccount":
      return {
        ...metadata,
        operation: "LiquidateCreditAccount",
        creditAccount: rawArgs.creditAccount as Address,
        to: rawArgs.to as Address,
        // `token` and `remainingFunds` are only emitted on-chain during
        // liquidation, so they are not recoverable from raw calldata.
        token: zeroAddress,
        remainingFunds: 0n,
        multicall,
      };
    case "partiallyLiquidateCreditAccount":
      return {
        ...metadata,
        operation: "PartiallyLiquidateCreditAccount",
        creditAccount: rawArgs.creditAccount as Address,
        token: rawArgs.token as Address,
        repaidAmount: rawArgs.repaidAmount as bigint,
        minSeizedAmount: rawArgs.minSeizedAmount as bigint,
        to: rawArgs.to as Address,
      };
    default:
      throw new Error(
        `unsupported credit facade function "${parsed.functionName}" on ${facade.address}`,
      );
  }
}
