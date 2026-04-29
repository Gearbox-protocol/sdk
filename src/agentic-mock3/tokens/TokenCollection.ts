import { chains, type NetworkType } from "../../sdk/index.js";
import type { Caps, IBaseCollection, Mode } from "../core/index.js";
import { BaseCollection } from "../core/index.js";
import type { Token, TokenType } from "./Token.js";
import type { OffchainTokenCaps } from "./types.js";

// ============================================================================
// Public types
// ============================================================================

export interface TokenCollectionBase<M extends Mode>
  extends IBaseCollection<TokenType<M>, TokenCollectionType<M>> {
  withChainIds(...chainIds: number[]): TokenCollectionType<M>;
  withNetworks(...networks: NetworkType[]): TokenCollectionType<M>;
  withSymbolLike(symbol: string | RegExp): TokenCollectionType<M>;
}

export type TokenCollectionType<M extends Mode> = TokenCollectionBase<M> &
  Caps<M, "TokenCollection">;

// ============================================================================
// Implementation
// ============================================================================

export class TokenCollection<M extends Mode> extends BaseCollection<
  TokenType<M>,
  M
> {
  // ============================================================================
  // Common
  // ============================================================================
  public withChainIds(...chainIds: number[]): TokenCollection<M> {
    return new TokenCollection<M>(
      this.ctx,
      this.items.filter(t => chainIds.includes(t.chainId)),
    );
  }

  public withNetworks(...networks: NetworkType[]): TokenCollection<M> {
    const chainIds = networks.map(n => chains[n].id);
    return this.withChainIds(...chainIds);
  }

  public withSymbolLike(symbol: string | RegExp): TokenCollection<M> {
    return new TokenCollection<M>(
      this.ctx,
      this.items.filter(t =>
        typeof symbol === "string"
          ? t.symbol.includes(symbol)
          : symbol.test(t.symbol),
      ),
    );
  }

  // ============================================================================
  // Offchain
  // ============================================================================

  public withTokenTypes(
    ...tokenTypes: Array<OffchainTokenCaps["tokenType"]>
  ): TokenCollection<M> {
    return new TokenCollection<M>(
      this.ctx,
      this.items.filter(t =>
        tokenTypes.includes((t as unknown as Token).tokenType),
      ),
    );
  }

  public withTickerLike(ticker: string | RegExp): TokenCollection<M> {
    return new TokenCollection<M>(
      this.ctx,
      this.items.filter(i => {
        const t = i as unknown as Token;
        return typeof ticker === "string"
          ? t.ticker.includes(ticker)
          : ticker.test(t.ticker);
      }),
    );
  }

  protected wrap(items: TokenType<M>[]): this {
    return new TokenCollection<M>(this.ctx, items) as this;
  }
}
