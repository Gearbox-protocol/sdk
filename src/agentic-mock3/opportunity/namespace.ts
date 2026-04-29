import type { Mode } from "../core/index.js";
import { OpportunityCollection } from "./collection.js";

export class OpportunitiesNamespace<
  M extends Mode,
> extends OpportunityCollection<M> {}
