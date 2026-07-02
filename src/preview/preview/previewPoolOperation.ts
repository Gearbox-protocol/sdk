import type { PluginsMap } from "../../sdk/index.js";
import type { PoolOperation } from "../parse/index.js";
import {
  type OperationSimulationOptions,
  simulatePoolOperation,
} from "../simulate/index.js";
import type { PoolOperationPreview, PreviewOperationInput } from "./types.js";

export async function previewPoolOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: OperationSimulationOptions,
): Promise<PoolOperationPreview> {
  const { sdk, to, calldata } = input;
  const { tokenIn, tokenOut } = operation;
  const sim = await simulatePoolOperation(
    { sdk, operation, to, calldata },
    options,
  );

  if (sim.status === "success") {
    return {
      operation: operation.operation,
      pool: operation.pool,
      tokenIn: { token: tokenIn, balance: sim.amountIn },
      tokenOut: { token: tokenOut, balance: sim.amountOut },
    };
  }

  // The calldata-known side keeps its amount; the previewed side carries the
  // simulation error instead.
  const { error } = sim;
  switch (operation.operation) {
    case "Deposit":
      return {
        operation: "Deposit",
        pool: operation.pool,
        tokenIn: { token: tokenIn, balance: operation.assets },
        tokenOut: { token: tokenOut, error },
      };
    case "Mint":
      return {
        operation: "Mint",
        pool: operation.pool,
        tokenIn: { token: tokenIn, error },
        tokenOut: { token: tokenOut, balance: operation.shares },
      };
    case "Withdraw":
      return {
        operation: "Withdraw",
        pool: operation.pool,
        tokenIn: { token: tokenIn, error },
        tokenOut: { token: tokenOut, balance: operation.assets },
      };
    case "Redeem":
      return {
        operation: "Redeem",
        pool: operation.pool,
        tokenIn: { token: tokenIn, balance: operation.shares },
        tokenOut: { token: tokenOut, error },
      };
  }
}
