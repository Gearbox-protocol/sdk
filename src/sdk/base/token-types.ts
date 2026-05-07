import type { Address } from "viem";
import type { MarketData, Unarray } from "./types.js";

type TokenData = Unarray<MarketData["tokens"]>;

export const PHANTOM_TOKEN_CONTRACT_TYPES = [
  "PHANTOM_TOKEN::CONVEX",
  "PHANTOM_TOKEN::INFINIFI_UNWIND",
  "PHANTOM_TOKEN::INFRARED",
  "PHANTOM_TOKEN::MELLOW_WITHDRAWAL",
  "PHANTOM_TOKEN::MIDAS_REDEMPTION",
  "PHANTOM_TOKEN::STAKING_REWARDS",
  "PHANTOM_TOKEN::UPSHIFT_WITHDRAW",
] as const;

export const RWA_UNDERLYING_DEFAULT = "RWA_UNDERLYING::DEFAULT";
export const RWA_UNDERLYING_ON_DEMAND = "RWA_UNDERLYING::ON_DEMAND";

export type RWAUnderlyingContractType =
  | typeof RWA_UNDERLYING_DEFAULT
  | typeof RWA_UNDERLYING_ON_DEMAND;

export const RWA_ON_DEMAND_LP_MONOPOLIZED = "ON_DEMAND_LP::MONOPOLIZED";
export type RWAOnDemandLpContractType = typeof RWA_ON_DEMAND_LP_MONOPOLIZED;

export type PhantomTokenContractType =
  (typeof PHANTOM_TOKEN_CONTRACT_TYPES)[number];

export interface SimpleTokenMeta extends TokenData {
  contractType?: string;
}

export type PhantomTokenMeta = SimpleTokenMeta & {
  contractType: PhantomTokenContractType;
};

export interface RWADefaultTokenMeta extends SimpleTokenMeta {
  contractType: typeof RWA_UNDERLYING_DEFAULT;
  rwaFactory: Address;
  asset: Address;
}

export interface LPMonopolizedPoolMeta {
  pool: Address;
  wrappedUnderlying: Address;
  unwrappedUnderlying: Address;
  depositAllowance: bigint;
  claimableAmount: bigint;
}

export interface RWAOnDemandLPMonopolizedMeta {
  addr: Address;
  version: bigint;
  contractType: typeof RWA_ON_DEMAND_LP_MONOPOLIZED;
  marketConfigurator: Address;
  /**
   * Only this user can deposit into the pool and withdraw
   * Other users should not see it at all
   */
  depositor: Address;
  pools: LPMonopolizedPoolMeta[];
}

export type RWAOnDemandLPMeta = RWAOnDemandLPMonopolizedMeta;

export interface RWAOnDemandTokenMeta extends SimpleTokenMeta {
  contractType: typeof RWA_UNDERLYING_ON_DEMAND;
  rwaFactory: Address;
  asset: Address;
  pool: Address;
  marketConfigurator: Address;
  allowedDepositors: Address[];
  liquidityProvider: RWAOnDemandLPMeta;
}

export type RWATokenMeta = RWADefaultTokenMeta | RWAOnDemandTokenMeta;

export type TokenMetaData = SimpleTokenMeta | PhantomTokenMeta | RWATokenMeta;
