import type { Address } from "viem";
import type { MarketData, Unarray } from "./types.js";

export type SimpleTokenMeta = Unarray<MarketData["tokens"]>;

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

export type PhantomTokenContractType =
  (typeof PHANTOM_TOKEN_CONTRACT_TYPES)[number];

export type PhantomTokenMeta = SimpleTokenMeta & {
  contractType: PhantomTokenContractType;
};

export type KYCDefaultTokenMeta = SimpleTokenMeta & {
  contractType: typeof KYC_UNDERLYING_DEFAULT;
  kycFactory: Address;
  asset: Address;
};

export type KYCOnDemandTokenMeta = SimpleTokenMeta & {
  contractType: typeof KYC_UNDERLYING_ON_DEMAND;
  kycFactory: Address;
  asset: Address;
  pool: Address;
  liquidityProvider: Address;
};

export type KYCTokenMeta = KYCDefaultTokenMeta | KYCOnDemandTokenMeta;

export type TokenMetaData = SimpleTokenMeta | PhantomTokenMeta | KYCTokenMeta;
