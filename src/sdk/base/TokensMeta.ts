import type {
  Address,
  Chain,
  Hex,
  MulticallResponse,
  PublicClient,
  Transport,
} from "viem";
import { iExpirableAbi } from "../../abi/iExpirable.js";
import { iStateSerializerAbi } from "../../abi/iStateSerializer.js";
import { iVersionAbi } from "../../abi/iVersion.js";
import type { Token } from "../../model/primitives.js";
import { getAssetType } from "../chain/chains.js";
import type { GearboxChain, NetworkType } from "../chain/index.js";
import type { ILogger } from "../types/logger.js";
import {
  AddressMap,
  AddressSet,
  bytes32ToString,
  formatBN,
} from "../utils/index.js";
import type { MulticallBatch } from "../utils/viem/executeMulticallBatches.js";
import { executeMulticallBatches } from "../utils/viem/executeMulticallBatches.js";
import type {
  PhantomTokenMeta,
  RWATokenMeta,
  TokenMetaData,
} from "./token-types.js";
import type { Asset } from "./types.js";

/**
 * Options for {@link TokensMeta.formatBN}.
 **/
export interface FormatBNOptions {
  /**
   * Number of decimal places in the formatted output.
   **/
  precision?: number;
  /**
   * When `true`, appends the token symbol to the formatted string.
   **/
  symbol?: boolean;
}

/**
 * Serializable snapshot of the token metadata registry.
 **/
export interface TokensMetaState {
  /**
   * Metadata of all known tokens.
   **/
  tokens: TokenMetaData[];
  /**
   * Tokens whose extended data (`contractType`, `serialize()`) was loaded,
   * so that the loaded/not-loaded distinction round-trips through hydration.
   **/
  extendedLoaded: Address[];
}

/**
 * Registry of token metadata (symbol, decimals, phantom type) keyed by address.
 *
 * Extends {@link AddressMap} with convenience accessors for formatting token
 * amounts and looking up tokens by symbol.
 *
 * Provides methods to lazy-load information about certain classes of tokens (e.g. phantom tokens)
 */
export class TokensMeta extends AddressMap<TokenMetaData> {
  #client: PublicClient<Transport, Chain>;
  #tokenDataLoaded = new AddressSet();
  #logger?: ILogger;

  constructor(client: PublicClient<Transport, Chain>, logger?: ILogger) {
    super(undefined, "tokensMeta");
    this.#client = client;
    this.#logger = logger?.child?.({ name: "TokensMeta" }) ?? logger;
  }

  /**
   * Clears all token metadata
   **/
  public reset(): void {
    this.clear();
    this.#tokenDataLoaded.clear();
  }

  public override upsert(
    address: string,
    value: TokenMetaData | undefined,
  ): void {
    let v = value;
    const existing = this.get(address);
    // update existing value with new one
    // is needed since some methods here augment existing values, to prevent losing this on market reload
    if (existing && v) {
      v = {
        ...existing,
        ...v,
      };
    }
    super.upsert(address, v);
  }

  /**
   * Returns the symbol string for a token.
   * @param token - Token address.
   * @throws If the token is not in the registry.
   */
  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

  /**
   * Returns the decimal count for a token.
   * @param token - Token address.
   * @throws If the token is not in the registry.
   */
  public decimals(token: Address): number {
    return this.mustGet(token).decimals;
  }

  /**
   * Returns true if the token is a phantom token, throws if the token data is not loaded
   * @param t
   * @returns
   */
  public isPhantomToken(t: TokenMetaData): t is PhantomTokenMeta {
    if (!this.#tokenDataLoaded.has(t.addr)) {
      throw new Error(
        `extended token data not loaded for ${t.symbol} (${t.addr}), check if the sdk was properly attached or hydrated`,
      );
    }
    return !!t.contractType?.startsWith("PHANTOM_TOKEN::");
  }

  /**
   * Returns true if the token is a RWA underlying token, throws if the token data is not loaded
   * @param t
   * @returns
   */
  public isRWAUnderlying(t: TokenMetaData): t is RWATokenMeta {
    return !!t.contractType?.startsWith("RWA_UNDERLYING::");
  }

