import { chains as CHAINS, type NetworkType } from "../chain/index.js";
import { type PartialRecord, TypedObjectUtils } from "../utils/mappers.js";

// local constants are preserved for compatibility with older viem versions
// values are in milliseconds
const BLOCK_DURATION_LOCAL: PartialRecord<NetworkType, number> = {
  Mainnet: 12050,
  Arbitrum: 260,
  Optimism: 2000,
  Base: 2010,
  Sonic: 910,
  // New networks
  MegaETH: 10, // <10ms/block, on testnet
  Monad: 400,
  Berachain: 1900,
  Avalanche: 1700,
  BNB: 3000,
  WorldChain: 2000,
  Etherlink: 1000,
  Hemi: 12000,
  Lisk: 2000,
  Plasma: 1000,
  Somnia: 200,
};

const DEFAULT_DURATION = 12_000;

const BLOCK_DURATION = Object.values(CHAINS).reduce<
  Record<NetworkType, number>
>(
  (acc, chain) => {
    const blockTime =
      chain.blockTime ||
      BLOCK_DURATION_LOCAL[chain.network] ||
      DEFAULT_DURATION;

    acc[chain.network] = blockTime / 1000;
    return acc;
  },
  {} as Record<NetworkType, number>,
);

const RAMP_TIME = 30 * 24 * 60 * 60 * 1.2;
export const RAMP_DURATION_BY_NETWORK: Record<NetworkType, bigint> =
  TypedObjectUtils.entries(BLOCK_DURATION).reduce<Record<NetworkType, bigint>>(
    (acc, [n, duration]) => {
      if (duration !== 0) {
        acc[n] = BigInt(Math.floor(RAMP_TIME / duration));
      }
      return acc;
    },
    {} as Record<NetworkType, bigint>,
  );

const WEEK = 7 * 24 * 60 * 60;
export const BLOCKS_PER_WEEK_BY_NETWORK: Record<NetworkType, bigint> =
  TypedObjectUtils.entries(BLOCK_DURATION).reduce<Record<NetworkType, bigint>>(
    (acc, [n, duration]) => {
      acc[n] = BigInt(Math.floor(WEEK / duration));
      return acc;
    },
    {} as Record<NetworkType, bigint>,
  );
