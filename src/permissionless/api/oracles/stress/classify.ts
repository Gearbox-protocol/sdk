import type { Address } from "viem";
import type { StressSource } from "./types.js";

/**
 * Who a price ultimately comes from, worked out from what the chain says
 * about the feed reporting it.
 *
 * There is no registry on chain of which aggregator belongs to whom, so this
 * is a reading of three things the chain does carry: the Gearbox contract
 * type, which names the provider outright for the feeds Gearbox deploys; the
 * `description()` every Chainlink-shaped feed returns; and the interface
 * version, which separates Chainlink's own proxies from the many contracts
 * that imitate them.
 *
 * Every rule is open to inspection and every unmatched feed is reported as
 * unmatched, because the alternative — guessing from a symbol, or sweeping
 * the remainder into one bucket — would understate exactly the part of the
 * answer a reader should distrust.
 **/

/** One node of an oracle's feed tree, as the compressor reports it. */
export interface TreeNode {
  address: Address;
  /** Gearbox contract type, `""` for a contract it never deployed. */
  contractType: string;
  /** `AggregatorV3Interface.version()`, or 0 where there is none. */
  version: number;
  description: string;
  /** The feeds it reads, lowercased. Empty makes it a leaf. */
  underlyingFeeds: Address[];
}

/**
 * The feed types whose price is a protocol's exchange rate read off a
 * contract, mapped to the group that rate belongs to.
 *
 * These are not leaves: an LP feed also reads the price of whatever the rate
 * is denominated in, and that child is somebody else's source. What belongs to
 * the protocol is the rate alone, which is why these are perturbed at the
 * contract the feed reads it from rather than at the feed.
 *
 * `null` means the protocol is the vault's own and has to come from
 * {@link VAULT_GROUPS} or, failing that, from the feed's description.
 */
const RATE_TYPE_GROUPS: Record<string, string | null> = {
  WSTETH: "Lido",
  CURVE_STABLE: "Curve",
  CURVE_CRYPTO: "Curve",
  CURVE_TWAP: "Curve",
  YEARN: "Yearn",
  MELLOW_LRT: "Mellow",
  BALANCER_STABLE: "Balancer",
  BALANCER_WEIGHTED: "Balancer",
  ERC4626: null,
};

/**
 * Which protocol an ERC-4626 vault belongs to, by the symbol its feed is
 * described with.
 *
 * Curated, and deliberately short: a vault not named here becomes a group of
 * one under its own symbol, which is still a correct partition — one vault is
 * one source — and is flagged so a reader knows nothing claims it fails
 * alongside anything else.
 */
const VAULT_GROUPS: Record<string, string> = {
  sUSDS: "Sky",
  sDAI: "Sky",
  sUSDe: "Ethena",
  sUSDf: "Falcon",
  wstUSR: "Resolv",
  syrupUSDC: "Maple",
  hgETH: "Kelp",
  rstETH: "Mellow",
  Re7LRT: "Mellow",
  pzETH: "Mellow",
  DVstETH: "Mellow",
  tETH: "Treehouse",
};

/**
 * Rules over a Chainlink-shaped feed's own description, in order.
 *
 * Only reached for a leaf Gearbox did not deploy, which is where the provider
 * is not already stated. The first match wins, so the specific patterns come
 * before the general shape of a Chainlink pair.
 */
