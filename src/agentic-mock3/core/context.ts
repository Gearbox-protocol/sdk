import type { MockOffchainSDK } from "../offchain/index.js";
import type { MockMultichainSDK } from "../onchain/index.js";

/**
 * Plain parameter-passing type for constructing entities and collections.
 * Not stored directly -- GearboxEntity extracts what it needs in the constructor.
 */
export interface SDKContext {
  readonly multichain: MockMultichainSDK | null;
  readonly offchain: MockOffchainSDK | null;
}
