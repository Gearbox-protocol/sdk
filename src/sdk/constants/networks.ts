import { chains as CHAINS, type NetworkType } from "../chain/index.js";
import { type PartialRecord, TypedObjectUtils } from "../utils/mappers.js";

/**
 * Block number when address provider was deployed
 * @deprecated use chain.firstBlock instead
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
  WorldChain: 22372908n, // arbitrary not deployed yet
  Etherlink: 16672969n, // arbitrary not deployed yet
  Hemi: 2227553n, // arbitrary not deployed yet
  Lisk: 18934260n, // arbitrary not deployed yet
};

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
  Monad: 1000, // on testnet
  Berachain: 1900,
  Avalanche: 1700,
  BNB: 3000,
  WorldChain: 2000,
  Etherlink: 1000,
  Hemi: 12000,
  Lisk: 2000,
};

const BLOCK_DURATION = Object.values(CHAINS).reduce<
  Record<NetworkType, number>
>(
  (acc, chain) => {
    const blockTime =
      chain.blockTime || BLOCK_DURATION_LOCAL[chain.network] || 0;
    if (blockTime === 0)
      console.error(`Block time for ${chain.name} is unknown`);

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