const DESCRIPTION_RULES: Array<{
  via: string;
  match: RegExp;
  group: string | ((m: RegExpMatchArray) => string);
}> = [
  { via: "description names Redstone", match: /redstone/i, group: "Redstone" },
  { via: "description names Pyth", match: /\bpyth\b/i, group: "Pyth" },
  { via: "description names Pendle", match: /pendle/i, group: "Pendle" },
  {
    via: "description names Chronicle",
    match: /chronicle/i,
    group: "Chronicle",
  },
  { via: "description names API3", match: /\bapi3\b/i, group: "API3" },
  {
    via: "description names Chaos",
    match: /chaos\s*labs/i,
    group: "Chaos Labs",
  },
  {
    // Midas issues a family of tokenised funds under one naming convention and
    // one oracle operator, so they fail together: mTBILL, mBASIS, mEDGE,
    // mF-ONE, mGLOBAL, mRe7YIELD. Matched on the convention rather than
    // enumerated, since the family keeps growing, and anchored tightly enough
    // that an ordinary symbol beginning with an m does not fall into it.
    via: "Midas naming convention",
    match: /^m(TBILL|BASIS|EDGE|F-ONE|GLOBAL|Re7YIELD|[A-Z]{2,}[0-9]*)\s*\//,
    group: "Midas",
  },
  {
    // A protocol's own rate, published behind a Chainlink-shaped adapter:
    // "rETH/ETH exchange rate adapter", "SAVUSD-AVUSD Exchange Rate". The
    // token in front of the separator is the protocol's, which names the
    // group; both separators appear in the wild.
    via: "exchange-rate adapter, grouped by its token",
    match: /^([A-Za-z0-9+]+)\s*[/-]\s*[A-Za-z0-9+]+\s+exchange\s+rate/i,
    group: m => m[1] as string,
  },
];

/**
 * Whether a description is a Chainlink pair: `BASE / QUOTE`, spaced, in the
 * shape their aggregators have published for years.
 *
 * Paired with a version of 6, which is what `EACAggregatorProxy` answers and
 * what the imitators — version 0 or 1, mostly — do not. Either alone would be
 * wrong: plenty of adapters describe themselves as a spaced pair, and plenty
 * of Chainlink feeds are read through a wrapper that reports another version.
 */
const CHAINLINK_PAIR = /^[A-Za-z0-9+]+ \/ [A-Za-z0-9+]+$/;

/** Feed types that are their own answer, with no source behind them at all. */
const SELF_CONTAINED: Record<string, string> = {
  CONSTANT: "Constant",
  ZERO: "Zero",
};

/** The type without the `PRICE_FEED::` the bytecode repository prefixes it with. */
function bareType(contractType: string): string {
  return contractType.replace(/^PRICE_FEED::/, "");
}

/**
 * Which group a leaf price feed belongs to, and how that was decided.
 *
 * The order is what makes it defensible: what Gearbox deployed says who it
 * reads, so those types are taken first; then the description rules, most
 * specific first; then the Chainlink shape; and anything left is its own group
 * under its own description, flagged.
 */
function classifyLeaf(node: TreeNode): {
  group: string;
  identified: boolean;
  via: string;
} {
  const type = bareType(node.contractType);

  const selfContained = SELF_CONTAINED[type];
  if (selfContained) {
    return { group: selfContained, identified: true, via: "Gearbox feed type" };
  }

  // The feeds Gearbox deploys to read a provider name that provider in their
  // type, which beats anything their description could be read for.
  if (type === "REDSTONE" || type === "PYTH" || type === "CHAINLINK") {
    return {
      group:
        type === "PYTH"
          ? "Pyth"
          : type === "REDSTONE"
            ? "Redstone"
            : "Chainlink",
      identified: true,
      via: "Gearbox feed type",
    };
  }

  for (const rule of DESCRIPTION_RULES) {
    const m = node.description.match(rule.match);
    if (m) {
      return {
        group: typeof rule.group === "function" ? rule.group(m) : rule.group,
        identified: true,
        via: rule.via,
      };
    }
  }

  if (CHAINLINK_PAIR.test(node.description) && node.version === 6) {
    return {
      group: "Chainlink",
      identified: true,
      via: "Chainlink pair description at interface version 6",
    };
  }

  // Nothing claims this fails alongside anything else, so it is a group of
  // one. Named after the description rather than the address, because a
  // reader has to recognise it to act on it.
  return {
    group: node.description || node.address,
    identified: false,
    via: "unrecognised: grouped alone under its own description",
  };
}

/**
 * Which group a rate-bearing feed's rate belongs to.
 *
 * The type names the protocol for everything but an ERC-4626 vault, where the
 * protocol is the vault's own and is looked up by the symbol the feed is
 * described with — `"sUSDS / USD LP price feed"` is Sky's.
 */
