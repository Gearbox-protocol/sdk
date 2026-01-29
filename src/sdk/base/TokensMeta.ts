import type { Address, Chain, Hex, PublicClient, Transport } from "viem";
import { iVersionAbi } from "../../abi/iVersion.js";
import { bytes32ToString, type PhantomTokenContractType } from "../index.js";
import type { Asset } from "../router/index.js";
import { AddressMap, AddressSet, formatBN } from "../utils/index.js";
import type { TokenMetaData } from "./types.js";

export interface FormatBNOptions {
  precision?: number;
  symbol?: boolean;
}

export interface TokenMetaDataExtended extends TokenMetaData {
  /**
   * Undefined if token is not a phantom token
   */
  phantomTokenType?: PhantomTokenContractType;
}

export class TokensMeta extends AddressMap<TokenMetaDataExtended> {
  #client: PublicClient<Transport, Chain>;
  #phantomTokensLoaded?: AddressSet;

  constructor(client: PublicClient<Transport, Chain>) {
    super(undefined, "tokensMeta");
    this.#client = client;
  }

  public reset(): void {
    this.clear();
    this.#phantomTokensLoaded = undefined;
  }

  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

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

  public formatBN(asset: Asset, options?: FormatBNOptions): string;
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

  public findBySymbol(symbol: string): TokenMetaData | undefined {
    return this.values().find(v => v.symbol === symbol);
  }

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
