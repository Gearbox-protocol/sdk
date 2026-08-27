import type { DataResponse, Position } from "../../model/index.js";
import { MultichainConstruct } from "../base/index.js";
import type { PluginsMap } from "../plugins/index.js";
import type {
  IMultichainPositionsService,
  ListPositionsProps,
} from "./types.js";

/**
 * Cross-chain counterpart of {@link PositionsService}.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainPositionsService<const Plugins extends PluginsMap = {}>
  extends MultichainConstruct<Plugins>
  implements IMultichainPositionsService
{
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
