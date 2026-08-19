export const ANVIL_URL = "http://127.0.0.1:8545";
export const ANVIL_PORT = 8545;

/**
 * Gas handed to every send in e2e tests, in place of an estimate.
 *
 * `eth_estimateGas` costs seconds per call on heavy multicalls — anvil
 * binary-searches the limit, re-executing the call a few dozen times — and its
 * result carries no buffer: a transaction mined one second later than the
 * estimate can take a pool's interest-update branch the estimate skipped and
 * run out of gas. Naming the block's own limit skips the search: nothing here
 * is measuring gas, and a revert still surfaces as a failed receipt.
 */
export const GAS_LIMIT = 30_000_000n;
