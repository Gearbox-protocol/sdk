import type { Mode } from "../core/index.js";
import type { MarketCollectionType } from "./collection.js";
import { MarketCollection } from "./collection.js";

export class MarketsNamespace<M extends Mode> extends MarketCollection<M> {}

export type MarketsNamespaceType<M extends Mode> = MarketCollectionType<M>;
