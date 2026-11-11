import type {
  OpenAavePositionPreview,
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
  SDKReturn,
  UnsupportedOperationError,
} from "../../model/index.js";
import { sdkErr, sdkOk } from "../../model/index.js";
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
import { projectAavePosition } from "../../onchain/positions/projectAavePosition.js";
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
   * {@inheritDoc IPreview.openAavePosition}
   **/
  public async openAavePosition(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<SDKReturn<OpenAavePositionPreview, PreviewOperationError>> {
    const previewed = await this.previewOperation(input, options);
    if (!previewed.ok) {
      return previewed;
    }
    const preview = previewed.data;
    if (preview.operation !== "OpenCreditAccount") {
      return sdkErr({
        code: "unsupportedOperation",
        message: `operation "${preview.operation}" is not an Aave position opening`,
        operation: preview.operation,
      } satisfies UnsupportedOperationError);
    }
    const aave = projectAavePosition(this.#onchain.chain(input.chainId), {
      creditManager: preview.creditManager,
      assets: preview.estAssets.map(a => ({
        token: a.token.address,
        balance: a.value,
      })),
      quotas: preview.quotas.map(q => ({
        token: q.token.address,
        balance: q.value,
      })),
      totalDebt: preview.totalDebt.value,
      totalValue: preview.estTotalValue.value,
    });
    return sdkOk({ ...preview, aave });
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
