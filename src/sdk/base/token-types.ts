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

export type PhantomTokenContractType =
  (typeof PHANTOM_TOKEN_CONTRACT_TYPES)[number];

export type SimpleTokenMeta = TokenData & {
  isDSToken?: boolean;
  contractType?: string;
};

export type PhantomTokenMeta = SimpleTokenMeta & {
  contractType: PhantomTokenContractType;
};

// export type TokenMetaData =
//   | SimpleTokenMeta
//   | PhantomTokenMeta
//   | KYCTokenMeta
//   | DSTokenMeta;

export type TokenMetaData = SimpleTokenMeta | PhantomTokenMeta;
