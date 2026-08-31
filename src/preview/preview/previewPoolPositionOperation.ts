import type { Address } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import type { PoolPositionOperationPreview } from "../../model/index.js";
import { type SDKReturn, sdkErr, sdkOk } from "../../model/index.js";
import type { MarketSuite, PluginsMap } from "../../onchain/index.js";
import type { PoolOperation } from "../parse/index.js";
import {
  asPreviewSimulationError,
  type PreviewSimulationError,
} from "../simulate/errors.js";
import {
  amountsInOut,
  previewContract,
} from "../simulate/simulatePoolOperation.js";
import type { PoolOperationSimulationResult } from "../simulate/types.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";

/**
 * Whose diesel the transaction moves: the receiver of minted shares on a
 * deposit/mint, the owner whose shares are burned on a withdraw/redeem.
 */
function shareHolder(operation: PoolOperation): Address {
  return "owner" in operation ? operation.owner : operation.receiver;
}

/**
 * Pool-underlying amount this transaction moves, signed: positive for
 * deposit/mint, negative for withdraw/redeem.
 *
 * Direct operations and zappers whose outside token is the (un)wrapped
 * underlying use the asset leg (calldata or the matching preview read). Any
 * other zapper converts the share leg at the pool diesel rate.
 */
function poolUnderlyingDelta(
  operation: PoolOperation,
  sim: PoolOperationSimulationResult,
  market: MarketSuite,
): bigint {
  const inflow =
    operation.operation === "Deposit" || operation.operation === "Mint";
  const outside = inflow ? operation.tokenIn : operation.tokenOut;
  const assets = inflow ? sim.amountIn : sim.amountOut;
  const shares = inflow ? sim.amountOut : sim.amountIn;
  const amount = market.isUnderlyingLike(outside)
    ? assets
    : market.pool.pool.convertToAssets(shares);
  return inflow ? amount : -amount;
}

export async function previewPoolPositionOperation<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<PoolPositionOperationPreview, PreviewSimulationError>> {
  const { sdk } = input;
  const { tokenIn, tokenOut } = operation;
  const market = sdk.marketRegister.findByPool(operation.pool);
  const holder = shareHolder(operation);

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

  const current = market.pool.pool.convertToAssets(shares);
  const after = current + poolUnderlyingDelta(operation, sim, market);

  return sdkOk({
    operation: operation.operation,
    pool: operation.pool,
    name: sdk.tokensMeta.mustGetToken(operation.pool).name,
    underlyingToken: market.underlyingToken,
    shareRate: market.pool.pool.dieselRate,
    tokenIn: market.priceOracle.toTokenAmount(tokenIn, sim.amountIn),
    tokenOut: market.priceOracle.toTokenAmount(tokenOut, sim.amountOut),
    curator: market.curator,
    netValue: market.toUnderlyingAmount(after < 0n ? 0n : after),
  });
}
