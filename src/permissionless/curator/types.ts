import type { Address, Hex } from "viem";
import type { ParsedCall, RawTx } from "../../onchain/index.js";
import type { GipActionDiagnostic } from "./actions/actionDiagnostics.js";
import type { GipMarketAction } from "./actions/types.js";
import type { IncompleteCheck } from "./session/types.js";
import type { MarketState } from "./state/market/types.js";

export interface MarketTx {
  tx: RawTx;
  action: GipMarketAction;
  newContract?: Address;
}

export interface ParsedMarketTx extends MarketTx {
  estimatedGas: number;
  /** Price feeds the call reads; see `MarketActionDefinition.touchedFeeds`. **/
  touchedFeeds: Address[];
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
  /** Warnings the actions' `check` steps reported. **/
  diagnostics?: readonly GipActionDiagnostic[];
  /** Checks the executor could not complete against the source snapshot. **/
  incompleteChecks?: readonly IncompleteCheck[];
}

export interface DeployParams {
  postfix: Hex;
  salt: Hex;
  constructorParams: Hex;
}
