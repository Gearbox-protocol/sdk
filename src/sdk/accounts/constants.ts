/**
 * Token balances at or below this threshold are treated as dust and ignored,
 * consistent with the rest of the SDK (see `filterDust`).
 *
 * Shared by every service that describes what a credit account holds, so that
 * a liquidation row and a position row agree on which balances exist at all.
 **/
export const DUST_THRESHOLD = 10n;
