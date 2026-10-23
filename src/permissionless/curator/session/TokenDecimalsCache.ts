import {
  type Address,
  type Chain,
  erc20Abi,
  type PublicClient,
  type Transport,
} from "viem";
import type { GipMarketAction } from "../actions/types.js";
import type { Bundle } from "../bundles/Bundle.js";
import type { MarketState } from "../state/market/types.js";
import { lowerAddress, uniqueAddresses } from "../utils/addressUtils.js";

/** Params keys that always hold an ERC-20 address. **/
const TOKEN_PARAM_KEYS = ["token", "underlying"] as const;

/** Every token whose decimals an action or bundle can need while compiling. **/
export function collectActionTokens(
  actions: readonly { params?: unknown }[],
): Address[] {
  const tokens: string[] = [];
  for (const action of actions) {
    const params = action.params;
    if (params === null || typeof params !== "object") continue;
    for (const key of TOKEN_PARAM_KEYS) {
      const value = (params as Record<string, unknown>)[key];
      if (typeof value === "string" && value.startsWith("0x")) {
        tokens.push(value);
      }
    }
  }
  return uniqueAddresses(tokens);
}

export function collectBundleTokens(bundle: Bundle): Address[] {
  return uniqueAddresses([
    ...bundle.tokenIn,
    ...bundle.tokenOut,
    ...collectActionTokens(bundle.actions),
  ]);
}

/** Tokens of a market state: its underlying, assets and treasury balances. **/
export function collectStateTokens(state: MarketState | undefined): Address[] {
  if (!state) return [];
  return uniqueAddresses([
    state.underlyingAsset,
    ...Object.keys(state.assets),
    ...Object.keys(state.treasury.balances),
  ]);
}

/**
 * Resolves and caches ERC-20 decimals for everything the compiler touches.
 *
 * `GipBuilderContext.tokens.decimals` is synchronous, so decimals are prefetched
 * with {@link ensure} before any action processor runs. Lookups come from, in
 * order: caller overrides, an attached/hydrated `OnchainSDK`'s token metadata,
 * then an on-chain `decimals()` read at the SDK's source block.
 **/
export class TokenDecimalsCache {
  readonly #client: PublicClient<Transport, Chain>;
  readonly #cache = new Map<Address, number>();
  readonly #known: () => { decimals(token: Address): number } | undefined;

  constructor(args: {
    /** Pinned read client, so reads stay on the source block. **/
    client: PublicClient<Transport, Chain>;
    /** Explicit metadata overrides; they win over every other source. **/
    overrides?: Record<string, number>;
    /** Token metadata of an attached or hydrated SDK, when there is one. **/
    known?: () => { decimals(token: Address): number } | undefined;
  }) {
    this.#client = args.client;
    this.#known = args.known ?? (() => undefined);
    for (const [token, decimals] of Object.entries(args.overrides ?? {})) {
      this.#cache.set(lowerAddress(token), decimals);
    }
  }

  /** Pre-resolves `tokens`, reading only the ones still unknown. **/
  async ensure(tokens: Iterable<Address>): Promise<void> {
    const known = this.#known();
    const missing: Address[] = [];
    for (const raw of tokens) {
      const token = lowerAddress(raw);
      if (this.#cache.has(token)) continue;
      if (known) {
        try {
          this.#cache.set(token, known.decimals(token));
          continue;
        } catch {
          // not in the registry; fall through to an on-chain read
        }
      }
      if (!missing.includes(token)) missing.push(token);
    }
    if (missing.length === 0) return;
    const results = await this.#client.multicall({
      allowFailure: true,
      contracts: missing.map(address => ({
        address,
        abi: erc20Abi,
        functionName: "decimals" as const,
      })),
    });
    results.forEach((result, index) => {
      if (result.status === "success" && typeof result.result === "number") {
        this.#cache.set(missing[index], result.result);
      }
    });
  }

  /** @throws when the token was never resolved — never guesses 18. **/
  decimals(token: Address): number {
    const cached = this.#cache.get(lowerAddress(token));
    if (cached !== undefined) return cached;
    const known = this.#known();
    if (known) {
      const decimals = known.decimals(token);
      this.#cache.set(lowerAddress(token), decimals);
      return decimals;
    }
    throw new Error(
      `Decimals of ${token} are unknown. Pass them via CuratorSession.create({ tokenDecimals }) ` +
        `or make sure the token is an ERC-20 readable at the source block.`,
    );
  }

  /** Snapshot of everything resolved so far, for plan/preview reporting. **/
  resolved(): Record<Address, number> {
    return Object.fromEntries(this.#cache) as Record<Address, number>;
  }
}

/** Tokens needed to compile `actions` against `state`. **/
export function tokensForCompilation(args: {
  state: MarketState | undefined;
  actions: readonly GipMarketAction[];
  bundles: readonly Bundle[];
}): Address[] {
  return uniqueAddresses([
    ...collectStateTokens(args.state),
    ...collectActionTokens(args.actions),
    ...args.bundles.flatMap(collectBundleTokens),
  ]);
}
