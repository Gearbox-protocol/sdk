import { type Address, type Hex, isAddressEqual, zeroAddress } from "viem";
import type {
  CreditFacadeV310Contract,
  OnchainSDK,
  ParsedCallV2,
} from "../../sdk/index.js";
import { classifyInnerOperations } from "./classifyInnerOperations.js";
import { extractExpectedBalanceChanges } from "./extractExpectedBalanceChanges.js";
import type { FacadeOperationMetadata, OuterFacadeOperation } from "./types.js";

export interface ParseFacadeOperationCalldataProps {
  sdk: OnchainSDK;
  /** Resolved credit facade contract for the transaction target. */
  facade: CreditFacadeV310Contract;
  calldata: Hex;
}

/**
 * Decodes a credit-facade entry-point call into the matching
 * {@link OuterFacadeOperation}.
 *
 * Transaction-level metadata (`txHash`, `blockNumber`, `timestamp`) is not part
 * of the base `preview` operation: those values are only known once the
 * transaction is mined and are added in `history` mode. `creditAccount` is
 * `zeroAddress` for `openCreditAccount` (the address is assigned on-chain).
 */
export function parseFacadeOperationCalldata(
  props: ParseFacadeOperationCalldataProps,
): OuterFacadeOperation {
  const { sdk, facade, calldata } = props;
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
  const expectedBalanceChanges = extractExpectedBalanceChanges(innerCalls);

  switch (functionName) {
    case "multicall":
      return {
        ...metadata,
        operation: "MultiCall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
        expectedBalanceChanges,
      };
    case "botMulticall":
      return {
        ...metadata,
        operation: "BotMulticall",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
        expectedBalanceChanges,
      };
    case "openCreditAccount":
      return {
        ...metadata,
        operation: "OpenCreditAccount",
        creditAccount: zeroAddress,
        onBehalfOf: rawArgs.onBehalfOf as Address,
        referralCode: rawArgs.referralCode as bigint,
        multicall,
        expectedBalanceChanges,
      };
    case "closeCreditAccount":
      return {
        ...metadata,
        operation: "CloseCreditAccount",
        creditAccount: rawArgs.creditAccount as Address,
        multicall,
        expectedBalanceChanges,
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
        expectedBalanceChanges,
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
