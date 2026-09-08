import type {
  ChainId,
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
  SDKReturn,
} from "../../model/index.js";
import type {
  CheckOperationInput,
  CheckOperationOptions,
  CheckSimulationInput,
  HealthFactorThresholds,
  OperationValidationError,
  PreviewOperationError,
  SimulationValidationError,
} from "../../onchain/index.js";

/**
 * Parsed-operation check on the namespace: the standalone input minus `sdk`,
 * plus the chain to resolve it on. `OperationPreview` only names the chain
 * inside a token, so `chainId` is required.
 **/
export type CheckOperationProps = Omit<CheckOperationInput, "sdk"> & {
  chainId: ChainId;
};

/**
 * On-chain preview of a raw operation calldata, and checks of a parsed or
 * simulated one.
 **/
export interface IPreview {
  /**
   * Decodes a raw operation and assembles an operation-specific,
   * human-displayable preview.
   **/
  previewOperation(
    input: PreviewOperationInput,
    options?: PreviewOperationOptions,
  ): Promise<SDKReturn<OperationPreview, PreviewOperationError>>;
  /**
   * Whether a parsed operation may be signed by `sender`: protocol state first,
   * then what the wallet has to approve, hold or sign.
   **/
  checkOperation(
    props: CheckOperationProps,
    options?: CheckOperationOptions,
  ): Promise<OperationValidationError[]>;
  /**
   * Whether a simulated operation clears the caller's own thresholds.
   *
   * Async because the namespace refreshes chain state first; the standalone
   * checker is sync.
   **/
  checkSimulation(
    props: CheckSimulationInput,
    options?: HealthFactorThresholds,
  ): Promise<SimulationValidationError[]>;
}

/**
 * `sdk.preview` per mode: an on-chain read, absent when the SDK reads no chain.
 **/
export interface IPreviewByMode {
  onchain: IPreview;
  offchain: undefined;
  both: IPreview;
}
