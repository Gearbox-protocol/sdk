import {
  asEstimated,
  type ExitStrategyPositionPreview,
  type MalformedTransactionError,
  type PreviewOperationInput,
  type RepayStrategyPositionPreview,
  type SDKReturn,
  sdkOk,
} from "../../../model/index.js";
import { AP_WETH_TOKEN, NO_VERSION } from "../../constants/address-provider.js";
import { MAX_UINT256 } from "../../constants/math.js";
import type { OnchainSDK, PluginsMap } from "../../index.js";
import type {
  CloseCreditAccountOperation,
  MulticallOperation,
  RWAMulticallOperation,
} from "../parse/index.js";
import { classifyCloseOrRepay } from "./detectCloseOrRepay.js";
import type { ReplayMulticallResult } from "./replayMulticall.js";
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
  sdk: OnchainSDK<P>,
  input: PreviewOperationInput,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  replay: ReplayMulticallResult,
): SDKReturn<
  ExitStrategyPositionPreview | RepayStrategyPositionPreview,
  MalformedTransactionError
> {
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

  const kind = classifyCloseOrRepay(operation.multicall, exitTokens);
  return kind === "close"
    ? sdkOk(previewCloseCreditAccount(sdk, operation, permanent, replay))
    : previewRepayCreditAccount(sdk, input, operation, permanent, replay);
}

/**
 * Previews a credit account closure: all collateral is swapped into
 * underlying, the debt is fully repaid and the remaining underlying is
 * withdrawn to the user.
 */
function previewCloseCreditAccount<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  replay: ReplayMulticallResult,
): ExitStrategyPositionPreview {
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { before, after } = replay;
  const account = after.account;
  const priced = market.priceOracle.safeConvertAssets(
    account.balances.toAssets(),
    market.underlying,
  );
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
    ...asEstimated(
      sdk.positions.projection(account.toSnapshot(priced.value), {
        availableLiquidityChange: before.totalDebt - account.totalDebt,
      }),
    ),
    creditAccount: operation.creditAccount,
    name: suite.accountStrategyName(operation.creditAccount),
    targetCollateral: suite.accountTargetCollateral(operation.creditAccount),
    receivedAmount: market.priceOracle.toTokenAmount(
      receivedToken,
      after.collateralWithdrawn.getOrZero(receivedToken),
    ),
    warning: priced.error,
  };
}

/**
 * Previews a credit account repayment: the debt is fully repaid (topped up
 * from the wallet when needed) and collateral is returned to the user
 * in-kind.
 */
function previewRepayCreditAccount<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  input: PreviewOperationInput,
  operation: CloseOrRepayOperation,
  permanent: boolean,
  replay: ReplayMulticallResult,
): SDKReturn<RepayStrategyPositionPreview, MalformedTransactionError> {
  const { value = 0n } = input;
  const market = sdk.marketRegister.findByCreditManager(
    operation.creditManager,
  );

  const { before, after } = replay;
  const account = after.account;

  const unwrapped = unwrapNativeCollateral(
    after.collateralAdded.toAssets(),
    value,
    sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
  );
  if (!unwrapped.ok) {
    return unwrapped;
  }
  const collateralAdded = unwrapped.data;
  const priced = market.priceOracle.safeConvertAssets(
    account.balances.toAssets(),
    market.underlying,
  );
  const suite = sdk.marketRegister.findCreditManager(operation.creditManager);

  return sdkOk({
    operation: "RepayCreditAccount",
    permanent,
    ...asEstimated(
      sdk.positions.projection(account.toSnapshot(priced.value), {
        availableLiquidityChange: before.totalDebt - account.totalDebt,
      }),
    ),
    creditAccount: operation.creditAccount,
    name: suite.accountStrategyName(operation.creditAccount),
    targetCollateral: suite.accountTargetCollateral(operation.creditAccount),
    collateralAdded: collateralAdded.map(a =>
      market.priceOracle.toTokenAmount(a.token, a.balance),
    ),
    debtRepaid: market.toUnderlyingAmount(before.totalDebt - account.totalDebt),
    collateralWithdrawn: after.collateralWithdrawn
      .toAssets()
      .map(a => market.priceOracle.toTokenAmount(a.token, a.balance)),
    warning: priced.error,
  });
}
