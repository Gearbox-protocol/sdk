import type { Address, Hex } from "viem";
import type {
  StrategyOpportunity,
  StrategyOpportunityKey,
} from "../../model/index.js";
import type { RawTx } from "../../onchain/index.js";
import type { GearboxSDK } from "../../sdk/index.js";
import type {
  IOpportunitiesPrepare,
  StrategyResult,
  StrategyRoutesResult,
} from "../../sdk/prepare/types.js";
import type { AnvilAccountEnvironment } from "../AnvilAccountEnvironment.js";
import type { ConfirmedTransaction } from "../sendAndConfirm.js";

export type LeverageDirection = "up" | "down" | "debtFree";

export type JourneyAction =
  | { kind: "open"; reuse: boolean }
  | { kind: "deposit"; raiseLeverage: boolean }
  | { kind: "adjustLeverage"; direction: LeverageDirection }
  | { kind: "addCollateral" }
  | { kind: "repay"; all: boolean }
  | { kind: "withdraw"; all: boolean }
  | { kind: "withdrawCollateral" };

/** Token amounts use the funding token's decimals, except target balances. */
export interface JourneyState {
  /** The zero address before the first opening, when no position exists yet. */
  creditAccount: Address;
  debt: bigint;
  value: bigint;
  leverage: number;
  healthFactor: number;
  targetBalance: bigint;
  walletUnderlying: bigint;
  walletTarget: bigint;
  quota: bigint;
  pendingWithdrawals: number;
}

export interface JourneyStep {
  action: JourneyAction;
  transactions: Hex[];
  route: "direct" | "instant" | "delayed";
  before: JourneyState;
  after: JourneyState;
  expected: Pick<JourneyState, "debt" | "value" | "leverage">;
  /** Requested wallet amount: funding token for deposits/withdrawals, target for collateral. */
  amount?: bigint;
  targetIsUnderlying: boolean;
}

export interface JourneySessionOptions {
  sdk: GearboxSDK<"onchain">;
  environment: AnvilAccountEnvironment;
  strategy: StrategyOpportunity;
  key: StrategyOpportunityKey;
  collateral: bigint;
  leverage: bigint;
  slippage: number;
  route: "auto" | "instant" | "delayed";
  settle?: (
    environment: AnvilAccountEnvironment,
    creditAccount: Address,
  ) => Promise<void>;
}

export type JourneyExecution = Pick<
  JourneyStep,
  "transactions" | "expected" | "route"
>;

/** Infrastructure available to journey implementations; no action dispatcher. */
export interface JourneySession {
  readonly options: JourneySessionOptions;
  readonly sdk: GearboxSDK<"onchain">;
  readonly prepare: IOpportunitiesPrepare;
  readonly environment: AnvilAccountEnvironment;
  readonly underlying: Address;
  readonly target: Address;
  readonly owner: Address;
  readonly position: { chainId: number; creditAccount: Address };
  /** Opens the starting position through the public SDK API, recorded as setup. */
  setupPosition(): Promise<JourneyPositionSetup>;
  fund(token: Address, amount: bigint): Promise<void>;
  /** State of the journey's position; fails before an account is adopted. */
  state(): Promise<JourneyState>;
  /** Like `state()`, or an empty position with the wallet balances before the first opening. */
  stateOrEmpty(): Promise<JourneyState>;
  fundingAmount(amount: bigint): bigint;
  adoptCreditAccount(account: Address): void;
  sendTx(tx: RawTx, label: string): Promise<ConfirmedTransaction>;
  direct(data: StrategyResult, label: string): Promise<JourneyExecution>;
  routed(
    routes: StrategyRoutesResult,
    label: string,
    allowDelayed?: boolean,
  ): Promise<JourneyExecution>;
}

export interface JourneyPositionSetup {
  transactions: Hex[];
  state: JourneyState;
}

export type JourneyPhase = "setup" | "action" | "cleanup";

export type JourneyStatus = "passed" | "failed" | "unsupported" | "blocked";

export class JourneyUnavailable extends Error {
  constructor(
    public readonly status: "unsupported" | "blocked",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "JourneyUnavailable";
  }
}

export interface JourneyResult {
  journey: string;
  status: JourneyStatus;
  setup: {
    status: "pending" | "passed" | "failed";
    position?: JourneyPositionSetup;
    /** Actions whose wallet prerequisites were successfully prepared. */
    actions: JourneyAction[];
  };
  /** Only the behavior under test, never the initial setup opening. */
  steps: JourneyStep[];
  failurePhase?: JourneyPhase;
  reason?: string;
}

export interface JourneyReport {
  strategy: StrategyOpportunityKey;
  results: JourneyResult[];
  /** Restoration failed: no further journeys may use this fork. */
  aborted: boolean;
}
