import {
  type Address,
  type Chain,
  erc20Abi,
  type Hex,
  type MulticallResponse,
  type PublicClient,
  type Transport,
} from "viem";
import { iStateSerializerAbi } from "../../abi/iStateSerializer.js";
import { iVersionAbi } from "../../abi/iVersion.js";
import type { Asset } from "../router/index.js";
import type { ILogger } from "../types/logger.js";
import {
  AddressMap,
  AddressSet,
  bytes32ToString,
  formatBN,
} from "../utils/index.js";
import type { PhantomTokenMeta, TokenMetaData } from "./token-types.js";

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
        `extended token data not loaded for ${t.symbol} (${t.addr})`,
      );
    }
    return !!t.contractType?.startsWith("PHANTOM_TOKEN::");
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
   * Loads token information about phantom tokens
   * Other special tokens may be loaded here in the future
   *
   * @param tokens - tokens to load data for, defaults to all tokens
   */
  public async loadTokenData(...tokens: Address[]): Promise<void> {
    const tokenz = new AddressSet(tokens.length > 0 ? tokens : this.keys());
    const tokensToLoad = Array.from(tokenz.difference(this.#tokenDataLoaded));
    if (tokensToLoad.length === 0) {
      return;
    }

    const resp = await this.#client.multicall({
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
          ] as const,
      ),
      allowFailure: true,
      batchSize: 0,
    });

    this.#logger?.debug(`loaded ${resp.length} contract types`);

    for (let i = 0; i < tokensToLoad.length; i++) {
      this.#overrideTokenMeta(tokensToLoad[i], resp[2 * i], resp[2 * i + 1]);
      this.#tokenDataLoaded.add(tokensToLoad[i]);
    }
  }

  #overrideTokenMeta(
    token: Address,
    contractTypeResp: MulticallResponse<Hex>,
    _serializeResp: MulticallResponse<Hex>,
  ): TokenMetaData {
    const meta = this.mustGet(token);
    if (contractTypeResp.status === "success") {
      const contractType = bytes32ToString(contractTypeResp.result);
      this.upsert(token, {
        ...meta,
        contractType,
      });
      this.#logger?.debug(`token ${meta.symbol} is ${contractType}`);
    }
    return this.mustGet(token);
  }

  async #loadWithoutCompressor(tokens_: AddressSet): Promise<void> {
    if (tokens_.size === 0) {
      return;
    }
    const tokens = Array.from(tokens_);
    const resp = await this.#client.multicall({
      contracts: tokens.flatMap(
        t =>
          [
            {
              address: t,
              abi: erc20Abi,
              functionName: "symbol",
            },
            {
              address: t,
              abi: erc20Abi,
              functionName: "name",
            },
            {
              address: t,
              abi: erc20Abi,
              functionName: "decimals",
            },
          ] as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    this.#logger?.debug(
      `loaded ${resp.length} basic metadata without compressor`,
    );
    for (let i = 0; i < tokens.length; i++) {
      this.upsert(tokens[i], {
        addr: tokens[i],
        symbol: resp[3 * i] as string,
        name: resp[3 * i + 1] as string,
        decimals: resp[3 * i + 2] as number,
      });
    }
  }
}
