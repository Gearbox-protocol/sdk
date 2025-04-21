import type { NetworkType } from "../chain/index.js";

/**
 * Block number when address provider was deployed
 */
export const ADDRESS_PROVIDER_BLOCK: Record<NetworkType, bigint> = {
  Mainnet: 18433056n, // AddressProvderV3 0x9ea7b04Da02a5373317D745c1571c84aaD03321D
  Arbitrum: 184650310n,
  Optimism: 118410666n,
  Base: 0n,
  Sonic: 9779380n,
  // New networks
  MegaETH: 1677017n, // arbitrary not deployed yet
  Monad: 9319691n, // arbitrary not deployed yet
  Berachain: 2788903n, // arbitrary not deployed yet
  Avalanche: 31594758n, // arbitrary not deployed yet
  BNB: 48553569n, // arbitrary not deployed yet
};

const BLOCK_DURATION_BY_NETWORK: Record<NetworkType, number> = {
  Mainnet: 12.05,
  Arbitrum: 0.26,
  Optimism: 2,
  Base: 2.01,
  Sonic: 0.91,
  // New networks
  MegaETH: 0.01, // <10ms/block, on testnet
  Monad: 1, // on testnet
  Berachain: 1.9,
  Avalanche: 1.7,
  BNB: 3,
};

const RAMP_TIME = 30 * 24 * 60 * 60 * 1.2;
export const RAMP_DURATION_BY_NETWORK: Record<NetworkType, bigint> = {
  Mainnet: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Mainnet)),
  Arbitrum: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Arbitrum)),
  Optimism: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Optimism)),
  Base: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Base)),
  Sonic: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Sonic)),
  // New networks
  MegaETH: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.MegaETH)),
  Monad: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Monad)),
  Berachain: BigInt(
    Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Berachain),
  ),
  Avalanche: BigInt(
    Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.Avalanche),
  ),
  BNB: BigInt(Math.floor(RAMP_TIME / BLOCK_DURATION_BY_NETWORK.BNB)),
};

const WEEK = 7 * 24 * 60 * 60;
export const BLOCKS_PER_WEEK_BY_NETWORK: Record<NetworkType, bigint> = {
  Mainnet: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Mainnet)),
  Arbitrum: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Arbitrum)),
  Optimism: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Optimism)),
  Base: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Base)),
  Sonic: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Sonic)),
  // New networks
  MegaETH: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.MegaETH)),
  Monad: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Monad)),
  Berachain: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Berachain)),
  Avalanche: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.Avalanche)),
  BNB: BigInt(Math.floor(WEEK / BLOCK_DURATION_BY_NETWORK.BNB)),
};
