import { MultichainConstruct } from "../../base/index.js";
import type { PluginsMap } from "../../plugins/index.js";
import type { MultichainResult, RawTx } from "../../types/index.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  LoadRWALiquidatorsProps,
} from "./types.js";

/**
 * Cross-chain counterpart of {@link LiquidationsService}.
 *
 * Fans out over all chains configured in {@link MultichainSDK} (optionally
 * restricted via {@link MultichainNetworksProps.networks}). A failed chain is
 * logged as a warning and skipped, so one dead RPC does not empty the whole
 * list; its failure is reported in {@link MultichainResult.meta}. Networks that
 * are not configured in the SDK are reported there the same way.
 **/
export class MultichainLiquidationsService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  /**
   * Accounts of all queried chains, see
   * {@link LiquidationsService.getLiquidatableAccounts}.
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps<true>,
  ): Promise<MultichainResult<LiquidatableAccount[]>> {
    return this.queryChains({
      networks: props?.networks,
      label: "get liquidatable accounts",
      run: sdk => sdk.liquidations.getLiquidatableAccounts(props),
    });
  }

  /**
   * {@inheritDoc LiquidationsService.getLiquidationDetails}
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps<true>,
  ): Promise<LiquidationDetails> {
    return this.sdk
      .chain(props.network)
      .liquidations.getLiquidationDetails(props);
  }

  /**
   * {@inheritDoc LiquidationsService.buildLiquidationTx}
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<RawTx> {
    return this.sdk.chain(props.network).liquidations.buildLiquidationTx(props);
  }

  /**
   * Liquidation positions of all queried chains, see
   * {@link LiquidationsService.getLiquidationPositions}.
   **/
  public async getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<MultichainResult<LiquidationPosition[]>> {
    return this.queryChains({
      networks: props.networks,
      label: "get liquidation positions",
      run: sdk => sdk.liquidations.getLiquidationPositions(props),
    });
  }

  /**
   * Loads the liquidators of all queried chains, see
   * {@link LiquidationsService.loadRWALiquidators}.
   **/
  public async loadRWALiquidators(
    props?: LoadRWALiquidatorsProps<true>,
  ): Promise<MultichainResult<void>> {
    return this.runChains({
      networks: props?.networks,
      label: "load RWA liquidators",
      run: sdk => sdk.liquidations.loadRWALiquidators(),
    });
  }
}
