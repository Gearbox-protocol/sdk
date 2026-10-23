/** Anvil endpoint selected once, when the SDK is created. **/
export interface GipAnvilForkOptions {
  readonly rpcUrl: string;
  /** Timeout for reads and for simulation. **/
  readonly timeoutMs?: number;
}

/** RPC timeout of a fork connection when none is configured. **/
export const DEFAULT_FORK_TIMEOUT_MS = 180_000;

/** Shared by endpoint validation and the Anvil simulation lock. **/
export function normalizeRpcUrl(rpcUrl: string): string {
  const url = new URL(rpcUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("An Anvil fork RPC URL must use HTTP or HTTPS");
  }
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}
