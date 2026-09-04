import { ierc20Abi } from "../../abi/iERC20.js";
import type { PoolPositionOperationPreview } from "../../model/index.js";
import { type SDKReturn, sdkErr, sdkOk } from "../../model/index.js";
import type { PluginsMap } from "../../onchain/index.js";
import type { PoolOperation } from "../parse/index.js";
import {
  asPreviewSimulationError,
  type PreviewSimulationError,
} from "../simulate/errors.js";
import {
  amountsInOut,
  previewContract,
} from "../simulate/simulatePoolOperation.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";

export async function previewPoolPositionOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<PoolPositionOperationPreview, PreviewSimulationError>> {
  const { sdk } = input;
  const { tokenIn, tokenOut } = operation;
  const market = sdk.marketRegister.findByPool(operation.pool);
  const pool = market.pool.pool;
  const holder = "owner" in operation ? operation.owner : operation.receiver;

  let previewAmount: bigint;
  let shares: bigint;
  try {
    [previewAmount, shares] = (await sdk.client.multicall({
      contracts: [
        previewContract(operation),
        {
          address: operation.pool,
          abi: ierc20Abi,
          functionName: "balanceOf",
          args: [holder],
        },
      ],
      allowFailure: false,
      batchSize: 0,
      blockNumber: options?.blockNumber,
    })) as [bigint, bigint];
  } catch (cause) {
    const error = asPreviewSimulationError(cause, "multicall");
    options?.logger?.error(error, "pool operation simulation failed");
    return sdkErr(error);
  }
  const sim = amountsInOut(operation, previewAmount);

  const inflow =
    operation.operation === "Deposit" || operation.operation === "Mint";
  const after = shares + (inflow ? sim.amountOut : -sim.amountIn);

  return sdkOk({
    operation: operation.operation,
    pool: operation.pool,
    zapper: operation.zapper,
    holder,
    name: sdk.tokensMeta.mustGetToken(operation.pool).name,
    underlyingToken: market.underlyingToken,
    shareRate: pool.dieselRate,
    tokenIn: market.priceOracle.toTokenAmount(tokenIn, sim.amountIn),
    tokenOut: market.priceOracle.toTokenAmount(tokenOut, sim.amountOut),
    curator: market.curator,
    netValue: market.toUnderlyingAmount(
      pool.sharesToUnderlying(after > 0n ? after : 0n),
    ),
  });
}
