import type { PoolOpportunity } from "./opportunities.js";
import type { StrategyPosition } from "./positions.js";
import type { Token } from "./primitives.js";

/**
 * What a notice is about, and therefore how a consumer shows it.
 **/
export type NoticeKind =
  | "expired"
  | "externalRewards"
  | "extraApy"
  | "warning"
  | "disclaimer";

/**
 * A banner the backend asks a consumer to show for a pool opportunity or a
 * strategy position: an expired account, rewards paid outside the protocol,
 * a caveat on the yield. The message is final text; the consumer adds
 * nothing.
 **/
export interface Notice {
  kind: NoticeKind;
  message: string;
  /**
   * Token the notice is about, when it is about one (rewards, extra APY).
   **/
  token?: Token;
}

/**
 * What a notice is attached to: a pool opportunity or a strategy position —
 * the two entities a consumer shows banners for.
 **/
export type NoticeSubject = PoolOpportunity | StrategyPosition;
