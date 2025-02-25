import type { NetworkType } from "../chain";

/**
 * Block number when address provider was deployed
 */
export const ADDRESS_PROVIDER_BLOCK: Record<NetworkType, bigint> = {
  Mainnet: 18433056n, // AddressProvderV3 0x9ea7b04Da02a5373317D745c1571c84aaD03321D
  Arbitrum: 184650310n,
  Optimism: 118410666n,
  Base: 0n,
  Sonic: 9779380n,
};

const BLOCK_DURATION_BY_NETWORK: Record<NetworkType, number> = {
  Mainnet: 12.05,
  Arbitrum: 0.26,
  Optimism: 2,
  Base: 2.01,
  Sonic: 0.91,
};

const RAMP_TIME = 30 * 24 * 60 * 60 * 1.2;
export const RAMP_DURATION_BY_NETWORK: Record<NetworkType, bigint> = {
  Mainnet: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Mainnet)),
  Arbitrum: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Arbitrum)),
  Optimism: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Optimism)),
  Base: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Base)),
  Sonic: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Sonic)),
};

const WEEK = 7 * 24 * 60 * 60;
export const BLOCKS_PER_WEEK_BY_NETWORK: Record<NetworkType, bigint> = {
  Mainnet: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Mainnet)),
  Arbitrum: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Arbitrum)),
  Optimism: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Optimism)),
  Base: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Base)),
  Sonic: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Sonic)),
};
