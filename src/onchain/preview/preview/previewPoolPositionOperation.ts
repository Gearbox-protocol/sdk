import type { ContractFunctionParameters } from "viem";
import { iPoolV310Abi } from "../../../abi/310/generated.js";
import { ierc20Abi } from "../../../abi/iERC20.js";
import { iZapperAbi } from "../../../abi/iZapper.js";
import type {
  PoolPositionOperationPreview,
  PreviewOperationOptions,
} from "../../../model/index.js";
import {
  type PoolOperationPreviewError,
  type SDKReturn,
  sdkErr,
  sdkOk,
} from "../../../model/index.js";
import type { OnchainSDK, PluginsMap } from "../../index.js";
import type { PoolOperation } from "../parse/index.js";

/** ERC4626 preview read paired with each pool operation kind. */
type PreviewFunctionName =
  | "previewDeposit"
  | "previewMint"
  | "previewWithdraw"
  | "previewRedeem";

interface PreviewRead {
  functionName: PreviewFunctionName;
  amount: bigint;
}

function previewRead(operation: PoolOperation): PreviewRead {
  switch (operation.operation) {
    case "Deposit":
      return { functionName: "previewDeposit", amount: operation.assets };
    case "Mint":
      return { functionName: "previewMint", amount: operation.shares };
    case "Withdraw":
      return { functionName: "previewWithdraw", amount: operation.assets };
    case "Redeem":
      return { functionName: "previewRedeem", amount: operation.shares };
  }
}

/**
 * Builds the preview read that converts the operation's known amount into its
 * counterpart. Direct operations read the pool's ERC4626 preview; zapper-routed
 * operations (only ever `Deposit`/`Redeem`) read the zapper's
 * `previewDeposit`/`previewRedeem`, which account for the zapper's own
 * conversion in addition to the pool's.
 */
function previewContract(operation: PoolOperation): ContractFunctionParameters {
  const { functionName, amount } = previewRead(operation);
  if (operation.zapper) {
    return {
      address: operation.zapper,
      abi: iZapperAbi,
      functionName,
      args: [amount],
    };
  }
  return {
    address: operation.pool,
    abi: iPoolV310Abi,
    functionName,
    args: [amount],
  };
}

interface PoolOperationAmounts {
  amountIn: bigint;
  amountOut: bigint;
}

/**
 * Maps a pool operation and its preview result to the amounts of tokens going
 * in (user -> pool) and out (pool -> user). `previewAmount` is the counterpart
 * amount returned by the matching preview read (shares for deposit/withdraw,
 * assets for mint/redeem, and the zapper's converted amount for zapper-routed
 * deposit/redeem).
 */
function amountsInOut(
  operation: PoolOperation,
  previewAmount: bigint,
): PoolOperationAmounts {
  switch (operation.operation) {
    case "Deposit":
      return { amountIn: operation.assets, amountOut: previewAmount };
    case "Mint":
      return { amountIn: previewAmount, amountOut: operation.shares };
    case "Withdraw":
      return { amountIn: previewAmount, amountOut: operation.assets };
    case "Redeem":
      return { amountIn: operation.shares, amountOut: previewAmount };
  }
}

export async function previewPoolPositionOperation<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  operation: PoolOperation,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<PoolPositionOperationPreview, PoolOperationPreviewError>> {
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
    const error = {
      code: "poolOperationPreviewError",
      message: cause instanceof Error ? cause.message : String(cause),
      pool: operation.pool,
      cause: cause instanceof Error ? cause : new Error(String(cause)),
    } satisfies PoolOperationPreviewError;
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
