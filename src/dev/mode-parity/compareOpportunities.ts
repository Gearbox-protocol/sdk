import type { Address } from "viem";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  Opportunity,
  OpportunityId,
  OpportunityKind,
} from "../../model/index.js";
import { opportunityId } from "../../model/index.js";
import {
  poolOpportunitySchema,
  strategyOpportunitySchema,
} from "../../model/opportunities.schema.js";
import { compileCompareRules, makeTagDiff } from "./compareRules.js";
import type {
  ChainCompareCounts,
  CompareCounts,
  DiffKind,
  DiffPathCount,
  ExpectedDiffReason,
  FieldDiff,
} from "./fieldDiff.js";
import {
  countPaths,
  diffObjects,
  toCompareCounts,
  union,
} from "./fieldDiff.js";

export type {
  ChainCompareCounts,
  CompareCounts,
  DiffKind,
  DiffPathCount,
  ExpectedDiffReason,
  FieldDiff,
};

const tagDiff = makeTagDiff({
  pool: compileCompareRules(poolOpportunitySchema),
  strategy: compileCompareRules(strategyOpportunitySchema),
});

/**
 * Enough of an opportunity to identify it in a report without carrying the
 * whole row.
 **/
export interface OpportunityRef {
  id: OpportunityId;
  kind: OpportunityKind;
  chainId: ChainId;
  name: string;
  /**
   * Set on a pool opportunity.
   **/
  pool?: Address;
  /**
   * Set on a strategy opportunity, together with {@link targetCollateral}.
   **/
  creditManager?: Address;
  targetCollateral?: Address;
}

/**
 * One opportunity both sources listed, and everything they disagree on.
 **/
export interface OpportunityMatch {
  id: OpportunityId;
  kind: OpportunityKind;
  chainId: ChainId;
  /**
   * Name each source gave the row, which is itself a frequent diff.
   **/
  onchainName: string;
  offchainName: string;
  /**
   * No unexpected diffs: every disagreement is mode-scoped or within tolerance.
   **/
  similar: boolean;
  diffs: FieldDiff[];
}

/**
 * Totals of the comparison plus the fields that differed most often.
 **/
export interface CompareSummary extends CompareCounts {
  byChain: ChainCompareCounts[];
  diffsByPath: DiffPathCount[];
}

/**
 * Everything one comparison run produced, ready to be written out as JSON.
 **/
export interface OpportunityCompareReport {
  generatedAt: string;
  backendUrl: string;
  networks: string[];
  /**
   * Per-chain metadata of the on-chain read, which says which block each chain
   * answered from.
   **/
  onchainChains: ChainMetadata[];
  /**
   * Per-chain metadata of the backend read, see {@link onchainChains}.
   **/
  offchainChains: ChainMetadata[];
  summary: CompareSummary;
  onlyOnchain: OpportunityRef[];
  onlyOffchain: OpportunityRef[];
  matched: OpportunityMatch[];
}

/**
 * The two listings to compare, plus what the run was pointed at.
 **/
export interface CompareOpportunitiesInput {
  onchain: DataResponse<Opportunity[]>;
  offchain: DataResponse<Opportunity[]>;
  backendUrl: string;
  networks: string[];
  /**
   * ISO timestamp stamped onto the report, defaulting to now. Pinned by tests.
   **/
  generatedAt?: string;
}

/**
 * Matches two opportunity listings by {@link opportunityId} and reports every
 * field the two sources disagree on.
 *
 * Nothing is filtered out. A field only the backend can fill, or a USD value
 * that drifted within snapshot-lag noise, is still reported — tagged
 * {@link FieldDiff.expected} so that {@link CompareCounts.similar} can ignore
 * it.
 **/
export function compareOpportunities(
  input: CompareOpportunitiesInput,
): OpportunityCompareReport {
  const onchainRows = indexById(input.onchain.data);
  const offchainRows = indexById(input.offchain.data);

  const onlyOnchain: OpportunityRef[] = [];
  const onlyOffchain: OpportunityRef[] = [];
  const matched: OpportunityMatch[] = [];

  for (const [id, row] of onchainRows) {
    const counterpart = offchainRows.get(id);
    if (!counterpart) {
      onlyOnchain.push(toRef(row));
      continue;
    }
    const diffs = diffOpportunity(row, counterpart);
    matched.push({
      id,
      kind: row.kind,
      chainId: row.chainId,
      onchainName: row.name,
      offchainName: counterpart.name,
      similar: diffs.every(diff => diff.expected),
      diffs,
    });
  }
  for (const [id, row] of offchainRows) {
    if (!onchainRows.has(id)) {
      onlyOffchain.push(toRef(row));
    }
  }

  byId(onlyOnchain);
  byId(onlyOffchain);
  matched.sort((a, b) => a.id.localeCompare(b.id));

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    backendUrl: input.backendUrl,
    networks: [...input.networks],
    onchainChains: input.onchain.meta.chains,
    offchainChains: input.offchain.meta.chains,
    summary: summarize(
      input.onchain.data,
      input.offchain.data,
      onlyOnchain,
      onlyOffchain,
      matched,
    ),
    onlyOnchain,
    onlyOffchain,
    matched,
  };
}

function indexById(rows: Opportunity[]): Map<OpportunityId, Opportunity> {
  return new Map(rows.map(row => [opportunityId(row), row]));
}

function byId(refs: OpportunityRef[]): void {
  refs.sort((a, b) => a.id.localeCompare(b.id));
}

function toRef(row: Opportunity): OpportunityRef {
  const base = {
    id: opportunityId(row),
    kind: row.kind,
    chainId: row.chainId,
    name: row.name,
  };
  return row.kind === "pool"
    ? { ...base, pool: row.pool }
    : {
        ...base,
        creditManager: row.creditManager,
        targetCollateral: row.targetCollateral.address,
      };
}

/**
 * Every field two versions of one opportunity disagree on.
 **/
export function diffOpportunity(
  onchain: Opportunity,
  offchain: Opportunity,
): FieldDiff[] {
  return diffObjects(onchain, offchain).map(diff =>
    tagDiff(diff, onchain.kind),
  );
}

function summarize(
  onchain: Opportunity[],
  offchain: Opportunity[],
  onlyOnchain: OpportunityRef[],
  onlyOffchain: OpportunityRef[],
  matched: OpportunityMatch[],
): CompareSummary {
  const chainIds = union(
    onchain.map(row => String(row.chainId)),
    offchain.map(row => String(row.chainId)),
  );

  const byChain = chainIds
    .map(chainId => ({
      chainId: Number(chainId),
      ...toCompareCounts(
        onchain.filter(row => String(row.chainId) === chainId).length,
        offchain.filter(row => String(row.chainId) === chainId).length,
        onlyOnchain.filter(ref => String(ref.chainId) === chainId).length,
        onlyOffchain.filter(ref => String(ref.chainId) === chainId).length,
        matched.filter(match => String(match.chainId) === chainId),
      ),
    }))
    .sort((a, b) => a.chainId - b.chainId);

  return {
    ...toCompareCounts(
      onchain.length,
      offchain.length,
      onlyOnchain.length,
      onlyOffchain.length,
      matched,
    ),
    byChain,
    diffsByPath: countPaths(
      matched.flatMap(match =>
        match.diffs.map(diff => ({ id: match.id, diff })),
      ),
    ),
  };
}
