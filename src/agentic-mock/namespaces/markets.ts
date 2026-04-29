import type { Address, Mode, NetworkType } from "../core/index.js";
import type { Market, MarketImpl } from "../entities/index.js";

export interface MarketFilter {
  network?: NetworkType;
  networks?: NetworkType[];
  underlying?: Address;
}

export interface MarketsNamespace<M extends Mode> {
  find(filter?: MarketFilter): Market<M>[];
  get(network: NetworkType, configurator: Address): Market<M> | undefined;
}

export class MarketsNamespaceImpl<M extends Mode>
  implements MarketsNamespace<M>
{
  readonly #markets: MarketImpl[];

  constructor(markets: MarketImpl[]) {
    this.#markets = markets;
  }

  find(filter?: MarketFilter): Market<M>[] {
    let result = this.#markets as unknown as Market<M>[];
    if (!filter) return result;

    if (filter.networks) {
      result = result.filter(m => filter.networks!.includes(m.network));
    }
    if (filter.network) {
      result = result.filter(m => m.network === filter.network);
    }
    if (filter.underlying) {
      result = result.filter(m => m.underlying === filter.underlying);
    }
    return result;
  }

  get(network: NetworkType, configurator: Address): Market<M> | undefined {
    return this.#markets.find(
      m => m.network === network && m.configurator === configurator,
    ) as unknown as Market<M> | undefined;
  }
}
