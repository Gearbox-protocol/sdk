import type {
  ExitStrategyPositionPreview,
  RepayStrategyPositionPreview,
} from "../../model/index.js";
import {
  AP_WETH_TOKEN,
  MAX_UINT256,
  NO_VERSION,
  type PluginsMap,
} from "../../onchain/index.js";
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
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

/**
 * Any parsed operation that fully closes or repays a credit account: the
 * facade `closeCreditAccount` entry point (permanent closure) or a plain
 * multicall detected by `isCloseOrRepay` (`decreaseDebt(MAX)`).
 */
export type CloseOrRepayOperation =
  | CloseCreditAccountOperation
  | MulticallOperation
  | RWAMulticallOperation;

export function previewExitOrRepayStrategyPosition<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  options: PreviewOperationOptions<true>,
): ExitStrategyPositionPreview | RepayStrategyPositionPreview {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  // when RWA account is closed, we unwrap underlying before withrawing it (meta.asset)
  // Hovewer, withdrawing plain underlying is still supported
  const exitTokens = [market.underlying];
  const meta = sdk.tokensMeta.get(market.underlying);
  if (meta && sdk.tokensMeta.isRWAUnderlying(meta)) {
    exitTokens.push(meta.asset);
  }

  const replay = replayMulticall(sdk, operation, options);
  const kind = classifyCloseOrRepay(operation.multicall, exitTokens);
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
): ExitStrategyPositionPreview {
  const { sdk } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { after, error } = replay;
  const suite = sdk.marketRegister.findCreditManager(operation.creditManager);

  // in case of RWA markets, withdrawn token might be underlying (dcUSDC)
  // or unwrapped underlying (USDC)
  let receivedToken = market.underlying;
  for (const m of operation.multicall) {
    if (m.operation === "WithdrawCollateral" && m.amount === MAX_UINT256) {
      receivedToken = m.token;
      break;
    }
  }

  return {
    operation: "CloseCreditAccount",
    permanent,
    ...suite.creditOperationMarket(),
    creditAccount: operation.creditAccount,
    name: suite.accountStrategyName(operation.creditAccount),
    targetCollateral: suite.accountTargetCollateral(operation.creditAccount),
    // On a malformed multicall the withdrawn amount depends on best-effort
    // replayed balances and may be unreliable
    receivedAmount: market.priceOracle.toTokenAmount(
      receivedToken,
      after.collateralWithdrawn.getOrZero(receivedToken),
    ),
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
): RepayStrategyPositionPreview {
  const { sdk, value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { before, after, error: replayError } = replay;

  const { assets: collateralAdded, error: unwrapError } =
    unwrapNativeCollateral(
      after.collateralAdded.toAssets(),
      value,
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
    );
  const error = replayError ?? unwrapError;
  const suite = sdk.marketRegister.findCreditManager(operation.creditManager);

  return {
    operation: "RepayCreditAccount",
    permanent,
    ...suite.creditOperationMarket(),
    creditAccount: operation.creditAccount,
    name: suite.accountStrategyName(operation.creditAccount),
    targetCollateral: suite.accountTargetCollateral(operation.creditAccount),
    collateralAdded: collateralAdded.map(a =>
      market.priceOracle.toTokenAmount(a.token, a.balance),
    ),
    debtRepaid: market.toUnderlyingAmount(
      before.totalDebt - after.account.totalDebt,
    ),
    // On a malformed multicall the MAX_UINT256 withdrawal sentinel resolves
    // against best-effort replayed balances and may be unreliable
    collateralWithdrawn: after.collateralWithdrawn
      .toAssets()
      .map(a => market.priceOracle.toTokenAmount(a.token, a.balance)),
    error,
  };
}
