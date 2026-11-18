import { json_parse, json_stringify } from "../../../onchain/index.js";
import type { ConfiguratorGipPlan, GipPlan, MarketGipPlan } from "./types.js";

/** Envelope version, bumped when the serialized plan shape changes. **/
export const GIP_PLAN_SERIALIZATION_VERSION = 3;

export interface SerializedGipPlan {
  serializationVersion: number;
  plan: GipPlan;
}

/**
 * Portable JSON for a plan.
 *
 * `json_stringify`/`json_parse` from the Gearbox SDK are used so `bigint`
 * survives the round trip with the same semantics the existing serializers use
 * (the plan's `source.blockNumber` is a `bigint`).
 **/
export function serializeGipPlan(plan: GipPlan): string {
  return json_stringify({
    serializationVersion: GIP_PLAN_SERIALIZATION_VERSION,
    plan,
  });
}

export function deserializeGipPlan(serialized: string): GipPlan {
  type LegacyPlan = (
    | Omit<MarketGipPlan, "planVersion" | "actionDiagnostics" | "tokenDecimals">
    | Omit<ConfiguratorGipPlan, "planVersion" | "actionDiagnostics">
  ) & { planVersion: 2 };
  const envelope = json_parse(serialized) as {
    serializationVersion?: number;
    plan?: GipPlan | LegacyPlan;
  };
  if (envelope.serializationVersion === 2 && envelope.plan?.planVersion === 2) {
    const legacy = envelope.plan;
    const review = {
      planVersion: 3 as const,
      actionDiagnostics: [],
      incompleteChecks: [
        ...legacy.incompleteChecks,
        {
          check: "legacyPlanReviewData",
          reason:
            "Version 2 plans did not retain action warnings or per-market token decimals.",
        },
      ],
    };
    return legacy.scope === "market"
      ? { ...legacy, ...review, tokenDecimals: {} }
      : { ...legacy, ...review };
  }
  if (envelope.serializationVersion !== GIP_PLAN_SERIALIZATION_VERSION) {
    throw new Error(
      `Unsupported GIP plan serialization version ${String(envelope.serializationVersion)}; expected ${GIP_PLAN_SERIALIZATION_VERSION}`,
    );
  }
  if (!envelope.plan) throw new Error("Serialized GIP plan has no plan");
  if (envelope.plan.planVersion !== 3)
    throw new Error(
      `Unsupported GIP plan version ${String(envelope.plan.planVersion)}; expected 3`,
    );
  return envelope.plan;
}
