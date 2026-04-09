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

export const KYC_UNDERLYING_DEFAULT = "KYC_UNDERLYING::DEFAULT";
export const KYC_UNDERLYING_ON_DEMAND = "KYC_UNDERLYING::ON_DEMAND";

export type KYCUnderlyingContractType =
  | typeof KYC_UNDERLYING_DEFAULT
  | typeof KYC_UNDERLYING_ON_DEMAND;

export const KYC_ON_DEMAND_LP_MONOPOLIZED = "ON_DEMAND_LP::MONOPOLIZED";
export type KYCOnDemandLpContractType = typeof KYC_ON_DEMAND_LP_MONOPOLIZED;

export type PhantomTokenContractType =
  (typeof PHANTOM_TOKEN_CONTRACT_TYPES)[number];

export interface SimpleTokenMeta extends TokenData {
  contractType?: string;
}

export type PhantomTokenMeta = SimpleTokenMeta & {
  contractType: PhantomTokenContractType;
};

export interface KYCDefaultTokenMeta extends SimpleTokenMeta {
  contractType: typeof KYC_UNDERLYING_DEFAULT;
  kycFactory: Address;
  asset: Address;
}

export interface LPMonopolizedPoolMeta {
  pool: Address;
  wrappedUnderlying: Address;
  unwrappedUnderlying: Address;
  depositAllowance: bigint;
  claimableAmount: bigint;
}

export interface KYCOnDemandLPMonopolizedMeta {
  addr: Address;
  version: bigint;
  contractType: typeof KYC_ON_DEMAND_LP_MONOPOLIZED;
  marketConfigurator: Address;
  /**
   * Only this user can deposit into the pool and withdraw
   * Other users should not see it at all
   */
  depositor: Address;
  pools: LPMonopolizedPoolMeta[];
}

export type KYCOnDemandLPMeta = KYCOnDemandLPMonopolizedMeta;

export interface KYCOnDemandTokenMeta extends SimpleTokenMeta {
  contractType: typeof KYC_UNDERLYING_ON_DEMAND;
  kycFactory: Address;
  asset: Address;
  pool: Address;
  marketConfigurator: Address;
  allowedDepositors: Address[];
  liquidityProvider: KYCOnDemandLPMeta;
}

export type KYCTokenMeta = KYCDefaultTokenMeta | KYCOnDemandTokenMeta;

export type TokenMetaData = SimpleTokenMeta | PhantomTokenMeta | KYCTokenMeta;
