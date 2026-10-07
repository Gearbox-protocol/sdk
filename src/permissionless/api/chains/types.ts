/**
 * Which chains a read covers:
 *
 * - `public` — the ones open to everyone, the backend's default;
 * - `all` — those plus the private ones the caller may see.
 **/
export type ChainScope = "public" | "all";

/**
 * One chain the permissionless stack is deployed on, with the counters a list
 * renders next to it.
 *
 * This list is what exists: the backend holds rows for chains it does not
 * serve, and those are not reachable through it.
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