  /**
   * Returns a map of all phantom tokens
   * Throws if token data is not loaded
   */
  public get phantomTokens(): AddressMap<PhantomTokenMeta> {
    const result = new AddressMap<PhantomTokenMeta>();
    for (const [token, meta] of this.entries()) {
      if (this.isPhantomToken(meta)) {
        result.upsert(token, meta);
      }
    }
    return result;
  }

  /**
   * Returns a map of all RWA underlying tokens
   * Throws if token data is not loaded
   */
  public get rwaUnderlyings(): AddressMap<RWATokenMeta> {
    const result = new AddressMap<RWATokenMeta>();
    for (const [token, meta] of this.entries()) {
      if (this.isRWAUnderlying(meta)) {
        result.upsert(token, meta);
      }
    }
    return result;
  }

  /**
   * Describes a token the way the shared read model does.
   *
   * @param address - Token address.
   * @throws If the token is not in the registry.
   */
  public mustGetToken(address: Address): Token {
    const meta = this.mustGet(address);
    return {
      chainId: this.#client.chain.id,
      address: meta.addr,
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
      // the table only holds underlyings, so collateral tokens stay
      // unclassified
      assetType: getAssetType(meta.addr, this.#networkType),
    };
  }

  /**
   * Like {@link mustGetToken}, but returns `undefined` instead of throwing when the
   * token is not in the registry.
   *
   * @param address - Token address.
   */
  public getToken(address: Address): Token | undefined {
    return this.get(address) ? this.mustGetToken(address) : undefined;
  }

  /**
   * The token an RWA wrapper holds, or the token itself when it is not one.
   *
   * An RWA market borrows a compliance wrapper (e.g. `dcUSDC`) that converts
   * one-for-one with the token behind it (`USDC`), and only that token means
   * anything to a reader. Pricing still goes through the wrapper, which is what
   * a market's oracle knows.
   *
   * @param token - Token address, wrapper or not.
   */
  public unwrapRWA(token: Address): Address {
    const meta = this.get(token);
    if (!meta || !this.isRWAUnderlying(meta)) {
      return token;
    }
    if (!this.has(meta.asset)) {
      this.#logger?.debug(
        `no token meta for ${meta.asset} wrapped by ${token}, reporting the wrapper instead`,
      );
      return token;
    }
    return meta.asset;
  }

