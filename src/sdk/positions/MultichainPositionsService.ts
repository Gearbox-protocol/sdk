import type { Position, PositionFilter } from "../../model/index.js";
import { isFilterSet } from "../../model/index.js";
import { MultichainConstruct } from "../base/index.js";
import { getNetworkType } from "../chain/chains.js";
import type { NetworkType } from "../chain/index.js";
import type { PluginsMap } from "../plugins/index.js";
import type { MultichainResult } from "../types/index.js";
import type { ListPositionsProps } from "./types.js";

/**
 * Cross-chain counterpart of {@link PositionsService}.
 *
 * Fans out over every chain configured in {@link MultichainSDK}. A chain that
 * fails is logged and skipped so one dead RPC does not hide the positions a
 * wallet holds elsewhere; its failure is reported in
 * {@link MultichainResult.meta}.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainPositionsService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  /**
   * Positions of a wallet on all queried chains, see
   * {@link PositionsService.list}.
   *
   * A filter that names chains narrows the fan-out itself, so chains whose rows
   * would be discarded are never queried and never appear in the meta.
   **/
  public async list(
    props: ListPositionsProps<true>,
  ): Promise<MultichainResult<Position[]>> {
    return this.queryChains({
      networks: this.#networksOf(props.filter),
      label: "list positions",
      run: sdk => sdk.positions.list(props),
    });
  }

  /**
   * Chains named by the filter, or `undefined` to query all of them. Chain ids
   * the SDK does not support are dropped here rather than reported as failures:
   * a filter naming them is a narrowing, not a request.
   **/
  #networksOf(filter?: PositionFilter): NetworkType[] | undefined {
    const chainIds = filter?.chainIds;
    if (!isFilterSet(chainIds)) {
      return undefined;
    }
    const networks: NetworkType[] = [];
    for (const chainId of chainIds) {
      try {
        networks.push(getNetworkType(chainId));
      } catch {
        this.sdk.logger?.debug(
          `ignoring unsupported chain ${chainId} in positions filter`,
        );
      }
    }
    return networks;
  }
}
