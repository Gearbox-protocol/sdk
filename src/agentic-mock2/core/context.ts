import type { MockOffchainSDK } from "../offchain/index.js";
import type { MockMultichainSDK } from "../onchain/index.js";

/**
 * Shared context passed to all namespaces and entities.
 * Holds references to the underlying SDKs so that entities can
 * lazily query data and construct related entities on demand.
 */
export interface SDKContext {
  readonly multichain: MockMultichainSDK | null;
  readonly offchain: MockOffchainSDK | null;
}
