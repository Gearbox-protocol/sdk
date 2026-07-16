import { AP_WETH_TOKEN, NO_VERSION, type PluginsMap } from "../../sdk/index.js";
import type {
  CloseCreditAccountOperation,
  MulticallOperation,
  RWAMulticallOperation,
} from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import { classifyCloseOrRepay } from "./detectCloseOrRepay.js";
import {
  type ReplayMulticallResult,
  replayMulticall,
} from "./replayMulticall.js";
import type {
  CloseCreditAccountPreview,
  RepayCreditAccountPreview,
} from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

/**
 * Any parsed operation that fully closes or repays a credit account: the
 * facade `closeCreditAccount` entry point (permanent closure) or a plain
 * multicall detected by `isCloseOrRepay` (zero-debt closure/repay).
 */
export type CloseOrRepayOperation =
  | CloseCreditAccountOperation
  | MulticallOperation
  | RWAMulticallOperation;

export async function previewCloseOrRepayCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  options: PreviewOperationOptions<true>,
): Promise<CloseCreditAccountPreview | RepayCreditAccountPreview> {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const replay = await replayMulticall(sdk, operation, options);
  const kind = classifyCloseOrRepay(operation.multicall, market.underlying);
  return kind === "close"
    ? previewCloseCreditAccount(input, operation, permanent, replay)
    : previewRepayCreditAccount(input, operation, permanent, replay);
}

/**
 * Previews a credit account closure: all collateral is swapped into
 * underlying, the debt is fully repaid and the remaining underlying is
 * withdrawn to the user.
 */
function previewCloseCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  replay: ReplayMulticallResult,
): CloseCreditAccountPreview {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { after, error } = replay;

  return {
    operation: "CloseCreditAccount",
    permanent,
    creditManager: operation.creditManager,
    creditAccount: operation.creditAccount,
    // On a malformed multicall the withdrawn amount depends on best-effort
    // replayed balances and may be unreliable
    receivedAmount: after.collateralWithdrawn.getOrZero(market.underlying),
    error,
  };
}

/**
 * Previews a credit account repayment: the debt is fully repaid (topped up
 * from the wallet when needed) and collateral is returned to the user
 * in-kind.
 */
function previewRepayCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  replay: ReplayMulticallResult,
): RepayCreditAccountPreview {
  const { sdk, value = 0n } = input;

  const { before, after, error: replayError } = replay;

  const { assets: collateralAdded, error: unwrapError } =
    unwrapNativeCollateral(
      after.collateralAdded.toAssets(),
      value,
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
    );
  const error = replayError ?? unwrapError;

  return {
    operation: "RepayCreditAccount",
    permanent,
    creditManager: operation.creditManager,
    creditAccount: operation.creditAccount,
    collateralAdded,
    debtRepaid: before.totalDebt - after.account.totalDebt,
    // On a malformed multicall the MAX_UINT256 withdrawal sentinel resolves
    // against best-effort replayed balances and may be unreliable
    collateralWithdrawn: after.collateralWithdrawn.toAssets(),
    error,
  };
}
