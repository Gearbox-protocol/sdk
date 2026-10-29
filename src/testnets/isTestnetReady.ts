import type { TestnetStatus } from "./types.js";

/**
 * Whether a testnet can be used.
 *
 * Non-strict, the default, means deployed: script outputs can be read and
 * tasks started.
 *
 * Strict also requires healthy price sync (it succeeded or is disabled) and a
 * running backend sidecar, if one was requested, which frontends need.
 * Frontend testing will most likely want `strict = true`.
 **/
export function isTestnetReady(status: TestnetStatus, strict = false): boolean {
  if (status.state !== "deployed") {
    return false;
  }
  if (!strict) {
    return true;
  }
  const syncState = status.sync?.state;
  const syncHealthy = syncState === "ok" || syncState === "disabled";
  const backendActive = !status.backend || status.backend.state === "active";
  return syncHealthy && backendActive;
}
