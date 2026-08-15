import type { DataResponse, Position } from "../../model/index.js";
import { MultichainConstruct } from "../base/index.js";
import type { PluginsMap } from "../plugins/index.js";
import type { ListPositionsProps } from "./types.js";

/**
 * Cross-chain counterpart of {@link PositionsService}.
 *
 * Fans out over every chain configured in {@link MultichainSDK}. A chain that
 * fails is logged and skipped so one dead RPC does not hide the positions a
 * wallet holds elsewhere; its failure is reported in `meta.chains`.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainPositionsService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  /**
   * Positions of a wallet on all queried chains, see
   * {@link PositionsService.list}.
   **/
  public async list(
    props: ListPositionsProps<true>,
  ): Promise<DataResponse<Position[]>> {
    return this.queryChains({
      chainIds: props.filter?.chainIds,
      label: "list positions",
      block: "latest",
      run: (sdk, block) =>
        sdk.positions.list({ ...props, blockNumber: block.blockNumber }),
    });
  }
}
