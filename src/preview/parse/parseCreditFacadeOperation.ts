import {
  type Address,
  type Hex,
  isAddressEqual,
  zeroAddress,
  zeroHash,
} from "viem";
import type {
  FacadeOperationMetadata,
  OuterFacadeOperation,
} from "../../history/index.js";
import type {
  CreditFacadeV310Contract,
  OnchainSDK,
  ParsedCallV2,
} from "../../sdk/index.js";
import { classifyInnerOperations } from "./classifyInnerOperations.js";

export interface ParseCreditFacadeOperationProps {
  sdk: OnchainSDK;
  /** Resolved credit facade contract for the transaction target. */
  facade: CreditFacadeV310Contract;
  calldata: Hex;
}

/**
 * Decodes a credit-facade entry-point call into the matching
 * {@link OuterFacadeOperation}.
 *
 * Metadata is partial: `txHash` is `zeroHash` and `timestamp` is `0` because
 * those are only known once the transaction is mined. `creditAccount` is
 * `zeroAddress` for `openCreditAccount` (the address is assigned on-chain).
 */
export function parseCreditFacadeOperation(
  props: ParseCreditFacadeOperationProps,
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
    blockNumber: Number(sdk.currentBlock),
    txHash: zeroHash,
    timestamp: 0,
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
