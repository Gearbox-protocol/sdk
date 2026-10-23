import { json_parse, json_stringify } from "../../../onchain/index.js";
import type { GipPlan } from "./types.js";

/** Envelope version, bumped when the serialized plan shape changes. **/
export const GIP_PLAN_SERIALIZATION_VERSION = 1;

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
  const envelope = json_parse(serialized) as Partial<SerializedGipPlan>;
  if (envelope.serializationVersion !== GIP_PLAN_SERIALIZATION_VERSION) {
    throw new Error(
      `Unsupported GIP plan serialization version ${String(envelope.serializationVersion)}; expected ${GIP_PLAN_SERIALIZATION_VERSION}`,
    );
  }
  if (!envelope.plan) throw new Error("Serialized GIP plan has no plan");
  return envelope.plan;
}
