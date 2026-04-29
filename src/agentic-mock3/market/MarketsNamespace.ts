import type { Mode, SDKContext } from "../core/index.js";
import { Market, type MarketType } from "./Market.js";
import {
  MarketCollection,
  type MarketCollectionType,
} from "./MarketCollection.js";

export type MarketsNamespaceType<M extends Mode> = MarketCollectionType<M>;

export class MarketsNamespace<M extends Mode> extends MarketCollection<M> {
  constructor(ctx: SDKContext<Mode>) {
    const items: MarketType<M>[] = [];
    if (ctx.multichain) {
      for (const chain of ctx.multichain.chains.values()) {
        const network = chain.networkType;
        const chainId = chain.chainId;
        for (const suite of chain.marketRegister.markets) {
          const market = new Market(ctx, network, chainId, suite, undefined);
          items.push(market as unknown as MarketType<M>);
        }
      }
    }
    super(ctx, items);
  }
}
