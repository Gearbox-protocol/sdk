export const PERIPHERY_CONTRACTS = [
  "DEGEN_DISTRIBUTOR",
  "DEGEN_NFT",
  "MULTI_PAUSE",
] as const;

export type PeripheryContract = (typeof PERIPHERY_CONTRACTS)[number];
