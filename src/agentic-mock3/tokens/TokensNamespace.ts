import { AddressMap } from "../../sdk/index.js";
import type { Mode, SDKContext } from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import { Token, type TokenType } from "./Token.js";
import { TokenCollection } from "./TokenCollection.js";
import type { OnchainTokenMetaData } from "./types.js";

export class TokensNamespace<M extends Mode> extends TokenCollection<M> {
  constructor(ctx: SDKContext) {
    super(ctx, []);

    const offchain = new AddressMap<offchain.TokenRef>(
      ctx.offchain?.tokens.map(t => [t.address, t]),
    );

    const onchain = new AddressMap<OnchainTokenMetaData>();
    if (ctx.multichain) {
      for (const chain of ctx.multichain.chains.values()) {
        for (const m of chain.tokensMeta.values()) {
          onchain.upsert(m.addr, { ...m, chainId: chain.chainId });
        }
      }
    }

    for (const t of onchain.values()) {
      const offchainToken = offchain.get(t.addr);
      offchain.delete(t.addr);
      this.items.push(
        new Token(ctx, offchainToken, t) as unknown as TokenType<M>,
      );
    }
  }
}
