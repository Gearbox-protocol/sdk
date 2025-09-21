import type { Address } from "viem";

import type { NetworkType } from "../chain/index.js";

export const MULTICALL_ADDRESS: Address =
  "0xcA11bde05977b3631167028862bE2a173976CA11";

/**
 * Address 0x0000000000000000000000000000000000000000
 */
export const ADDRESS_0X0: Address =
  "0x0000000000000000000000000000000000000000";

/**
 * Dummy address to satisfy `0x${string}` typecheck, but fail on `isAddress` check
 */
export const NOT_DEPLOYED = "0xNOT DEPLOYED";

/**
 * Well-known USDC token address used to determine NetworkType on testnets with different chain ids
 *
 * @deprecated TODO: delete me
 */
// export const USDC: Record<NetworkType, Address> = {
//   Mainnet: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//   Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
//   Optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
//   Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//   Sonic: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
//   // TODO: New networks
//   MegaETH: NOT_DEPLOYED,
//   Monad: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
//   Berachain: "0x549943e04f40284185054145c6e4e9568c1d3241",
//   Avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
// };

/**
 * @deprecated TODO: delete me
 */
// export const USDT: Record<NetworkType, Address> = {
//   Mainnet: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
//   Arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
//   Optimism: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
//   Base: NOT_DEPLOYED,
//   Sonic: NOT_DEPLOYED,
//   // TODO: New networks
//   MegaETH: NOT_DEPLOYED,
//   Monad: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
//   Berachain: NOT_DEPLOYED,
//   Avalanche: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
// };

/**
 * @deprecated TODO: delete me
 */
// export const WETH: Record<NetworkType, Address> = {
//   Mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//   Arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
//   Optimism: "0x4200000000000000000000000000000000000006",
//   Base: "0x4200000000000000000000000000000000000006",
//   Sonic: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
//   MegaETH: "0x4eB2Bd7beE16F38B1F4a0A5796Fffd028b6040e9",
//   Monad: "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37",
//   Berachain: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
//   Avalanche: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
// };

export const TIMELOCK: Record<NetworkType, Address> = {
  Mainnet: "0xa133C9A92Fb8dDB962Af1cbae58b2723A0bdf23b",
  Arbitrum: "0x148DD932eCe1155c11006F5650c6Ff428f8D374A",
  Optimism: "0x148DD932eCe1155c11006F5650c6Ff428f8D374A",
  Base: NOT_DEPLOYED,
  Sonic: "0xAdbF876ce58CB65c99b18078353e1DCB16E69e84",
  // New networks
  MegaETH: NOT_DEPLOYED,
  Monad: NOT_DEPLOYED,
  Berachain: NOT_DEPLOYED,
  Avalanche: NOT_DEPLOYED,
  BNB: NOT_DEPLOYED,
  WorldChain: NOT_DEPLOYED,
  Etherlink: NOT_DEPLOYED,
  Hemi: NOT_DEPLOYED,
  Lisk: NOT_DEPLOYED,
  Plasma: NOT_DEPLOYED,
};

export const GEARBOX_MULTISIG: Record<NetworkType, Address> = {
  Mainnet: "0xA7D5DDc1b8557914F158076b228AA91eF613f1D5",
  Arbitrum: "0x57Fd8B1a9213624157786Fff4a7bc532Ce717773",
  Optimism: "0x8bA8cd6D00919ceCc19D9B4A2c8669a524883C4c",
  Base: NOT_DEPLOYED,
  Sonic: "0xacEB9dc6a81f1C9E2d8a86c3bFec3f6EF584139D",
  // New networks
  MegaETH: NOT_DEPLOYED,
  Monad: NOT_DEPLOYED,
  Berachain: NOT_DEPLOYED,
  Avalanche: NOT_DEPLOYED,
  BNB: NOT_DEPLOYED,
  WorldChain: NOT_DEPLOYED,
  Etherlink: NOT_DEPLOYED,
  Hemi: NOT_DEPLOYED,
  Lisk: NOT_DEPLOYED,
  Plasma: NOT_DEPLOYED,
};

export const GEARBOX_RISK_CURATORS: Record<NetworkType, Address[]> = {
  Mainnet: [TIMELOCK.Mainnet],
  Arbitrum: [TIMELOCK.Arbitrum],
  Optimism: [TIMELOCK.Optimism],
  Base: [TIMELOCK.Base],
  Sonic: [TIMELOCK.Sonic],
  // New networks
  MegaETH: [],
  Monad: [],
  Berachain: [],
  Avalanche: [],
  BNB: [],
  WorldChain: [],
  Etherlink: [],
  Hemi: [],
  Lisk: [],
  Plasma: [],
};

/**
 * Depreciated pools
 */
export const DEPRECIATED_POOLS: Record<NetworkType, Record<Address, string>> = {
  Mainnet: {
    ["0x1dc0f3359a254f876b37906cfc1000a35ce2d717".toLowerCase() as Address]:
      "USDT_V3_BROKEN",
  },
  Arbitrum: {},
  Optimism: {},
  Base: {},
  Sonic: {},
  // New networks
  MegaETH: {},
  Monad: {},
  Berachain: {},
  Avalanche: {},
  BNB: {},
  WorldChain: {},
  Etherlink: {},
  Hemi: {},
  Lisk: {},
  Plasma: {},
};
