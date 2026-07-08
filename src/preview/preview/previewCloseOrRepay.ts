import {
  AP_WETH_TOKEN,
  type CreditAccountData,
  NO_VERSION,
  type PluginsMap,
} from "../../sdk/index.js";
import type {
  CloseCreditAccountOperation,
  MulticallOperation,
  RWAMulticallOperation,
  SdkWithAdapters,
} from "../parse/index.js";
import {
  applyInnerOperations,
  type InnerOperationsState,
  makeInnerOperationsState,
} from "./applyInnerOperations.js";
import { classifyCloseOrRepay } from "./detectCloseOrRepay.js";
import type {
  CloseCreditAccountPreview,
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
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

export async function previewCloseOrRepay<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  options?: PreviewOperationOptions,
): Promise<OperationPreview> {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );
  const kind = classifyCloseOrRepay(operation.multicall, market.underlying);
  return kind === "close"
    ? previewCloseCreditAccount(input, operation, permanent, options)
    : previewRepayCreditAccount(input, operation, permanent, options);
}

/**
 * Previews a credit account closure: all collateral is swapped into
 * underlying, the debt is fully repaid and the remaining underlying is
 * withdrawn to the user.
 */
async function previewCloseCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  options?: PreviewOperationOptions,
): Promise<CloseCreditAccountPreview> {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { state } = await replayMulticall(sdk, operation, options);

  return {
    operation: "CloseCreditAccount",
    permanent,
    creditManager: operation.creditManager,
    creditAccount: operation.creditAccount,
    receivedAmount: state.collateralWithdrawn.getOrZero(market.underlying),
  };
}

/**
 * Previews a credit account repayment: the debt is fully repaid (topped up
 * from the wallet when needed) and collateral is returned to the user
 * in-kind.
 */
async function previewRepayCreditAccount<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  options?: PreviewOperationOptions,
): Promise<RepayCreditAccountPreview> {
  const { sdk, value = 0n } = input;

  const { ca, state } = await replayMulticall(sdk, operation, options);

  const collateralAdded = unwrapNativeCollateral(
    state.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );

  const initialTotalDebt = ca.debt + ca.accruedInterest + ca.accruedFees;

  return {
    operation: "RepayCreditAccount",
    permanent,
    creditManager: operation.creditManager,
    creditAccount: operation.creditAccount,
    collateralAdded,
    debtRepaid: initialTotalDebt - state.totalDebt,
    collateralWithdrawn: state.collateralWithdrawn.toAssets(),
  };
}

/**
 * Fetches the account's pre-state (unless provided via options) and replays
 * the operation's multicall over it, exactly like the adjustment preview
 * does.
 */
async function replayMulticall<P extends PluginsMap>(
  sdk: SdkWithAdapters<P>,
  operation: CloseOrRepayOperation,
  options?: PreviewOperationOptions,
): Promise<{ ca: CreditAccountData; state: InnerOperationsState }> {
  let ca = options?.creditAccount;
  if (!ca) {
    ca = await sdk.accounts.getCreditAccountData(
      operation.creditAccount,
      options?.blockNumber,
    );
  }
  if (!ca) {
    throw new Error(`credit account ${operation.creditAccount} not found`);
  }

  const state = makeInnerOperationsState();
  for (const t of ca.tokens) {
    if (t.balance > 1n) {
      state.balances.upsert(t.token, t.balance);
    }
  }
  state.debt = ca.debt;
  state.totalDebt = ca.debt + ca.accruedInterest + ca.accruedFees;

  applyInnerOperations(sdk, operation.multicall, state);

  return { ca, state };
}
