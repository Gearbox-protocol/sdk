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
  /**
   * Position of the action this call executes in the market's action list:
   * a preview's `inputActions`. A merged GIP runs a periphery call listed by
   * several markets once, so a market's calls can skip positions.
   **/
  actionIndex: number;
  estimatedGas: number;
  /** Price feeds the call reads; see `MarketActionDefinition.touchedFeeds`. **/
  touchedFeeds: Address[];
  decoded: ParsedCall;
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
