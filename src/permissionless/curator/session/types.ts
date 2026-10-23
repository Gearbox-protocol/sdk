import type { Address, Hex } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { SafeTx } from "../../bindings/governance/types.js";
import type { TimelockTxs } from "../../utils/governance/types.js";
import type { GipActionDiagnostic } from "../actions/actionDiagnostics.js";
import type { GipMarketAction } from "../actions/types.js";
import type { Bundle } from "../bundles/Bundle.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import type { GipDiagnostic } from "../diagnostics/getGipDiagnostics.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";
import type { BatchTxs } from "../types.js";
import type { ActionScope } from "./actionScope.js";
import type { DiagnosticMarketInput } from "./collectGipDiagnostics.js";

/** Where a state in a preview or plan came from. **/
export type StateProvenance =
  /** Read from the chain at {@link GipSourceSnapshot.blockNumber}. **/
  | "chain-read"
  /** Read from the SDK's configured Anvil fork at its source block. **/
  | "fork-read"
  /**
   * Handed to the builder by the caller; never replaced by an on-chain read.
   * Makes no claim that the state corresponds to the SDK source block.
   **/
  | "caller-supplied"
  /**
   * Read from a caller-supplied OnchainSDK/GearboxState. Its block is checked
   * when available, while its canonical hash is reported as unverified.
   **/
  | "caller-supplied-sdk-state"
  /** The market does not exist yet; it is created by the first action. **/
  | "new-market";

/**
 * The one chain, configurator and block an SDK instance is scoped to.
 *
 * Every field is `readonly`: the runtime value is deep-frozen the moment the
 * SDK is created, so the type now matches what assigning to it actually does.
 **/
export interface GipSourceSnapshot {
  readonly chainId: number;
  readonly marketConfigurator: Address;
  /** Block every initial read, projection and dependency refers to. **/
  readonly blockNumber: bigint;
  /** Canonical hash returned for {@link blockNumber}. **/
  readonly blockHash: Hex;
  /** Timestamp of {@link blockNumber}, used instead of `Date.now()`. **/
  readonly blockTimestamp: number;
}

/** A contract a plan is expected to deploy. **/
export interface PredictedDeployment {
  address: Address;
  /** Index of the action that deploys it in the resolved action list. **/
  actionIndex: number;
  actionType: GipMarketAction["type"];
  /**
   * `"preview"` — predicted by a `preview*` call on the configurator.
   * `"create2"` — derived deterministically from a salt and constructor params.
   **/
  prediction: "preview" | "create2";
}

/** What `applyBundle` did to the recorded action list. **/
export interface BundleApplication {
  bundleName: string;
  /** Credit manager the bundle's zero-address placeholders resolved to. **/
  targetCreditManager?: Address;
  /** How the target was found. **/
  targetResolution:
    | "predicted-suite"
    | "existing-single-manager"
    | "not-required";
  /** Action types the merge added. **/
  added: GipMarketAction["type"][];
  /** Action types the merge replaced (these force a projection replay). **/
  replaced: GipMarketAction["type"][];
  /**
   * Bundle actions whose params do not satisfy their processor schema. The
   * bundle is still applied as authored; these are reported, not enforced.
   **/
  paramWarnings?: string[];
}

/** A check the preview could not complete, reported rather than skipped. **/
export interface IncompleteCheck {
  check: string;
  reason: string;
}

/** A `getGipDiagnostics` finding, as previews and market plans carry it. **/
export type MarketDiagnostic = GipDiagnostic<DiagnosticMarketInput>;

export interface MarketPreview {
  scope: "market";
  source: GipSourceSnapshot;
  pool?: Address;
  stateProvenance: StateProvenance;
  before?: MarketState;
  after: MarketState;
  /** Actions after bundle merges and credit-manager resolution. **/
  resolvedActions: readonly GipMarketAction[];
  bundles: readonly BundleApplication[];
  predictedDeployments: readonly PredictedDeployment[];
  /** Decimals resolved (and cached) for the tokens this compilation touched. **/
  tokenDecimals: Readonly<Record<Address, number>>;
  diagnostics: readonly MarketDiagnostic[];
  /**
   * Findings of the actions' `check` steps, warnings included. An error means
   * the batch would revert at that action: see {@link blockedAt}.
   **/
  actionDiagnostics: readonly GipActionDiagnostic[];
  /**
   * Index of the first action whose `check` found an error. The projection
   * stops before it, and `build()` and `simulate()` reject with a
   * `GipActionError`.
   **/
  blockedAt?: number;
  incompleteChecks: readonly IncompleteCheck[];
}

