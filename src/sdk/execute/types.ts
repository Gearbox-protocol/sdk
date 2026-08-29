import type { Address } from "viem";
import type { ChainId } from "../../model/index.js";
import type {
  Asset,
  RawTx,
  SecuritizeRegisterMessage,
} from "../../onchain/index.js";
import type {
  LpPrepare,
  OpenStrategyPrepare,
  StrategyPrepare,
} from "../prepare/index.js";

/**
 * A pool deposit, withdrawal or redemption, as
 * {@link IOpportunitiesPrepare.deposit} / {@link IOpportunitiesPrepare.withdraw}
 * / {@link IOpportunitiesPrepare.redeem} priced it. The prepared state carries
 * the tokens on both sides and the zapper, so nothing else is needed to encode
 * the call.
 **/
export interface PoolPrepareRequest {
  kind: "pool";
  chainId: ChainId;
  pool: Address;
  wallet: Address;
  op: "deposit" | "withdraw" | "redeem";
  sim: Extract<LpPrepare, { success: true }>;
}

/**
 * Opening a new position, from a viable
 * {@link IOpportunitiesPrepare.openNewStrategy} result. The prepared state
 * values collateral in underlying only, so the wallet's actual collateral
 * assets and the native value to attach come from the caller.
 **/
export interface OpenPrepareRequest {
  kind: "open";
  chainId: ChainId;
  creditManager: Address;
  wallet: Address;
  sim: Extract<OpenStrategyPrepare, { success: true }>;
  /** What leaves the wallet, token by token. */
  collateral: Asset[];
  /** Native value to attach when paying a wrapped-native market in the coin. */
  ethAmount: bigint;
  /**
   * Token the position ends up in. RWA markets resolve their open
   * requirements against it; omitting it skips the RWA check entirely.
   **/
  targetToken?: Address;
  /**
   * EIP-712 registration signatures the wallet already signed this session,
   * attached as `signaturesToCache` when the market is RWA-gated.
   **/
  signaturesToCache?: SecuritizeRegisterMessage[];
}

/**
 * Any of the five operations on an existing account, from a viable
 * {@link StrategyPrepare}: the facade multicall is the result's `calls`.
 **/
export interface AccountPrepareRequest {
  kind: "account";
  chainId: ChainId;
  creditAccount: Address;
  wallet: Address;
  sim: Extract<StrategyPrepare, { success: true }>;
}

/**
 * What {@link IOpportunitiesExecute.buildTx} turns into a transaction: a
 * `prepare` result plus the few facts about the wallet the preparation does not
 * carry.
 **/
export type PrepareRequest =
  | PoolPrepareRequest
  | OpenPrepareRequest
  | AccountPrepareRequest;

/**
 * The write side of the opportunities namespace: turns what `prepare`
 * answered into the transaction to sign. Sending, and whatever the wallet has
 * to do first (allowances, permits, RWA signatures), stays with the caller —
 * `checkPrerequisites` reports the former on the built transaction.
 **/
export interface IOpportunitiesExecute {
  /**
   * The transaction to sign, from a `prepare` result. No second round of math:
   * `account` requests submit the result's own multicall, `open` requests hand
   * the state's router path and quotas to `openCA`, `pool` requests encode the
   * deposit / redeem the result priced.
   *
   * @throws on a refused `prepare` result; when a `pool` request names a route
   * the pool has no metadata for, or one the pool does not accept a transaction
   * for (RWA on-demand deposits)
   **/
  buildTx(request: PrepareRequest): Promise<RawTx>;
}
