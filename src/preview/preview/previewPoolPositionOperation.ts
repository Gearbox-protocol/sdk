import type { PoolPositionOperationPreview } from "../../model/index.js";
import { isSDKError, type SDKReturn, sdkOk } from "../../model/index.js";
import type { PluginsMap } from "../../onchain/index.js";
import type { PoolOperation } from "../parse/index.js";
import type { PreviewSimulationError } from "../simulate/errors.js";
import { simulatePoolOperation } from "../simulate/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";

export async function previewPoolPositionOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<PoolPositionOperationPreview, PreviewSimulationError>> {
  const { sdk, to, calldata } = input;
  const { tokenIn, tokenOut } = operation;
  const market = sdk.marketRegister.findByPool(operation.pool);
  const answer = await simulatePoolOperation(
    { sdk, operation, to, calldata },
    options,
  );
  if (isSDKError(answer)) {
    return answer;
  }
  const sim = answer.data;

  return sdkOk({
    operation: operation.operation,
    pool: operation.pool,
    name: sdk.tokensMeta.mustGetToken(operation.pool).name,
    underlyingToken: market.underlyingToken,
    shareRate: market.pool.pool.dieselRate,
    tokenIn: market.priceOracle.toTokenAmount(tokenIn, sim.amountIn),
    tokenOut: market.priceOracle.toTokenAmount(tokenOut, sim.amountOut),
  });
}
