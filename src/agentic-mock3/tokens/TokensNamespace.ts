import type { Address } from "viem";
import { AddressMap } from "../../sdk/index.js";
import type { Mode, SDKContext } from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import { Token, type TokenType } from "./Token.js";
import { TokenCollection } from "./TokenCollection.js";
import type { OnchainTokenMetaData } from "./types.js";

/**
 * Namespace-level registry for tokens, keyed by `(chainId, address)`.
 */
export class TokensNamespace<M extends Mode> extends TokenCollection<M> {
  readonly #registry = new Map<number, AddressMap<Token>>();

  constructor(ctx: SDKContext<Mode>) {
    super(ctx, []);

    const offchainByChain = new Map<number, AddressMap<offchain.TokenRef>>();
    for (const ref of ctx.offchain?.tokens ?? []) {
      let perChain = offchainByChain.get(ref.chainId);
      if (!perChain) {
        perChain = new AddressMap<offchain.TokenRef>();
        offchainByChain.set(ref.chainId, perChain);
      }
      perChain.upsert(ref.address, ref);
    }

    if (ctx.multichain) {
      for (const chain of ctx.multichain.chains.values()) {
        const chainId = chain.chainId;
        const offPerChain = offchainByChain.get(chainId);
        for (const [addr, onMeta] of chain.tokensMeta.entries()) {
          const offRef = offPerChain?.get(addr);
          offPerChain?.delete(addr);
          this.#register(new Token(ctx, offRef, { ...onMeta, chainId }));
        }
      }
    }

    for (const [, offPerChain] of offchainByChain) {
      for (const offRef of offPerChain.values()) {
        this.#register(new Token(ctx, offRef, undefined));
      }
    }
  }

  /**
   * Returns the canonical `Token` for `(address, chainId)`, constructing and
   * caching a new one (with whatever offchain/onchain data is available) on a
   * miss.
   */
  public getOrCreate(address: Address, chainId: number): TokenType<M> {
    const cached = this.#registry.get(chainId)?.get(address);
    if (cached) {
      return cached as unknown as TokenType<M>;
    }

    const offRef = this.ctx.offchain?.tokens.find(
      t => t.chainId === chainId && t.address === address,
    );

    let onMeta: OnchainTokenMetaData | undefined;
    try {
      const chain = this.ctx.multichain?.chain(chainId);
      const raw = chain?.tokensMeta.get(address);
      if (raw) onMeta = { ...raw, chainId };
    } catch {
      // chain not configured in this multichain; leave onMeta undefined
    }

    const token = new Token(this.ctx, offRef, onMeta);
    this.#register(token);
    return token as unknown as TokenType<M>;
  }

  #register(token: Token): void {
    const chainId = token.chainId;
    let perChain = this.#registry.get(chainId);
    if (!perChain) {
      perChain = new AddressMap<Token>();
      this.#registry.set(chainId, perChain);
    }
    if (perChain.has(token.address)) return;
    perChain.upsert(token.address, token);
    this.items.push(token as unknown as TokenType<M>);
  }
}
