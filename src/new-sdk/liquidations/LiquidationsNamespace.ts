import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  MultichainSDK,
} from "../../sdk/index.js";
import { toChainIds } from "../../sdk/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import type { Liquidations } from "./types.js";

/**
 * {@inheritDoc Liquidations}
 **/
export class LiquidationsNamespace implements Liquidations {
  readonly #onchain: MultichainSDK;
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(onchain: MultichainSDK, options: NamespaceOptions) {
    this.#onchain = onchain;
    this.#ensureFresh = options.ensureFresh;
  }

  /**
   * {@inheritDoc Liquidations.getLiquidatableAccounts}
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps<true>,
  ): Promise<DataResponse<LiquidatableAccount[]>> {
    await this.#ensureFresh?.(props?.chainIds);
    return this.#onchain.liquidations.getLiquidatableAccounts(props);
  }

  /**
   * {@inheritDoc Liquidations.getLiquidationDetails}
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps<true>,
  ): Promise<DataResponse<LiquidationDetails>> {
    await this.#ensureFresh?.(toChainIds([props.network]));
    return this.#onchain.liquidations.getLiquidationDetails(props);
  }

  /**
   * {@inheritDoc Liquidations.buildLiquidationTx}
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>> {
    await this.#ensureFresh?.(toChainIds([props.network]));
    return this.#onchain.liquidations.buildLiquidationTx(props);
  }

  /**
   * {@inheritDoc Liquidations.getLiquidationPositions}
   **/
  public async getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<DataResponse<LiquidationPosition[]>> {
    await this.#ensureFresh?.(props.chainIds);
    return this.#onchain.liquidations.getLiquidationPositions(props);
  }
}
