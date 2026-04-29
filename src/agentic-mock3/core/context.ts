import type { MultichainSDK } from "../../sdk/index.js";
import type { OffchainSDK } from "../offchain/index.js";

/**
 * Plain parameter-passing type for constructing entities and collections.
 * Not stored directly -- GearboxEntity extracts what it needs in the constructor.
 */
export interface SDKContext {
  readonly multichain: MultichainSDK | null;
  readonly offchain: OffchainSDK | null;
}
