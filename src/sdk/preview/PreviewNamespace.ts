import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";
import type { MultichainSDK } from "../../onchain/index.js";
import type { ILogger } from "../../onchain/types/logger.js";
import { previewOperation } from "../../preview/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { IPreview } from "./types.js";

/**
 * {@inheritDoc IPreview}
 **/
export class PreviewNamespace implements IPreview {
  readonly #onchain: MultichainSDK;
  readonly #ensureFresh?: EnsureFreshChains;
  readonly #logger?: ILogger;

  constructor(onchain: MultichainSDK, options: NamespaceOptions) {
    this.#onchain = onchain;
    this.#ensureFresh = options.ensureFresh;
    this.#logger =
      options.logger?.child?.({ name: "Preview" }) ?? options.logger;
  }

  /**
   * {@inheritDoc IPreview.previewOperation}
   **/
  public async previewOperation(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<OperationPreview> {
    await this.#ensureFresh?.([input.chainId]);
    const sdk = this.#onchain.chain(input.chainId);
    return previewOperation(
      {
        sdk,
        to: input.to,
        calldata: input.calldata,
        sender: input.sender,
        value: input.value,
      },
      { blockNumber: options?.blockNumber, logger: this.#logger },
    );
  }
}
