import type { Address } from "abitype";
import type { NetworkType } from "../chain/chains.js";

export interface PoolMigrationContract {
  address: Address;

  poolIn: Address;
  poolOut: Address;
}

/**
 * Temporary contracts
 */
export const POOL_DELAYED_MIGRATION_CONTRACTS: Partial<
  Record<NetworkType, PoolMigrationContract[]>
> = {
  Mainnet: [
    {
      // TODO: fix address
      address: "0xc155444481854c60e7a29f4150373f479988f32d",
      // "dUSDCV3" "Trade USDC v3"
      poolIn: "0xda00000035fef4082f78def6a8903bee419fbf8e",
      // "USDC" "invariant"
      poolOut: "0xc155444481854c60e7a29f4150373f479988f32d",
    },
    {
      // TODO: fix address
      address: "0xf0795c47fa58d00f5f77f4d5c01f31ee891e21b4",
      // "dUSDCV3" "Trade USDC v3"
      poolIn: "0xda00000035fef4082f78def6a8903bee419fbf8e",
      // "USDC" "tulipa"
      poolOut: "0xf0795c47fa58d00f5f77f4d5c01f31ee891e21b4",
    },

    {
      // TODO: fix address
      address: "0xf00b548f1b69cb5ee559d891e03a196fb5101d4a",
      // "dWETHV3" "Trade WETH v3"
      poolIn: "0xda0002859b2d05f66a753d8241fcde8623f26f4f",
      // "dWETHV3-cp0x" "Gearbox WETH v3"
      poolOut: "0xf00b548f1b69cb5ee559d891e03a196fb5101d4a",
    },
  ],
};