function classifyRate(node: TreeNode): {
  group: string;
  identified: boolean;
  via: string;
} {
  const type = bareType(node.contractType);
  const named = RATE_TYPE_GROUPS[type];
  if (named) {
    return { group: named, identified: true, via: "Gearbox feed type" };
  }

  // `"<symbol> / USD LP price feed"`, which is how every one of them is
  // described. The symbol is the vault, and the vault is the source.
  const symbol = node.description.match(/^([A-Za-z0-9+.-]+)\s*\//)?.[1];
  const protocol = symbol ? VAULT_GROUPS[symbol] : undefined;
  if (protocol) {
    return { group: protocol, identified: true, via: "curated vault table" };
  }

  return {
    group: symbol ?? node.address,
    identified: false,
    via: "vault not in the curated table: grouped alone under its symbol",
  };
}

/**
 * Every source behind a chain's feed trees.
 *
 * A source per contract, not per feed: two of an oracle's trees carrying the
 * same aggregator is one source read twice, and the test varies it once.
 *
 * `rateTargets` says which contract each rate-bearing feed reads its rate
 * from — the feed's own `lpContract`, read separately because the compressor
 * does not report it. A feed missing from it is left out with a reason, since
 * perturbing the whole feed instead would charge its protocol with a failure
 * of whatever prices the thing the rate is denominated in.
 **/
export function classifySources(
  chainId: number,
  nodes: TreeNode[],
  rateTargets: Map<Address, Address>,
  baselineOf: (target: Address) => bigint | null,
): { sources: StressSource[]; unresolved: TreeNode[] } {
  const sources: StressSource[] = [];
  const unresolved: TreeNode[] = [];
  const seen = new Set<Address>();

  for (const node of nodes) {
    const type = bareType(node.contractType);
    const isRate = type in RATE_TYPE_GROUPS;

    // A composite feed is not a source: it has no opinion of its own, only an
    // arithmetic over the feeds under it, which are sources themselves.
    if (!isRate && node.underlyingFeeds.length > 0) {
      continue;
    }

    const target = isRate ? rateTargets.get(node.address) : node.address;
    if (!target) {
      unresolved.push(node);
      continue;
    }

    // Several feeds reading one contract is one source. The first of them
    // names it, which is why the nodes are walked in a stable order.
    if (seen.has(target)) {
      continue;
    }
    seen.add(target);

    sources.push({
      chainId,
      kind: isRate ? "rate" : "feed",
      target,
      feed: node.address,
      contractType: node.contractType,
      description: node.description,
      // A feed carrying its answer in its own code has nothing publishing to
      // it, so there is no source to make lie — see
      // {@link StressSource.perturbable}.
      perturbable: !(bareType(node.contractType) in SELF_CONTAINED),
      baseline: baselineOf(target),
      ...(isRate ? classifyRate(node) : classifyLeaf(node)),
    });
  }

  return { sources, unresolved };
}

/**
 * The sources each of the given feeds is priced through, following the trees
 * down from every one of them.
 *
 * A feed is reached by a source when the source sits anywhere beneath it, at
 * any depth: a market reading a composite of a composite of a Chainlink
 * aggregator is a market Chainlink can move. Memoised over the whole forest,
 * so a node shared by twenty trees is walked once.
 **/
export function sourcesByFeed(
  roots: Address[],
  nodes: Map<Address, TreeNode>,
  sources: StressSource[],
): Map<Address, Set<Address>> {
  // Which source, if any, each node is. A rate-bearing feed is both a source
  // and a parent, so this is a lookup and not a partition.
  const sourceOfFeed = new Map<Address, Address>();
  for (const source of sources) {
    sourceOfFeed.set(source.feed, source.target);
  }

  const memo = new Map<Address, Set<Address>>();

  const walk = (feed: Address, path: Set<Address>): Set<Address> => {
    const done = memo.get(feed);
    if (done) {
      return done;
    }
    // A cycle in a mis-synced tree ends the branch rather than the walk.
    if (path.has(feed)) {
      return new Set();
    }

    const found = new Set<Address>();
    const own = sourceOfFeed.get(feed);
    if (own) {
      found.add(own);
    }

    path.add(feed);
    for (const child of nodes.get(feed)?.underlyingFeeds ?? []) {
      for (const source of walk(child, path)) {
        found.add(source);
      }
    }
    path.delete(feed);

    memo.set(feed, found);
    return found;
  };

  return new Map(roots.map(root => [root, walk(root, new Set())]));
}
