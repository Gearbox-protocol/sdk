import { BaseError } from "viem";

import type { NetworkType } from "../chain/chains.js";

/**
 * Thrown when accessing SDK state before {@link OnchainSDK.attach} or
 * {@link OnchainSDK.hydrate} has been called.
 */
export class SdkNotAttachedError extends BaseError {
  override name = "SdkNotAttachedError";

  constructor() {
    super("SDK is not attached — call attach() or hydrate() first");
  }
}

/**
 * Thrown when calling {@link OnchainSDK.attach} or {@link OnchainSDK.hydrate}
 * on an instance that has already been initialised.
 */
export class SdkAlreadyAttachedError extends BaseError {
  override name = "SdkAlreadyAttachedError";

  constructor() {
    super("SDK is already attached");
  }
}

/**
 * Thrown during hydration when the serialised state's `version` field does not
 * match the SDK's expected {@link STATE_VERSION}.
 */
export class SdkStateVersionMismatchError extends BaseError {
  override name = "SdkStateVersionMismatchError";

  constructor(expected: number, actual: number) {
    super(`State version mismatch: expected ${expected}, got ${actual}`);
  }
}

/**
 * Thrown when the viem client's `chainId` does not match the expected chain ID
 * for the configured {@link NetworkType}.
 */
export class SdkChainMismatchError extends BaseError {
  override name = "SdkChainMismatchError";

  constructor(expected: NetworkType | number, actual: NetworkType | number) {
    super(`Chain mismatch: expected ${expected}, got ${actual}`);
  }
}

/**
 * Thrown during {@link MultichainSDK.hydrate} when the serialised state is
 * missing an entry for a configured chain.
 */
export class SdkMissingChainStateError extends BaseError {
  override name = "SdkMissingChainStateError";

  constructor(network: NetworkType) {
    super(`Hydration state missing for configured chain: ${network}`);
  }
}

/**
 * Thrown by {@link MultichainSDK.syncState} when one or more per-chain syncs
 * fail. Wraps the individual errors keyed by network.
 */
export class SdkSyncFailedError extends BaseError {
  override name = "SdkSyncFailedError";

  readonly perChainErrors: Partial<Record<NetworkType, unknown>>;

  constructor(perChainErrors: Partial<Record<NetworkType, unknown>>) {
    const chains = Object.keys(perChainErrors).join(", ");
    super(`syncState failed for chains: ${chains}`);
    this.perChainErrors = perChainErrors;
  }
}
