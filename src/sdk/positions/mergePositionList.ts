import type {
  DataResponse,
  Position,
  StrategyPosition,
} from "../../model/index.js";
import { positionId } from "../../model/index.js";
import { mergeChainList } from "../utils/mergeChains.js";
import type { MergeListResult } from "../utils/types.js";

type PositionListResponse = DataResponse<Position[]> | undefined;

interface PositionGroups {
  nonLiquidations: PositionListResponse;
  liquidations: PositionListResponse;
}

/**
 * Merges two position lists under the same per-chain freshness rule as
 * {@link mergeChainList}, then overlays the backend's `targetCollateral` and
 * `name` onto every strategy row the backend has — even when that chain was
 * served from on-chain data because the backend was stale.
 *
 * Liquidation rows are merged independently: the backend does not serve them
 * yet, so a fresh off-chain list must not drop on-chain liquidations. Once it
 * does return them, they follow the same freshness rule as the rest of the
 * list.
 *
 * The chain resolves `targetCollateral` from a per-account override or the
 * credit manager's single target token. The backend's historical value is
 * still preferred when it has the row. `name` is derived from that collateral,
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
  const onchainGroups = splitPositionsByKind(onchain);
  const offchainGroups = splitPositionsByKind(offchain);

  const mergedNonLiquidations = overlayBackendStrategyFields(
    mergeChainList<Position, PositionListResponse, PositionListResponse>(
      onchainGroups.nonLiquidations,
      offchainGroups.nonLiquidations,
      maxLagSeconds,
    ),
    offchainGroups.nonLiquidations,
  );
  const mergedLiquidations = mergeChainList<
    Position,
    PositionListResponse,
    PositionListResponse
  >(onchainGroups.liquidations, offchainGroups.liquidations, maxLagSeconds);

  return combineGroups(mergedNonLiquidations, mergedLiquidations);
}

function overlayBackendStrategyFields(
  merged: PositionListResponse,
  offchain: PositionListResponse,
): PositionListResponse {
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

function splitPositionsByKind(response: PositionListResponse): PositionGroups {
  if (!response) {
    return {
      nonLiquidations: undefined,
      liquidations: undefined,
    };
  }

  const nonLiquidationRows: Position[] = [];
  const liquidationRows: Position[] = [];
  for (const row of response.data) {
    if (row.kind === "liquidation") {
      liquidationRows.push(row);
    } else {
      nonLiquidationRows.push(row);
    }
  }

  return {
    nonLiquidations: {
      ...response,
      data: nonLiquidationRows,
    },
    liquidations: liquidationRowsToResponse(response, liquidationRows),
  };
}

/**
 * Liquidation rows of one source, or `undefined` when it served none, so
 * {@link mergeChainList} cannot pick an empty backend list over on-chain rows.
 **/
function liquidationRowsToResponse(
  source: DataResponse<Position[]>,
  rows: Position[],
): PositionListResponse {
  if (rows.length === 0) {
    return undefined;
  }
  const chainIds = new Set(rows.map(row => row.chainId));
  return {
    data: rows,
    meta: {
      ...source.meta,
      chains: source.meta.chains.filter(chain => chainIds.has(chain.chainId)),
    },
  };
}

function combineGroups(
  nonLiquidations: PositionListResponse,
  liquidations: PositionListResponse,
): PositionListResponse {
  if (!nonLiquidations) {
    return liquidations;
  }
  if (!liquidations) {
    return nonLiquidations;
  }
  return {
    ...nonLiquidations,
    data: [...nonLiquidations.data, ...liquidations.data],
  };
}
