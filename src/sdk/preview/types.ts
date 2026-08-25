import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";

/**
 * On-chain preview of a raw operation calldata.
 **/
export interface Preview {
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
 *
 * @internal
 **/
export interface PreviewByMode {
  onchain: Preview;
  offchain: undefined;
  both: Preview;
}