  get #networkType(): NetworkType {
    const { chain } = this.#client;
    if ("network" in chain) {
      return (chain as GearboxChain).network;
    }
    throw new Error(`chain ${chain.id} is not a Gearbox SDK chain`);
  }

  /**
   * Formats a raw token amount into a human-readable decimal string,
   * dividing by `10^decimals` for the token.
   *
   * Accepts either an {@link Asset} object or a separate `(token, amount)` pair.
   *
   * @param asset - Asset object containing `token` address and `balance`.
   * @param options - Formatting options.
   */
  public formatBN(asset: Asset, options?: FormatBNOptions): string;
  /**
   * @param token - Token address.
   * @param amount - Raw amount (in smallest unit).
   * @param options - Formatting options.
   */
  public formatBN(
    token: Address,
    amount: number | bigint | string | undefined,
    options?: FormatBNOptions,
  ): string;
  public formatBN(
    arg0: Asset | Address,
    arg1: number | bigint | string | FormatBNOptions | undefined,
    arg2?: FormatBNOptions,
  ): string {
    const token = typeof arg0 === "object" ? arg0.token : arg0;
    const amount =
      typeof arg0 === "object"
        ? arg0.balance
        : (arg1 as number | bigint | string | undefined);
    const options =
      typeof arg0 === "object" ? (arg1 as FormatBNOptions | undefined) : arg2;
    const { precision, symbol } = options ?? {};
    const asStr = formatBN(amount, this.decimals(token), precision);
    return symbol ? `${asStr} ${this.symbol(token)}` : asStr;
  }

  /**
   * Finds a token by its symbol (e.g. `"USDC"`).
   * @param symbol - Case-sensitive ticker symbol.
   * @returns The matching metadata, or `undefined` if no token has this symbol.
   */
  public findBySymbol(symbol: string): TokenMetaData | undefined {
    return this.values().find(v => v.symbol === symbol);
  }

  /**
   * Finds a token by its symbol, throwing if not found.
   * @param symbol - Case-sensitive ticker symbol.
   * @throws If no token matches the symbol.
   */
  public mustFindBySymbol(symbol: string): TokenMetaData {
    const meta = this.findBySymbol(symbol);
    if (!meta) {
      throw new Error(`cannot find token meta for symbol '${symbol}'`);
    }
    return meta;
  }

  /**
   * @internal
   *
   * Returns the multicall batch that loads extended token data (`contractType`
   * and `serialize()`) for the tokens that do not have it yet. Used by the SDK
   * to warm this cache together with other loaders in a single multicall.
   *
   * @param tokens - tokens to load data for, defaults to all tokens
   **/
  public getLoadTokenDataMulticall(...tokens: Address[]): MulticallBatch {
    const tokenz = new AddressSet(tokens.length > 0 ? tokens : this.keys());
    const tokensToLoad = Array.from(tokenz.difference(this.#tokenDataLoaded));
    return {
      contracts: tokensToLoad.flatMap(
        t =>
          [
            {
              address: t,
              abi: iVersionAbi,
              functionName: "contractType",
            },
            {
              address: t,
              abi: iStateSerializerAbi,
              functionName: "serialize",
            },
            {
              address: t,
              abi: iExpirableAbi,
              functionName: "isExpired",
            },
          ] as const,
      ),
      onResults: resps => {
        this.#logger?.debug(`loaded data of ${tokensToLoad.length} tokens`);
        for (let i = 0; i < tokensToLoad.length; i++) {
          this.#overrideTokenMeta(
            tokensToLoad[i],
            resps[3 * i] as MulticallResponse<Hex>,
            resps[3 * i + 1] as MulticallResponse<Hex>,
            resps[3 * i + 2] as MulticallResponse<boolean>,
          );
          this.#tokenDataLoaded.add(tokensToLoad[i]);
        }
      },
    };
  }

  /**
   * Loads token information about phantom tokens
   * In future other custom tokens types that do not have compressors might be handled here
   *
   * Tokens loaded during SDK attach or restored by {@link hydrate} are skipped,
   * so calling this after either is a no-op.
   *
   * @param tokens - tokens to load data for, defaults to all tokens
   */
  public async loadTokenData(...tokens: Address[]): Promise<void> {
    await executeMulticallBatches(this.#client, [
      this.getLoadTokenDataMulticall(...tokens),
    ]);
  }

  /**
   * Serializable snapshot of all token metadata, suitable for hydration.
   **/
  public get state(): TokensMetaState {
    return {
      tokens: this.values(),
      extendedLoaded: this.#tokenDataLoaded.asArray(),
    };
  }

  /**
   * Restores token metadata from a previously serialized snapshot,
   * bypassing on-chain reads.
   *
   * Entries are merged into the ones already registered by markets, zappers and
   * the RWA registry (see {@link upsert}), so the snapshot must be applied last
   * for its augmented fields to win.
   *
   * @param state - Token metadata snapshot.
   **/
  public hydrate(state: TokensMetaState): void {
    for (const token of state.tokens) {
      this.upsert(token.addr, token);
    }
    for (const token of state.extendedLoaded) {
      this.#tokenDataLoaded.add(token);
    }
  }

  #overrideTokenMeta(
    token: Address,
    contractTypeResp: MulticallResponse<Hex>,
    serializeResp: MulticallResponse<Hex>,
    isExpiredResp: MulticallResponse<boolean>,
  ): TokenMetaData {
    const meta = this.mustGet(token);
    const update: TokenMetaData = { ...meta };
    if (contractTypeResp.status === "success") {
      const contractType = bytes32ToString(contractTypeResp.result);
      update.contractType = contractType;
      update.serializedParams =
        serializeResp.status === "success" ? serializeResp.result : undefined;
      this.#logger?.debug(`token ${meta.symbol} is ${contractType}`);
    }
    // only expirable tokens (e.g. Pendle PTs) implement isExpired()
    if (isExpiredResp.status === "success") {
      update.isExpired = isExpiredResp.result;
      this.#logger?.debug(
        `token ${meta.symbol} is expirable, expired: ${isExpiredResp.result}`,
      );
    }
    if (
      contractTypeResp.status === "success" ||
      isExpiredResp.status === "success"
    ) {
      this.upsert(token, update);
    }
    return this.mustGet(token);
  }
}
