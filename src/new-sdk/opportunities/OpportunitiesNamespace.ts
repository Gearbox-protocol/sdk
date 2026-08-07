import type {
  HistoryQuery,
  HistorySeries,
  Opportunity,
  OpportunityFilter,
  OpportunityId,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import { opportunityId } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import type { ILogger } from "../../sdk/types/logger.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import type { ReadResult } from "../types.js";
import type { OpportunitiesBase, OpportunitiesOffchainOnly } from "./types.js";

/**
 * Fields the backend owns even when the chain also fills them.
 *
 * Empty of on-chain conflicts today — every yield group here is off-chain only,
 * so onchain-first would already yield the backend's value. It is written out
 * anyway so that adding an on-chain estimate of one of them is a deliberate
 * change to this list rather than a silent regression.
 **/
const OFFCHAIN_OWNED_FIELDS: ReadonlySet<string> = new Set([
  "supplyApy",
  "collateralApy",
]);

/**
 * The `opportunities` namespace of the combined SDK.
 *
 * A stateless router over the two sources, see {@link AbstractNamespace} for
 * the routing itself. What is specific to opportunities is the reads below and
 * the merge policy at the bottom of the class.
 *
 * The class implements the methods of every mode; {@link GearboxSDK} exposes it
 * as its mode's slice of {@link OpportunitiesByMode}, so calling a method the
 * mode does not have is a compile error rather than a runtime one.
 **/
export class OpportunitiesNamespace
  extends AbstractNamespace<Opportunity>
  implements OpportunitiesBase, OpportunitiesOffchainOnly
{
  constructor(
    onchain: MultichainSDK | undefined,
    offchain: GearboxAPI | undefined,
    logger?: ILogger,
  ) {
    super("Opportunities", onchain, offchain, logger);
  }

  /**
   * {@inheritDoc OpportunitiesBase.list}
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<ReadResult<Opportunity[]>> {
    return this.readList(
      "list opportunities",
      async sdk => {
        const { result, meta } = await sdk.opportunities.list(filter);
        return { value: result, chains: meta };
      },
      api => api.opportunities.list(filter),
    );
  }

  /**
   * {@inheritDoc OpportunitiesBase.getPool}
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<ReadResult<PoolOpportunityDetail>> {
    return this.readOne(
      "get pool opportunity",
      key.chainId,
      sdk => sdk.opportunities.getPool(key),
      api => api.opportunities.getPool(key),
    );
  }

  /**
   * {@inheritDoc OpportunitiesBase.getStrategy}
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<ReadResult<StrategyOpportunityDetail>> {
    return this.readOne(
      "get strategy opportunity",
      key.chainId,
      sdk => sdk.opportunities.getStrategy(key),
      api => api.opportunities.getStrategy(key),
    );
  }

  /**
   * {@inheritDoc OpportunitiesOffchainOnly.getHistory}
   **/
  public async getHistory(
    query: HistoryQuery,
  ): Promise<ReadResult<HistorySeries[]>> {
    return this.readOffchain(
      "get opportunity history",
      api => api.opportunities.getHistory(query),
      [],
    );
  }

  /**
   * Merges the two versions of one opportunity.
   *
   * The chain wins every field it fills; the backend fills the rest and owns
   * {@link OFFCHAIN_OWNED_FIELDS}.
   *
   * The rule is onchain-first, field-wise, and never deeper than one level: a
   * group like `totalSupply` or `supplyApy` is taken whole from one source, so
   * a row never mixes an on-chain token amount with a backend dollar value
   * derived from a different block.
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
   * Unions the two lists by canonical opportunity id.
   *
   * Rows present in both are merged by {@link OpportunitiesNamespace.mergeOne}.
   * Rows only the backend knows are appended: a chain the SDK does not cover,
   * or a market it has not loaded, is a reason to show more rather than fewer
   * opportunities.
   **/
  protected mergeList(
    onchain: Opportunity[],
    offchain: Opportunity[],
  ): Opportunity[] {
    const byId = new Map<OpportunityId, Opportunity>();
    for (const row of onchain) {
      byId.set(opportunityId(row), row);
    }

    const extra: Opportunity[] = [];
    for (const row of offchain) {
      const id = opportunityId(row);
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
