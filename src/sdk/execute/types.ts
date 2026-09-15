import type { Address } from "viem";
import type {
  ChainId,
  SDKResult,
  SecuritizeRegisterMessage,
} from "../../model/index.js";
import type { Asset, RawTx } from "../../onchain/index.js";
import type {
  BorrowResult,
  EmptyCreditAccountResult,
  LpResult,
  OpenStrategyResult,
  StrategyResult,
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
  sim: SDKResult<LpResult>;
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
  sim: SDKResult<OpenStrategyResult>;
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
 * Taking a loan, from a viable {@link IOpportunitiesPrepare.borrow} result.
 *
 * Goes through the same `openCA` as an opening, with the payout named as the
 * token to withdraw — everything else the transaction needs, the collateral
 * included, is already on the prepared state.
 **/
export interface BorrowPrepareRequest {
  kind: "borrow";
  chainId: ChainId;
  creditManager: Address;
  wallet: Address;
  sim: SDKResult<BorrowResult>;
  /** Native value to attach when the collateral is paid in the coin. */
  ethAmount: bigint;
  /**
   * {@inheritDoc OpenPrepareRequest.signaturesToCache}
   **/
  signaturesToCache?: SecuritizeRegisterMessage[];
}

/**
 * Opening an account that holds nothing, from a viable
 * {@link IOpportunitiesPrepare.openEmptyCreditAccount} result.
 *
 * The market and the wallet are the whole request. Nothing is put up, drawn or
 * routed, so there is nothing for a caller to hand over and nothing for the
 * preparation to carry — which is also why this is its own kind rather than an
 * `open` with empty arguments: a collateral passed by mistake has nowhere to
 * land.
 **/
export interface OpenEmptyPrepareRequest {
  kind: "openEmpty";
  chainId: ChainId;
  creditManager: Address;
  wallet: Address;
  /**
   * The preparation this is built from. It carries no numbers; what it says is
   * that the market took the request at the block it names.
   **/
  sim: SDKResult<EmptyCreditAccountResult>;
}

/**
 * Any of the five operations on an existing account, from a viable
 * {@link StrategyResult}: the facade multicall is the result's `calls`.
 **/
export interface AccountPrepareRequest {
  kind: "account";
  chainId: ChainId;
  creditAccount: Address;
  wallet: Address;
  sim: SDKResult<StrategyResult>;
}

/**
 * What {@link IOpportunitiesExecute.buildTx} turns into a transaction: a
 * `prepare` result plus the few facts about the wallet the preparation does not
 * carry.
 **/
export type PrepareRequest =
  | PoolPrepareRequest
  | OpenPrepareRequest
  | OpenEmptyPrepareRequest
  | BorrowPrepareRequest
  | AccountPrepareRequest;

/**
 * The write side of the opportunities namespace: turns what `prepare`
 * answered into the transaction to sign. Sending, and whatever the wallet has
 * to do first (allowances, permits, RWA signatures), stays with the caller —
 * `checkOperation` reports the former on the built transaction's preview.
 **/
export interface IOpportunitiesExecute {
  /**
   * The transaction to sign, from a `prepare` result. No second round of math:
   * `account` requests submit the result's own multicall, `open` and `borrow`
   * requests hand the state's router path and quotas to `openCA`, `openEmpty`
   * requests open on nothing at all, and `pool` requests encode the deposit /
   * redeem the result priced.
   *
   * @throws on a refused `prepare` result; when a `pool` request names a route
   * the pool has no metadata for, or one the pool does not accept a transaction
   * for (RWA on-demand deposits)
   **/
  buildTx(request: PrepareRequest): Promise<RawTx>;
}
