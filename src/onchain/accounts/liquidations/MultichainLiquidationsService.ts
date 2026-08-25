import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../../model/index.js";
import { MultichainConstruct } from "../../base/index.js";
import type { PluginsMap } from "../../plugins/index.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  LoadRWALiquidatorsProps,
} from "./types.js";

/**
 * Cross-chain counterpart of {@link LiquidationsService}. These reads are live,
 * so each chain is pinned to its own freshly fetched head.
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
  ): Promise<DataResponse<LiquidatableAccount[]>> {
    return this.queryChains({
      chainIds: props?.chainIds,
      label: "get liquidatable accounts",
      block: "latest",
      run: (sdk, block) =>
        sdk.liquidations.getLiquidatableAccounts({
          ...props,
          blockNumber: block.blockNumber,
        }),
    });
  }

  /**
   * {@inheritDoc LiquidationsService.getLiquidationDetails}
   *
   * Throws when the chain cannot answer.
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps<true>,
  ): Promise<DataResponse<LiquidationDetails>> {
    return this.queryChain({
      network: props.network,
      // a caller that pinned the read keeps its own height, and metadata
      // reports that block rather than a newer one
      block: props.blockNumber ?? "latest",
      run: (sdk, block) =>
        sdk.liquidations.getLiquidationDetails({
          ...props,
          blockNumber: block.blockNumber,
        }),
    });
  }

  /**
   * {@inheritDoc LiquidationsService.buildLiquidationTx}
   *
   * The reported block is the one the transaction was built against.
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps<true>,
  ): Promise<DataResponse<TxCall>> {
    return this.queryChain({
      network: props.network,
      block: props.blockNumber ?? "latest",
      run: (sdk, block) =>
        sdk.liquidations.buildLiquidationTx({
          ...props,
          blockNumber: block.blockNumber,
        }),
    });
  }

  /**
   * Liquidation positions of all queried chains, see
   * {@link LiquidationsService.getLiquidationPositions}.
   **/
  public async getLiquidationPositions(
    props: GetLiquidationPositionsProps<true>,
  ): Promise<DataResponse<LiquidationPosition[]>> {
    return this.queryChains({
      chainIds: props.chainIds,
      label: "get liquidation positions",
      block: "latest",
      run: (sdk, block) =>
        sdk.liquidations.getLiquidationPositions({
          ...props,
          blockNumber: block.blockNumber,
        }),
    });
  }

  /**
   * Loads the liquidators of all queried chains, see
   * {@link LiquidationsService.loadRWALiquidators}.
   *
   * Nothing consumes the block of a cache warm-up, so this one is left on the
   * loaded snapshot.
   **/
  public async loadRWALiquidators(
    props?: LoadRWALiquidatorsProps<true>,
  ): Promise<DataResponse<void>> {
    return this.runChains({
      chainIds: props?.chainIds,
      label: "load RWA liquidators",
      run: sdk => sdk.liquidations.loadRWALiquidators(),
    });
  }
}
