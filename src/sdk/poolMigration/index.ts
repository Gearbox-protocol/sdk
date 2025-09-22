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
    // USDC
    {
      address: "0x4174aEe40eC3f27A68252663547Bc60E0B1b58c1",
      // "dUSDCV3" "Chaos"
      poolIn: "0xda00000035fef4082f78def6a8903bee419fbf8e",
      // "USDC" "invariant"
      poolOut: "0xc155444481854c60e7a29f4150373f479988f32d",
    },
    {
      address: "0xD2F14195b00cDBB5A7ba63273086C7eBc685F16D",
      // "dUSDCV3" "Chaos"
      poolIn: "0xda00000035fef4082f78def6a8903bee419fbf8e",
      // "USDC" "tulipa"
      poolOut: "0xf0795c47fa58d00f5f77f4d5c01f31ee891e21b4",
    },

    // wstETH
    {
      address: "0x0a5722f8D321B2e072d92FA78fEb0B2f84E600A3",
      // "dwstETHV3" "Chaos"
      poolIn: "0xff94993fa7ea27efc943645f95adb36c1b81244b",
      // "dcp0xLRT" "cp0x"
      poolOut: "0x72ccb97cbdc40f8fb7ffa42ed93ae74923547200",
    },
    {
      address: "0xd56149C868d77DE51b7c8EF55C172F06E677EcA6",
      // "dwstETHV3" "Chaos"
      poolIn: "0xff94993fa7ea27efc943645f95adb36c1b81244b",
      // "kpkwstETH" "kpk"
      poolOut: "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64",
    },

    // WETH
    {
      address: "0x4a981692330F40853dcEc441d6603f5BdfFCbEb2",
      // "dWETHV3" "Chaos"
      poolIn: "0xda0002859b2d05f66a753d8241fcde8623f26f4f",
      // "dWETHV3-cp0x" "cp0x"
      poolOut: "0xf00b548f1b69cb5ee559d891e03a196fb5101d4a",
    },
    {
      address: "0x799655d4285c7ed0cd36555bfe711e2f3cbda6c9",
      // "dWETHV3" "Chaos"
      poolIn: "0xda0002859B2d05F66a753d8241fCDE8623f26F4f",
      // "kpkWETH" "kpk"
      poolOut: "0x9396DCbf78fc526bb003665337C5E73b699571EF",
    },

    // tBTC
    {
      address: "0x88C7f9267F0a5690a182504D86c4161e41A8487A",
      // "dtBTCV3" "Chaos"
      poolIn: "0x7354ec6e852108411e681d13e11185c3a2567981",
      // "Re7tBTC" "re7"
      poolOut: "0xf791ecc5f2472637eac9dfe3f7894c0b32c32bdf",
    },
  ],
};
