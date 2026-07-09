import type { PluginsMap } from "../../sdk/index.js";
import type { PoolOperation } from "../parse/index.js";
import { simulatePoolOperation } from "../simulate/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";
import type { PoolOperationPreview } from "./types.js";

export async function previewPoolOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<PoolOperationPreview> {
  const { sdk, to, calldata } = input;
  const { tokenIn, tokenOut } = operation;
  const sim = await simulatePoolOperation(
    { sdk, operation, to, calldata },
    options,
  );

  return {
    operation: operation.operation,
    pool: operation.pool,
    tokenIn: { token: tokenIn, balance: sim.amountIn },
    tokenOut: { token: tokenOut, balance: sim.amountOut },
  };
}
