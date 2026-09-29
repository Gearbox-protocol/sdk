import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type {
  BuildLiquidationTxProps,
  CheckLiquidationInput,
  CheckLiquidationOptions,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  LiquidationValidationError,
  MultichainSDK,
} from "../../onchain/index.js";
import { checkLiquidation, toChainIds } from "../../onchain/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { ILiquidations, IsEmergencyLiquidatorProps } from "./types.js";

/**
 * {@inheritDoc ILiquidations}
 **/
export class LiquidationsNamespace implements ILiquidations {
  readonly #onchain: MultichainSDK;
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(onchain: MultichainSDK, options: NamespaceOptions) {
    this.#onchain = onchain;
    this.#ensureFresh = options.ensureFresh;
  }

  /**
   * {@inheritDoc ILiquidations.getLiquidatableAccounts}
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps<true>,
  ): Promise<DataResponse<LiquidatableAccount[]>> {
    await this.#ensureFresh?.(props?.chainIds);
    return this.#onchain.liquidations.getLiquidatableAccounts(props);
  }

  /**
   * {@inheritDoc ILiquidations.getLiquidationDetails}
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps<true>,
  ): Promise<DataResponse<LiquidationDetails>> {
    await this.#ensureFresh?.(toChainIds([props.network]));
    return this.#onchain.liquidations.getLiquidationDetails(props);
  }

  /**
   * {@inheritDoc ILiquidations.buildLiquidationTx}
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>> {
    await this.#ensureFresh?.(toChainIds([props.network]));
    return this.#onchain.liquidations.buildLiquidationTx(props);
  }

  /**
   * {@inheritDoc ILiquidations.getLiquidationPositions}
   **/
  public async getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<DataResponse<LiquidationPosition[]>> {
    await this.#ensureFresh?.(props.chainIds);
    return this.#onchain.liquidations.getLiquidationPositions(props);
  }

  /**
   * {@inheritDoc ILiquidations.checkLiquidation}
   **/
  public async checkLiquidation(
    props: CheckLiquidationInput,
    options?: CheckLiquidationOptions,
  ): Promise<LiquidationValidationError[]> {
    await this.#ensureFresh?.([props.details.chainId]);
    const sdk = this.#onchain.chain(props.details.chainId);
    return checkLiquidation(sdk, props, options);
  }

  /**
   * {@inheritDoc ILiquidations.isEmergencyLiquidator}
   **/
  public isEmergencyLiquidator(props: IsEmergencyLiquidatorProps): boolean {
    try {
      return this.#onchain
        .chain(props.chainId)
        .marketRegister.findByCreditManager(props.creditManager)
        .isEmergencyLiquidator(props.liquidator);
    } catch {
      return false;
    }
  }
}
