import type { OuterFacadeOperation } from "./types-facades.js";
import type { PoolOperation } from "./types-pools.js";
import type { RWAOperation } from "./types-rwa.js";

export * from "./types-adapters.js";
export * from "./types-facades.js";
export * from "./types-pools.js";
export * from "./types-rwa.js";

/**
 * Result of decoding a single raw operation calldata: a pool deposit/redeem,
 * one of the credit-facade operations, or an RWA-factory operation.
 */
export type Operation = PoolOperation | OuterFacadeOperation | RWAOperation;

/**
 * Narrows an {@link Operation} to a {@link PoolOperation} (deposit, mint,
 * withdraw or redeem). Used by the UI to decide whether a custom view exists for
 * the parsed result; everything else falls back to the raw JSON view.
 */
export function isPoolOperation(tx: Operation): tx is PoolOperation {
  return (
    tx.operation === "Deposit" ||
    tx.operation === "Mint" ||
    tx.operation === "Withdraw" ||
    tx.operation === "Redeem"
  );
}

/**
 * Narrows an {@link Operation} to an {@link RWAOperation} (an RWA-factory
 * open-account or multicall). Used to route parsed operations to the
 * RWA-specific simulation path.
 */
export function isRWAOperation(tx: Operation): tx is RWAOperation {
  return (
    tx.operation === "RWAOpenCreditAccount" || tx.operation === "RWAMulticall"
  );
}
