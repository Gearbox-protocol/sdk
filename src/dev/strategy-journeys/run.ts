import type { Hex } from "viem";
import type { StrategyOpportunityKey } from "../../model/index.js";
import { errorMessage } from "../errorMessage.js";
import { CORE_JOURNEYS, type CoreJourney } from "./journeys.js";
import {
  type JourneyPhase,
  type JourneyReport,
  type JourneyResult,
  type JourneySession,
  type JourneyStatus,
  JourneyUnavailable,
} from "./types.js";

export { CORE_JOURNEYS, type CoreJourney } from "./journeys.js";

export interface JourneyRunnerOptions {
  strategy: StrategyOpportunityKey;
  journeys?: readonly CoreJourney[];
  isolation: {
    snapshot(): Promise<Hex>;
    restore(snapshot: Hex): Promise<void>;
  };
  /** Called inside each snapshot. Must create a fresh SDK, including after a revert. */
  withSession<T>(run: (session: JourneySession) => Promise<T>): Promise<T>;
  valueToleranceBps?: number;
  onResult?(result: JourneyResult): void;
}

function appendReason(result: JourneyResult, reason: string): void {
  result.reason = result.reason ? `${result.reason}; ${reason}` : reason;
}

/** A setup failure blocks the journey without claiming the tested behavior failed. */
function statusFor(phase: JourneyPhase, error: unknown): JourneyStatus {
  if (phase === "setup") return "blocked";
  if (phase === "action" && error instanceof JourneyUnavailable)
    return error.status;
  return "failed";
}

/** Each journey is independent. A failed restore aborts the suite to prevent state leakage. */
export async function runStrategyJourneys(
  options: JourneyRunnerOptions,
): Promise<JourneyReport> {
  const journeys =
    options.journeys ?? (Object.keys(CORE_JOURNEYS) as CoreJourney[]);
  if (journeys.length === 0) throw new Error("Select at least one journey");
  for (const id of journeys)
    if (!Object.hasOwn(CORE_JOURNEYS, id))
      throw new Error(`Unknown journey: ${id}`);
  const report: JourneyReport = {
    strategy: options.strategy,
    results: [],
    aborted: false,
  };
  for (const journey of journeys) {
    const result: JourneyResult = {
      journey,
      status: "passed",
      setup: { status: "pending", actions: [] },
      steps: [],
    };
    let phase: JourneyPhase = "setup";
    const fail = (error: unknown) => {
      result.failurePhase = phase;
      result.status = statusFor(phase, error);
      if (phase === "setup") result.setup.status = "failed";
      appendReason(result, `${phase}: ${errorMessage(error)}`);
    };
    let snapshot: Hex | undefined;
    try {
      snapshot = await options.isolation.snapshot();
      await options.withSession(async session => {
        try {
          await CORE_JOURNEYS[journey].run(session, {
            result,
            valueToleranceBps: options.valueToleranceBps,
            onPhase: next => {
              phase = next;
            },
          });
        } catch (error) {
          fail(error);
        } finally {
          // Let the environment restore KYC even after an action/setup error.
          // Record that error first so a cleanup failure cannot hide it.
          phase = "cleanup";
        }
      });
    } catch (error) {
      fail(error);
      if (!snapshot) report.aborted = true;
    } finally {
      if (snapshot) {
        try {
          await options.isolation.restore(snapshot);
        } catch (error) {
          result.status = "failed";
          result.failurePhase = "cleanup";
          appendReason(
            result,
            `Snapshot restoration failed: ${errorMessage(error)}`,
          );
          report.aborted = true;
        }
      }
    }
    report.results.push(result);
    options.onResult?.(result);
    if (report.aborted) break;
  }
  return report;
}
