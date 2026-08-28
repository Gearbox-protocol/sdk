import type { PoolPositionOperationPreview } from "../../model/index.js";
import type { PluginsMap } from "../../onchain/index.js";
import type { PoolOperation } from "../parse/index.js";
import { simulatePoolOperation } from "../simulate/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";

export async function previewPoolPositionOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<PoolPositionOperationPreview> {
  const { sdk, to, calldata } = input;
  const { tokenIn, tokenOut } = operation;
  const market = sdk.marketRegister.findByPool(operation.pool);
  const sim = await simulatePoolOperation(
    { sdk, operation, to, calldata },
    options,
  );

  return {
    operation: operation.operation,
    pool: operation.pool,
    name: sdk.tokensMeta.mustGetToken(operation.pool).name,
    shareRate: market.pool.pool.dieselRate,
    tokenIn: market.priceOracle.toTokenAmount(tokenIn, sim.amountIn),
    tokenOut: market.priceOracle.toTokenAmount(tokenOut, sim.amountOut),
  };
}
