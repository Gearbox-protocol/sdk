import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
  SDKReturn,
} from "../../model/index.js";
import {
  type MultichainSDK,
  type PreviewOperationError,
  previewOperation,
} from "../../onchain/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { IPreview } from "./types.js";

/**
 * {@inheritDoc IPreview}
 **/
export class PreviewNamespace implements IPreview {
  readonly #onchain: MultichainSDK;
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(onchain: MultichainSDK, options: NamespaceOptions) {
    this.#onchain = onchain;
    this.#ensureFresh = options.ensureFresh;
  }

  /**
   * {@inheritDoc IPreview.previewOperation}
   **/
  public async previewOperation(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<SDKReturn<OperationPreview, PreviewOperationError>> {
    await this.#ensureFresh?.([input.chainId]);
    const sdk = this.#onchain.chain(input.chainId);
    return previewOperation(sdk, input, options);
  }
}
