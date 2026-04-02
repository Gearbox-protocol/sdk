import type { Address, Chain, Hex, PublicClient, Transport } from "viem";
import { iVersionAbi } from "../../abi/iVersion.js";
import type { PhantomTokenContractType } from "../constants/index.js";
import type { Asset } from "../router/index.js";
import {
  AddressMap,
  AddressSet,
  bytes32ToString,
  formatBN,
} from "../utils/index.js";
import type { TokenMetaData } from "./types.js";

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
 * Token metadata enriched with some attributes specific to certain classes of tokens
 **/
export interface TokenMetaDataExtended extends TokenMetaData {
  /**
   * Classification of the phantom token, or `undefined` for normal tokens.
   **/
  phantomTokenType?: PhantomTokenContractType;
}

/**
 * Registry of token metadata (symbol, decimals, phantom type) keyed by address.
 *
 * Extends {@link AddressMap} with convenience accessors for formatting token
 * amounts and looking up tokens by symbol.
 *
 * Provides methods to lazy-load information about certain classes of tokens (e.g. phantom tokens)
 */
export class TokensMeta extends AddressMap<TokenMetaDataExtended> {
  #client: PublicClient<Transport, Chain>;
  #phantomTokensLoaded?: AddressSet;

  constructor(client: PublicClient<Transport, Chain>) {
    super(undefined, "tokensMeta");
    this.#client = client;
  }

  /**
   * Clears all token metadata
   **/
  public reset(): void {
    this.clear();
    this.#phantomTokensLoaded = undefined;
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
   * Returns the phantom token type for a given token, or undefined for normal tokens
   * Throws if the phantom token data is not loaded
   */
  public phantomTokenType(
    token: Address,
  ): PhantomTokenContractType | undefined {
    if (!this.#phantomTokensLoaded?.has(token)) {
      throw new Error("phantom token data not loaded");
    }
    return this.mustGet(token).phantomTokenType;
  }

  /**
   * Returns a map of all phantom tokens
   * Throws if the phantom token data is not loaded
   */
  public get phantomTokens(): AddressMap<TokenMetaDataExtended> {
    if (!this.#phantomTokensLoaded) {
      throw new Error("phantom tokens not loaded");
    }
    return new AddressMap<TokenMetaDataExtended>(
      this.entries().filter(([_, v]) => !!v.phantomTokenType),
      "phantomTokens",
    );
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
   * Loads phantom token data for all known tokens from chain
   */
  public async loadPhantomTokens(): Promise<void> {
    this.#phantomTokensLoaded = new AddressSet();
    const tokens = this.keys();
    const resp = await this.#client.multicall({
      contracts: tokens.map(
        t =>
          ({
            address: t,
            abi: iVersionAbi,
            functionName: "contractType",
          }) as const,
      ),
      allowFailure: true,
      batchSize: 0,
    });
    for (let i = 0; i < resp.length; i++) {
      if (resp[i].status === "success") {
        const contractType = bytes32ToString(resp[i].result as Hex);
        if (contractType.startsWith("PHANTOM_TOKEN::")) {
          this.mustGet(tokens[i]).phantomTokenType =
            contractType as PhantomTokenContractType;
        }
      }
      this.#phantomTokensLoaded.add(tokens[i]);
    }
  }
}
