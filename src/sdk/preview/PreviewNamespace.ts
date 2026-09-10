import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
  SDKReturn,
} from "../../model/index.js";
import {
  type CheckOperationOptions,
  type CheckSimulationInput,
  checkOperation,
  checkSimulation,
  type HealthFactorThresholds,
  type MultichainSDK,
  type OperationValidationError,
  type PreviewOperationError,
  previewOperation,
  type SimulationValidationError,
} from "../../onchain/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { CheckOperationProps, IPreview } from "./types.js";

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

  /**
   * {@inheritDoc IPreview.checkOperation}
   **/
  public async checkOperation(
    props: CheckOperationProps,
    options?: CheckOperationOptions,
  ): Promise<OperationValidationError[]> {
    const { chainId, ...input } = props;
    await this.#ensureFresh?.([chainId]);
    const sdk = this.#onchain.chain(chainId);
    return checkOperation({ sdk, ...input }, options);
  }

  /**
   * {@inheritDoc IPreview.checkSimulation}
   **/
  public async checkSimulation(
    props: CheckSimulationInput,
    options?: HealthFactorThresholds,
  ): Promise<SimulationValidationError[]> {
    await this.#ensureFresh?.([props.chainId]);
    const sdk = this.#onchain.chain(props.chainId);
    return checkSimulation(sdk, props, options);
  }
}
