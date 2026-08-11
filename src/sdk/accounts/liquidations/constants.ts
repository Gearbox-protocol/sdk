import type { Address } from "viem";

export const LIQUIDATION_COMPRESSOR_V313_ADDRESS: Address =
  "0xB70C4500a0afF02107eB983a348F22492fB6dC94";

export { DUST_THRESHOLD } from "../constants.js";

/**
 * Headroom (in bps) added on top of the amount the liquidation pulls when
 * building the liquidator's approval, so that the transaction does not revert
 * when prices move between the preview and the execution.
 **/
export const LIQUIDATION_APPROVAL_BUFFER = 50n;
