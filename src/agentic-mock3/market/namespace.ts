import type { Mode, SDKContext } from "../core/index.js";
import type { MarketCollectionType } from "./collection.js";
import { MarketCollection } from "./collection.js";

export class MarketsNamespace<M extends Mode> extends MarketCollection<M> {
  constructor(ctx: SDKContext<Mode>) {
    super(ctx, []);
  }
}

export type MarketsNamespaceType<M extends Mode> = MarketCollectionType<M>;
