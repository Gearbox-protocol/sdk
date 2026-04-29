import type { Mode, SDKContext } from "../core/index.js";
import { Curator } from "./Curator.js";
import { CuratorCollection } from "./CuratorCollection.js";

export class CuratorsNamespace extends CuratorCollection {
  constructor(ctx: SDKContext<Mode>) {
    const items: Curator[] = [];
    for (const data of ctx.offchain?.curators ?? []) {
      items.push(new Curator(ctx, data));
    }
    super(ctx, items);
  }
}
