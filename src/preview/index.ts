/**
 * The vocabulary the issues this module hands out are written in. Published
 * here so a caller switching on `reason` does not have to reach into
 * `@gearbox-protocol/sdk/onchain` for the names to do it with.
 * `IntentPreviewError` itself stays engine-internal: refusals leave the SDK
 * as plain returned objects, not thrown classes.
 */

export type { InvalidDelayedIntentError } from "../onchain/accounts/withdrawal-compressor/errors.js";
// The two refusal errors of `previewOperation`'s union that are raised
// outside this module's own barrels, re-exported so the preview surface
// names every refusal it can answer with.
export { invalidDelayedIntent } from "../onchain/accounts/withdrawal-compressor/errors.js";
export {
  type BorrowLimitBinding,
  type PreviewErrorDetails,
  type PreviewErrorReason,
  type PreviewIssue,
  type PreviewRefusal,
  raise,
  refuse,
} from "../onchain/validation/refusal.js";
export * from "./parse/index.js";
export * from "./prerequisites/index.js";
export * from "./preview/index.js";
export {
  asPreviewSimulationError,
  type PreviewSimulationError,
  previewSimulationFailed,
  type SimulationError,
  type SimulationFlowFailure,
  type SimulationFlowSource,
} from "./simulate/errors.js";
export * from "./trace/index.js";
export * from "./types.js";
export * from "./validate/index.js";