export interface ConfiguratorPreview {
  scope: "configurator";
  source: GipSourceSnapshot;
  stateProvenance: StateProvenance;
  before: ConfiguratorState;
  after: ConfiguratorState;
  resolvedActions: readonly ConfiguratorActions[];
  /**
   * Findings of the actions' `check` steps, warnings included. An error means
   * the batch would revert at that action: see {@link blockedAt}.
   **/
  actionDiagnostics: readonly GipActionDiagnostic[];
  /**
   * Index of the first action whose `check` found an error. The projection
   * stops before it, and `build()` and `simulate()` reject with a
   * `GipActionError`.
   **/
  blockedAt?: number;
  incompleteChecks: readonly IncompleteCheck[];
}

export type GipPreview = MarketPreview | ConfiguratorPreview;

/** Heuristic gas numbers, explicitly not measurements. **/
export interface GipPlanGas {
  /**
   * `heuristic-action-table` — the per-action table in `estimateActionGas`, not
   * an `eth_estimateGas` result.
   * `unavailable` — no estimate exists for this scope; the numbers are zero
   * placeholders, not a claim that execution is free.
   **/
  model: "heuristic-action-table" | "unavailable";
  /** Always `false`; simulate the plan to obtain real gas usage. **/
  isActualMeasurement: false;
  perBatch: readonly number[];
  total: number;
}

/** Transactions and provenance shared by every plan scope. **/
export interface GipPlanBase {
  /** Serialization format version of this plan shape. **/
  readonly planVersion: 1;
  scope: ActionScope;
  source: GipSourceSnapshot;
  author: Address;
  eta: number;
  /**
   * The GIP's own calls, i.e. what the TimeLock will execute.
   * These are NOT governor wrappers.
   **/
  payloadCalls: readonly RawTx[];
  /** `keccak256` TimeLock hash of each payload call at `eta`. **/
  payloadCallHashes: readonly Hex[];
  /** Payload calls grouped into batches that fit a block's gas limit. **/
  batches: readonly BatchTxs[];
  /** Governor `startBatch`/`queueTransaction` wrappers, one group per batch. **/
  timelockTxs: TimelockTxs;
  /** Safe-shaped `executeBatch` per queue batch. **/
  executeBatchSafeTxs: readonly SafeTx[];
  /** Raw `Governor.executeBatch` transactions, one per queue batch. **/
  executeBatchTxs: readonly RawTx[];
  /** Price feeds each batch touches, and their union. **/
  feedDependencies: {
    perBatch: readonly (readonly Address[])[];
    updatablePerBatch: readonly (readonly Address[])[];
    all: readonly Address[];
  };
  gas: GipPlanGas;
  /**
   * Checks the preview could not complete, carried verbatim into the plan.
   *
   * A consumer that only ever sees `build()`/`serializeGipPlan()` output must
   * still be able to tell "checked, nothing found" from "not checked", so this
   * is part of the plan and not only of the preview.
   **/
  incompleteChecks: readonly IncompleteCheck[];
}

export interface MarketGipPlan extends GipPlanBase {
  scope: "market";
  pool?: Address;
  stateProvenance: StateProvenance;
  before?: MarketState;
  after: MarketState;
  resolvedActions: readonly GipMarketAction[];
  predictedDeployments: readonly PredictedDeployment[];
  /** Bundle merges, including their `paramWarnings`. **/
  bundles: readonly BundleApplication[];
  /** `getGipDiagnostics` findings for this market, as reported by the preview. **/
  diagnostics: readonly MarketDiagnostic[];
}

export interface ConfiguratorGipPlan extends GipPlanBase {
  scope: "configurator";
  stateProvenance: StateProvenance;
  before: ConfiguratorState;
  after: ConfiguratorState;
  resolvedActions: readonly ConfiguratorActions[];
}

export type GipPlan = MarketGipPlan | ConfiguratorGipPlan;

/** Intent recorded by a market builder, in the order it was recorded. **/
export type MarketIntent =
  | { kind: "action"; action: GipMarketAction }
  | { kind: "bundle"; bundle: Bundle };
