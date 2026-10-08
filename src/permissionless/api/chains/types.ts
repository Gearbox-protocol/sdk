/**
 * Which chains a read covers:
 *
 * - `public` — the ones open to everyone, the backend's default;
 * - `all` — those plus the private ones the caller may see.
 **/
export type ChainScope = "public" | "all";

/**
 * One chain the permissionless stack is deployed on.
 *
 * This list is what exists: the backend holds rows for chains it does not
 * serve, and those are not reachable through it.
 *
 * Deliberately bare. It is read during {@link ChainsNamespace.attach}, which
 * every other call waits on, so it carries only what identifies a chain and
 * decides whether to show it. The counters are a second read, see
 * {@link PermissionlessChainSummary}.
 **/
export interface PermissionlessChain {
  chainId: number;
  name: string;
  /** Whether the instance is open to everyone, or only to its own curators. */
  isPublic: boolean;
  /**
   * Whether the instance is live. A pending one has nothing to show, and the
   * default `public` scope leaves it out.
   **/
  isActivated: boolean;
  explorerUrl: string;
}

/**
 * A chain with the counters a list renders next to it, see
 * {@link ChainsNamespace.summary}.
 **/
export interface PermissionlessChainSummary extends PermissionlessChain {
  riskCuratorsQty: number;
  marketsQty: number;
}

/** Args of {@link ChainsNamespace.attach}. */
export interface AttachChainsArgs {
  /**
   * @defaultValue `"public"`
   **/
  scope?: ChainScope;
}

/** Args of {@link ChainsNamespace.summary}. */
export interface ChainSummaryArgs {
  /**
   * Which chains to count.
   *
   * @defaultValue the scope {@link ChainsNamespace.attach} settled on, so
   * the counters describe the list already on screen.
   **/
  scope?: ChainScope;
}
