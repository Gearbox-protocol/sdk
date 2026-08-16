import type { Address } from "viem";
import type {
  HistoryRange,
  PoolPositionHistoryMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  PositionHistoryMetric,
  PositionId,
  PositionKey,
  PositionList,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import { positionId } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import type { ILogger } from "../../sdk/types/logger.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import type { ReadResult } from "../types.js";
import type { Chart, HistoryReader } from "../utils/index.js";
import type { PositionsBase, PositionsOffchainOnly } from "./types.js";

/**
 * Fields the backend owns even when the chain also fills them.
 *
 * The yield and PnL groups are derived from a position's history and from
 * incentive programs, neither of which the chain has. `targetCollateral` is
 * there for a subtler reason: the read model defines it as the collateral the
 * position was opened into, which only the backend can know, while the chain
 * approximates it with the dominant collateral held right now.
 **/
const OFFCHAIN_OWNED_FIELDS: ReadonlySet<string> = new Set([
  "apy",
  "netApy",
  "pnl",
  "targetCollateral",
]);

/**
 * The `positions` namespace of the combined SDK.
 *
 * A stateless router over the two sources, see {@link AbstractNamespace} for the
 * routing itself. What is specific to positions is the reads below and the merge
 * policy at the bottom of the class.
 *
 * The class implements the methods of every mode; {@link GearboxSDK} exposes it
 * as its mode's slice of {@link PositionsByMode}, so calling a method the mode
 * does not have is a compile error rather than a runtime one.
 **/
export class PositionsNamespace
  extends AbstractNamespace<Position>
  implements PositionsBase, PositionsOffchainOnly
{
  constructor(
    onchain: MultichainSDK | undefined,
    offchain: GearboxAPI | undefined,
    logger?: ILogger,
  ) {
    super("Positions", onchain, offchain, logger);
  }

  /**
   * {@inheritDoc PositionsBase.list}
   **/
  public async list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<ReadResult<PositionList>> {
    return this.read<PositionList>(
      "list positions",
      async sdk => {
        const { result, meta } = await sdk.positions.list({ wallet, filter });
        return { value: { positions: result }, chains: meta };
      },
      api => api.positions.list(wallet, filter),
      (onchain, offchain) => ({
        positions: this.mergeList(
          onchain?.positions ?? [],
          offchain?.positions ?? [],
        ),
        ...(offchain?.summary ? { summary: offchain.summary } : {}),
      }),
    );
  }

  /**
   * {@inheritDoc PositionsOffchainOnly.history}
   **/
  public history(
    key: PoolPositionRef,
  ): HistoryReader<PoolPositionHistoryMetric>;
  public history(
    key: StrategyPositionRef,
  ): HistoryReader<StrategyPositionHistoryMetric>;
  public history(
    key: PositionKey,
  ):
    | HistoryReader<PoolPositionHistoryMetric>
    | HistoryReader<StrategyPositionHistoryMetric> {
    // nothing is fetched here: the reader is a view over the backend read, so
    // each chart is requested on its own, when it is asked for
    return {
      chart: (metric: PositionHistoryMetric, range: HistoryRange) =>
        this.#chart(key, metric, range),
    };
  }

  /**
   * Reads one chart of one position from the backend.
   *
   * The metric a caller may name is gated by the reader's type, so the kind of
   * the key is not re-checked here.
   **/
  async #chart(
    key: PositionKey,
    metric: PositionHistoryMetric,
    range: HistoryRange,
  ): Promise<Chart> {
    const { result, meta } = await this.readOffchain(
      `get ${metric} history`,
      api => api.positions.getHistory({ position: key, range, metric }),
      { metric, points: [], metadata: {} },
    );
    return {
      data: result.points,
      metadata: { ...result.metadata, source: meta },
    };
  }

  /**
   * Merges the two versions of one position.
   *
   * The chain wins every field it fills; the backend fills the rest and owns
   * {@link OFFCHAIN_OWNED_FIELDS}.
   *
   * The rule is onchain-first, field-wise, and never deeper than one level: a
   * group like `totalValue` or `apy` is taken whole from one source, so a row
   * never mixes an on-chain token amount with a backend dollar value derived
   * from a different block.
   **/
  protected mergeOne<T extends object>(onchain: T, offchain: T): T {
    const merged = { ...onchain } as Record<string, unknown>;
    for (const [field, value] of Object.entries(offchain)) {
      if (value === undefined) {
        continue;
      }
      if (OFFCHAIN_OWNED_FIELDS.has(field) || merged[field] === undefined) {
        merged[field] = value;
      }
    }
    return merged as T;
  }

  /**
   * Unions the two lists by canonical position id.
   *
   * Rows present in both are merged by {@link PositionsNamespace.mergeOne}.
   * Rows only the backend knows are appended: a chain the SDK does not cover,
   * or a market it has not loaded, must not hide a position the wallet actually
   * holds.
   **/
  protected mergeList(onchain: Position[], offchain: Position[]): Position[] {
    const byId = new Map<PositionId, Position>();
    for (const row of onchain) {
      byId.set(positionId(row), row);
    }

    const extra: Position[] = [];
    for (const row of offchain) {
      const id = positionId(row);
      const existing = byId.get(id);
      if (existing) {
        byId.set(id, this.mergeOne(existing, row));
      } else {
        extra.push(row);
      }
    }

    return [...byId.values(), ...extra];
  }
}
