import { AddressMap } from "../utils/index.js";

/**
 * TODO: is it still needed after v3.0 deprecation?
 * This map is used to filter out zappers with tokenIn === v2 diesel tokens
 * such zappers are returned by compressor but useless for v3 pools on deposit step
 */
export const POOL_TOKENS_TO_MIGRATE: AddressMap<string> = new AddressMap([
  // v2 diesels
  ["0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA", "dDAI"],
  ["0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3", "dUSDC"],
  ["0xe753260F1955e8678DCeA8887759e07aa57E8c54", "dWBTC"],
  ["0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278", "dWETH"],
  ["0x2158034dB06f06dcB9A786D2F1F8c38781bA779d", "dwstETH"],
  ["0x8A1112AFef7F4FC7c066a77AABBc01b3Fff31D47", "dFRAX"],
]);
