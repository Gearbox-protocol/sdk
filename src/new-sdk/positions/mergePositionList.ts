import type {
  DataResponse,
  Position,
  StrategyPosition,
} from "../../model/index.js";
import { positionId } from "../../model/index.js";
import { mergeChainList } from "../utils/mergeChains.js";
import type { MergeListResult } from "../utils/types.js";

/**
 * Merges two position lists under the same per-chain freshness rule as
 * {@link mergeChainList}, then overlays the backend's `targetCollateral` and
 * `name` onto every strategy row the backend has — even when that chain was
 * served from on-chain data because the backend was stale.
 *
 * The backend records the collateral the strategy was opened into; the chain
 * can only guess from current holdings. `name` is derived from that collateral,
 * so it follows the same override.
 **/
export function mergePositionList<
  Onchain extends DataResponse<Position[]> | undefined,
  Offchain extends DataResponse<Position[]> | undefined,
>(
  onchain: Onchain,
  offchain: Offchain,
  maxLagSeconds?: number,
): MergeListResult<Onchain, Offchain, Position[]>;
export function mergePositionList(
  onchain: DataResponse<Position[]> | undefined,
  offchain: DataResponse<Position[]> | undefined,
  maxLagSeconds?: number,
): DataResponse<Position[]> | undefined {
  const merged = mergeChainList<
    Position,
    DataResponse<Position[]> | undefined,
    DataResponse<Position[]> | undefined
  >(onchain, offchain, maxLagSeconds);
  if (!merged || !offchain) {
    return merged;
  }

  const backendById = new Map(
    offchain.data
      .filter((row): row is StrategyPosition => row.kind === "strategy")
      .map(row => [positionId(row), row]),
  );

  return {
    ...merged,
    data: merged.data.map(row => {
      const backend =
        row.kind === "strategy" ? backendById.get(positionId(row)) : undefined;
      return backend
        ? {
            ...row,
            targetCollateral: backend.targetCollateral,
            name: backend.name,
          }
        : row;
    }),
  };
}
