import type { Address } from "viem";
import type { TokenMetaData } from "../../sdk/index.js";
import type { Mode } from "../core/index.js";
import type { PoolOpportunityCollection } from "../opportunity/index.js";
import type { TokenCollectionType } from "./TokenCollection.js";

export type OnchainTokenMetaData = TokenMetaData & {
  chainId: number;
};

export interface CommonTokenCaps {
  chainId: number;
  address: Address;
  symbol: string;
  decimals: number;
}

export interface OnchainTokenCaps {
  name: string;
}

export interface OffchainTokenCaps<M extends Mode = Mode> {
  tokenType: "stable" | "base" | "yield";
  ticker: string;
  price: number;
  poolOpportunities(): PoolOpportunityCollection<M>;
}

export interface OffchainTokenCollectionCaps<M extends Mode> {
  withTokenTypes(
    ...tokenTypes: Array<OffchainTokenCaps["tokenType"]>
  ): TokenCollectionType<M>;
  withTickerLike(ticker: string | RegExp): TokenCollectionType<M>;
}
