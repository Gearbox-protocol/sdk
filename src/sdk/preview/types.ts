import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";

/**
 * On-chain preview of a raw operation calldata.
 **/
export interface IPreview {
  /**
   * Decodes a raw operation and assembles an operation-specific,
   * human-displayable preview. Throws when the operation is unsupported or
   * the targeted credit account cannot be resolved.
   **/
  previewOperation(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<OperationPreview>;
}

/**
 * `sdk.preview` per mode: an on-chain read, absent when the SDK reads no chain.
 **/
export interface IPreviewByMode {
  onchain: IPreview;
  offchain: undefined;
  both: IPreview;
}
