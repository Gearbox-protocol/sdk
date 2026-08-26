import type { Address } from "viem";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  Position,
  PositionId,
  PositionKind,
} from "../../model/index.js";
import { positionId } from "../../model/index.js";
import { liquidationPositionSchema } from "../../model/liquidations.schema.js";
import {
  poolPositionSchema,
  strategyPositionSchema,
} from "../../model/positions.schema.js";
import { compileCompareRules, makeTagDiff } from "./compareRules.js";
import type {
  ChainCompareCounts,
  CompareCounts,
  DiffPathCount,
  FieldDiff,
} from "./fieldDiff.js";
import {
  countPaths,
  diffObjects,
  isRecord,
  toCompareCounts,
  union,
} from "./fieldDiff.js";

const tagDiff = makeTagDiff({
  pool: compileCompareRules(poolPositionSchema),
  strategy: compileCompareRules(strategyPositionSchema),
  liquidation: compileCompareRules(liquidationPositionSchema),
});

/**
 * Enough of a position to identify it in a report without carrying the whole
 * row.
 **/
export interface PositionRef {
  id: PositionId;
  kind: PositionKind;
  chainId: ChainId;
  name: string;
  /**
   * Set on a pool position.
   **/
  pool?: Address;
  /**
   * Set on a strategy position.
   **/
  creditAccount?: Address;
  creditManager?: Address;
}

/**
 * One position both sources listed for a wallet, and everything they disagree
 * on.
 **/
export interface PositionMatch {
  id: PositionId;
  kind: PositionKind;
  chainId: ChainId;
  onchainName: string;
  offchainName: string;
  /**
   * No diffs at all, including the documented mode-scoped ones.
   **/
  identical: boolean;
  /**
   * No unexpected diffs: every disagreement is mode-scoped, backend-preferred,
   * or within tolerance.
   **/
  clean: boolean;
  diffs: FieldDiff[];
}

/**
 * One wallet's comparison, or the error that stopped it.
 **/
export interface WalletComparison {
  wallet: Address;
  /**
   * Why both listings of this wallet could not be read. When set, the rest of
   * the fields are empty.
   **/
  error?: string;
  onlyOnchain: PositionRef[];
  onlyOffchain: PositionRef[];
  matched: PositionMatch[];
}

/**
 * Counts of one wallet.
 **/
export interface WalletCompareCounts extends CompareCounts {
  wallet: Address;
  /**
   * Present when the wallet's listings could not be read.
   **/
  error?: string;
}

/**
 * Totals of the comparison plus the fields that differed most often.
 **/
export interface PositionsCompareSummary extends CompareCounts {
  wallets: number;
  /**
   * Wallets whose listings were read and that have no membership gaps and no
   * unexpected field diffs.
   **/
  walletsClean: number;
  walletsFailed: number;
  byChain: ChainCompareCounts[];
  byWallet: WalletCompareCounts[];
  diffsByPath: DiffPathCount[];
}

/**
 * Everything one comparison run produced, ready to be written out as JSON.
 **/
export interface PositionsCompareReport {
  generatedAt: string;
  backendUrl: string;
  networks: string[];
  /**
   * Per-chain metadata collected from the on-chain reads, which says which
   * block each chain answered from. Taken from the first successful wallet
   * listing of each chain.
   **/
  onchainChains: ChainMetadata[];
  /**
   * Per-chain metadata of the backend reads, see {@link onchainChains}.
   **/
  offchainChains: ChainMetadata[];
  summary: PositionsCompareSummary;
  wallets: WalletComparison[];
}

/**
 * Both listings of one wallet.
 **/
export interface WalletPositions {
  wallet: Address;
  onchain: DataResponse<Position[]>;
  offchain: DataResponse<Position[]>;
}

/**
 * A wallet whose listings could not be read from one or both sources.
 **/
export interface WalletPositionsFailure {
  wallet: Address;
  error: string;
}

/**
 * The per-wallet listings to compare, plus what the run was pointed at.
 **/
export interface ComparePositionsInput {
  wallets: WalletPositions[];
  failures?: WalletPositionsFailure[];
  backendUrl: string;
  networks: string[];
  /**
   * ISO timestamp stamped onto the report, defaulting to now. Pinned by tests.
   **/
  generatedAt?: string;
}

/**
 * Matches two position listings per wallet by {@link positionId} and reports
 * every field the two sources disagree on.
 *
 * Nothing is filtered out. A field only one mode can fill, a strategy field
 * both-mode merge overlays from the backend, or a USD value that drifted
 * within snapshot-lag noise, is still reported — tagged
 * {@link FieldDiff.expected} so that {@link CompareCounts.clean} can ignore it
 * while {@link CompareCounts.identical} stays strict.
 **/
export function comparePositions(
  input: ComparePositionsInput,
): PositionsCompareReport {
  const failures = input.failures ?? [];
  const wallets: WalletComparison[] = [
    ...input.wallets.map(compareWallet),
    ...failures.map(
      (failure): WalletComparison => ({
        wallet: failure.wallet,
        error: failure.error,
        onlyOnchain: [],
        onlyOffchain: [],
        matched: [],
      }),
    ),
  ];
  wallets.sort((a, b) => a.wallet.localeCompare(b.wallet));

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    backendUrl: input.backendUrl,
    networks: [...input.networks],
    onchainChains: collectChains(input.wallets, "onchain"),
    offchainChains: collectChains(input.wallets, "offchain"),
    summary: summarize(input.wallets, wallets, failures.length),
    wallets,
  };
}

/**
 * Every field two versions of one position disagree on.
 **/
