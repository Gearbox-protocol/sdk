import type { OnchainSDK, PluginsMap } from "../../index.js";
import { AaveHorizonBridgeAdapterContract } from "../../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * Index at which an opening that moves to Aave Horizon in its own multicall
 * starts the move: the first Aave pool adapter call after the debt is drawn,
 * followed by a Horizon bridge borrow. `undefined` for a multicall that does
 * not move a position to Aave.
 *
 * The calls before it build the credit account an opening preview describes;
 * the rest supply its collateral to Aave and repay its debt with the loan
 * Aave takes in the owner's name.
 */
export function aaveMoveStart<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  multicall: InnerOperation[],
): number | undefined {
  const borrowed = multicall.findIndex(
    op => op.operation === "IncreaseBorrowedAmount",
  );
  if (borrowed < 0) {
    return undefined;
  }
  const start = multicall.findIndex(
    (op, i) =>
      i > borrowed &&
      op.operation === "Execute" &&
      sdk.getContract(op.adapter) instanceof AaveV3PoolAdapterContract,
  );
  if (start < 0) {
    return undefined;
  }
  const moves = multicall.slice(start + 1).some(op => {
    if (op.operation !== "Execute") {
      return false;
    }
    const adapter = sdk.getContract(op.adapter);
    return (
      adapter instanceof AaveHorizonBridgeAdapterContract &&
      adapter.parseBorrow(op.calldata) !== undefined
    );
  });
  return moves ? start : undefined;
}
