import type { MultichainSDK } from "../../sdk/index.js";
import type { CuratorsNamespace } from "../curator/index.js";
import type { MarketsNamespace } from "../market/index.js";
import type { OffchainSDK } from "../offchain/index.js";
import type { OpportunitiesNamespace } from "../opportunity/index.js";
import type { TokensNamespace } from "../tokens/index.js";
import type { Mode } from "./mode.js";

/**
 * Structural SDK handle passed to every entity and collection.
 *
 * `GearboxSDKImpl` satisfies `SDKContext<Mode>` at runtime; individual
 * namespaces and collections narrow to `SDKContext<M>` at the type level to
 * propagate mode capabilities through navigation chains.
 */
export interface SDKContext<M extends Mode> {
  readonly multichain: MultichainSDK | null;
  readonly offchain: OffchainSDK | null;
  readonly tokens: TokensNamespace<M>;
  readonly opportunities: OpportunitiesNamespace<M>;
  readonly markets: MarketsNamespace<M>;
  readonly curators: CuratorsNamespace;
}