export function diffPosition(
  onchain: Position,
  offchain: Position,
): FieldDiff[] {
  return diffObjects(onchain, offchain, { keyOf: keyOfPositionArray }).map(
    diff => tagDiff(diff, onchain.kind),
  );
}

function compareWallet(input: WalletPositions): WalletComparison {
  const onchainRows = indexById(input.onchain.data);
  const offchainRows = indexById(input.offchain.data);

  const onlyOnchain: PositionRef[] = [];
  const onlyOffchain: PositionRef[] = [];
  const matched: PositionMatch[] = [];

  for (const [id, row] of onchainRows) {
    const counterpart = offchainRows.get(id);
    if (!counterpart) {
      onlyOnchain.push(toRef(row));
      continue;
    }
    const diffs = diffPosition(row, counterpart);
    matched.push({
      id,
      kind: row.kind,
      chainId: row.chainId,
      onchainName: row.name,
      offchainName: counterpart.name,
      identical: diffs.length === 0,
      clean: diffs.every(diff => diff.expected),
      diffs,
    });
  }
  for (const [id, row] of offchainRows) {
    if (!onchainRows.has(id)) {
      onlyOffchain.push(toRef(row));
    }
  }

  onlyOnchain.sort((a, b) => a.id.localeCompare(b.id));
  onlyOffchain.sort((a, b) => a.id.localeCompare(b.id));
  matched.sort((a, b) => a.id.localeCompare(b.id));

  return {
    wallet: input.wallet,
    onlyOnchain,
    onlyOffchain,
    matched,
  };
}

function indexById(rows: Position[]): Map<PositionId, Position> {
  return new Map(rows.map(row => [positionId(row), row]));
}

function toRef(row: Position): PositionRef {
  const base = {
    id: positionId(row),
    kind: row.kind,
    chainId: row.chainId,
    name: row.name,
  };
  switch (row.kind) {
    case "pool":
      return { ...base, pool: row.pool };
    case "strategy":
      return {
        ...base,
        creditAccount: row.creditAccount,
        creditManager: row.creditManager,
      };
    case "liquidation":
      return base;
  }
}

/**
 * `collaterals[]` is keyed by the collateral token, not by a top-level
 * address. Rewards-points programs already identify themselves by `id`.
 **/
function keyOfPositionArray(path: string, value: unknown): string | undefined {
  if (
    path !== "collaterals" ||
    !isRecord(value) ||
    !isRecord(value.collateral)
  ) {
    return undefined;
  }
  const token = value.collateral.token;
  return isRecord(token) && typeof token.address === "string"
    ? token.address
    : undefined;
}

function summarize(
  inputs: WalletPositions[],
  wallets: WalletComparison[],
  failed: number,
): PositionsCompareSummary {
  const compared = wallets.filter(wallet => !wallet.error);
  const allOnchain = inputs.flatMap(input => input.onchain.data);
  const allOffchain = inputs.flatMap(input => input.offchain.data);
  const onlyOnchain = compared.flatMap(wallet => wallet.onlyOnchain);
  const onlyOffchain = compared.flatMap(wallet => wallet.onlyOffchain);
  const matched = compared.flatMap(wallet => wallet.matched);

  const chainIds = union(
    allOnchain.map(row => String(row.chainId)),
    allOffchain.map(row => String(row.chainId)),
  );

  const byChain = chainIds
    .map(chainId => ({
      chainId: Number(chainId),
      ...toCompareCounts(
        allOnchain.filter(row => String(row.chainId) === chainId).length,
        allOffchain.filter(row => String(row.chainId) === chainId).length,
        onlyOnchain.filter(ref => String(ref.chainId) === chainId).length,
        onlyOffchain.filter(ref => String(ref.chainId) === chainId).length,
        matched.filter(match => String(match.chainId) === chainId),
      ),
    }))
    .sort((a, b) => a.chainId - b.chainId);

  const byWallet = wallets.map(wallet => ({
    wallet: wallet.wallet,
    ...(wallet.error ? { error: wallet.error } : {}),
    ...toCompareCounts(
      wallet.matched.length + wallet.onlyOnchain.length,
      wallet.matched.length + wallet.onlyOffchain.length,
      wallet.onlyOnchain.length,
      wallet.onlyOffchain.length,
      wallet.matched,
    ),
  }));

  const walletsClean = compared.filter(
    wallet =>
      wallet.onlyOnchain.length === 0 &&
      wallet.onlyOffchain.length === 0 &&
      wallet.matched.every(match => match.clean),
  ).length;

  return {
    ...toCompareCounts(
      allOnchain.length,
      allOffchain.length,
      onlyOnchain.length,
      onlyOffchain.length,
      matched,
    ),
    wallets: wallets.length,
    walletsClean,
    walletsFailed: failed,
    byChain,
    byWallet,
    diffsByPath: countPaths(
      matched.flatMap(match =>
        match.diffs.map(diff => ({ id: match.id, diff })),
      ),
    ),
  };
}

/**
 * One metadata entry per chain, preferring a success so the report names the
 * block. Later wallets of the same chain are ignored.
 **/
function collectChains(
  wallets: WalletPositions[],
  side: "onchain" | "offchain",
): ChainMetadata[] {
  const byChain = new Map<ChainId, ChainMetadata>();
  for (const wallet of wallets) {
    for (const chain of wallet[side].meta.chains) {
      const existing = byChain.get(chain.chainId);
      if (
        !existing ||
        (existing.status !== "success" && chain.status === "success")
      ) {
        byChain.set(chain.chainId, chain);
      }
    }
  }
  return [...byChain.values()].sort((a, b) => a.chainId - b.chainId);
}
