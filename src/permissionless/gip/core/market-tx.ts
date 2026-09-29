import type { Address, Hex } from "viem";
import type { ParsedCall, RawTx } from "../../../onchain/index.js";
import type { MarketActions } from "./actions/index.js";
import type { MarketState } from "./market-state/types.js";

export interface MarketTx {
  tx: RawTx;
  action: MarketActions;
  newContract?: Address;
}

export interface ParsedMarketTx extends MarketTx {
  estimatedGas: number;
  touchedFeed?: Address;
  decoded: ParsedCall;
}

export interface ExtendedMarketTx extends ParsedMarketTx {
  market: Address;
}

export interface BatchTxs {
  txs: Array<RawTx>;
  estimatedGas: number;
  touchedFeeds: Address[];
}

export interface MarketStateChanges {
  before: MarketState;
  after: MarketState;
  txs: ParsedMarketTx[];
}

export interface DeployParams {
  postfix: Hex;
  salt: Hex;
  constructorParams: Hex;
}
