import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
  SDKReturn,
} from "../../model/index.js";
import type { PreviewOperationError } from "../../preview/index.js";

/**
 * On-chain preview of a raw operation calldata.
 **/
export interface IPreview {
  /**
   * Decodes a raw operation and assembles an operation-specific,
   * human-displayable preview. A refusal of the calldata — an unsupported
   * target, function or operation, a foreign delayed intent, a failed
   * simulation — is the `ok: false` half; genuine failures still throw.
   **/
  previewOperation(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<SDKReturn<OperationPreview, PreviewOperationError>>;
}

/**
 * `sdk.preview` per mode: an on-chain read, absent when the SDK reads no chain.
 **/
export interface IPreviewByMode {
  onchain: IPreview;
  offchain: undefined;
  both: IPreview;
}
