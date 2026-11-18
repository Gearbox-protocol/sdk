import { GipActionError } from "../actions/actionDiagnostics.js";
import type { MergedGipPreview } from "./MergedGip.js";
import type { GipPreviewBase } from "./types.js";

/**
 * Throws the `GipActionError` that `build()` and `simulate()` throw for a
 * blocked preview: a market or configurator preview, or a merged market GIP,
 * is blocked once an action's `check` found an error.
 *
 * Previews are frozen data, so they report the blocking action through
 * `blockedAt` and `actionDiagnostics` rather than carrying the error itself.
 *
 * @throws GipActionError when an action's `check` found an error
 **/
export function assertNotBlocked(
  preview: GipPreviewBase | MergedGipPreview,
): void {
  const blocked =
    "markets" in preview
      ? preview.markets.find(market => market.blockedAt !== undefined)
      : preview.blockedAt !== undefined
        ? preview
        : undefined;
  if (blocked) throw new GipActionError([...blocked.actionDiagnostics]);
}
