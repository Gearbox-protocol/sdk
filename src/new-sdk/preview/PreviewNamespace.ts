import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";
import { previewOperation } from "../../preview/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import type { ILogger } from "../../sdk/types/logger.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { Preview } from "./types.js";

/**
 * {@inheritDoc Preview}
 **/
export class PreviewNamespace implements Preview {
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
   * {@inheritDoc Preview.previewOperation}
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
