import {
  type Address,
  type Chain,
  decodeAbiParameters,
  erc20Abi,
  type Hex,
  type MulticallResponse,
  type PublicClient,
  type Transport,
} from "viem";
import { iSecuritizeKYCFactoryAbi } from "../../abi/310/iSecuritizeKYCFactory.js";
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
import {
  type DSTokenMeta,
  KYC_UNDERLYING_DEFAULT,
  KYC_UNDERLYING_ON_DEMAND,
  type KYCDefaultTokenMeta,
  type KYCOnDemandTokenMeta,
  type KYCTokenMeta,
  type PhantomTokenContractType,
  type PhantomTokenMeta,
  type TokenMetaData,
} from "./token-types.js";

export interface FormatBNOptions {
  precision?: number;
  symbol?: boolean;
}

export class TokensMeta extends AddressMap<TokenMetaData> {
  #client: PublicClient<Transport, Chain>;
  #tokenDataLoaded = new AddressSet();
  #logger?: ILogger;

  constructor(client: PublicClient<Transport, Chain>, logger?: ILogger) {
    super(undefined, "tokensMeta");
    this.#client = client;
    this.#logger = logger?.child?.({ name: "TokensMeta" }) ?? logger;
  }

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

  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

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
   * Returns true if the token is a KYC underlying token, throws if the token data is not loaded
   * @param t
   * @returns
   */
  public isKYCUnderlying(t: TokenMetaData): t is KYCTokenMeta {
    if (!this.#tokenDataLoaded.has(t.addr)) {
      throw new Error(
        `extended token data not loaded for ${t.symbol} (${t.addr})`,
      );
    }
    return !!t.contractType?.startsWith("KYC_UNDERLYING::");
  }

  /**
   * Returns true if the token is a DSToken, throws if the token data is not loaded
   * @param t
   * @returns
   */
  public isDSToken(t: TokenMetaData): t is DSTokenMeta {
    if (!this.#tokenDataLoaded.has(t.addr)) {
      throw new Error(
        `extended token data not loaded for ${t.symbol} (${t.addr})`,
      );
    }
    return !!t.isDSToken;
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
   * Returns a map of all KYC underlying tokens
   * Throws if token data is not loaded
   */
  public get kycUnderlyings(): AddressMap<KYCTokenMeta> {
    const result = new AddressMap<KYCTokenMeta>();
    for (const [token, meta] of this.entries()) {
      if (this.isKYCUnderlying(meta)) {
        result.upsert(token, meta);
      }
    }
    return result;
  }

  public get dsTokens(): AddressMap<DSTokenMeta> {
    const result = new AddressMap<DSTokenMeta>();
    for (const [token, meta] of this.entries()) {
      if (this.isDSToken(meta)) {
        result.upsert(token, meta);
      }
    }
    return result;
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
   * Loads token information about phantom tokens, KYC underlying tokens and DSTokens
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

    const kycFactories = new AddressSet();
    for (let i = 0; i < tokensToLoad.length; i++) {
      const meta = this.#overrideTokenMeta(
        tokensToLoad[i],
        resp[2 * i],
        resp[2 * i + 1],
      );
      this.#tokenDataLoaded.add(tokensToLoad[i]);
      if (this.isKYCUnderlying(meta)) {
        kycFactories.add(meta.kycFactory);
      }
    }
    this.#logger?.debug(`found ${kycFactories.size} KYC factories`);
    await this.#loadDSTokens(kycFactories);
  }

  #overrideTokenMeta(
    token: Address,
    contractTypeResp: MulticallResponse<Hex>,
    serializeResp: MulticallResponse<Hex>,
  ): TokenMetaData {
    const meta = this.mustGet(token);
    if (contractTypeResp.status === "success") {
      const contractType = bytes32ToString(contractTypeResp.result);
      if (contractType.startsWith("KYC_UNDERLYING::")) {
        if (serializeResp.status === "success") {
          this.#overrideKYCUnderlying(meta, contractType, serializeResp.result);
        } else {
          throw new Error(
            `token ${meta.symbol} (${token}) is ${contractType} but serialize failed: ${serializeResp.error}`,
          );
        }
      } else {
        this.upsert(token, {
          ...meta,
          contractType,
        });
      }
      this.#logger?.debug(`token ${meta.symbol} is ${contractType}`);
    }
    return this.mustGet(token);
  }

  #overrideKYCUnderlying(
    meta: TokenMetaData,
    contractType: string,
    serialized: Hex,
  ): void {
    if (contractType === KYC_UNDERLYING_DEFAULT) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "kycFactory" },
          { type: "address", name: "asset" },
        ],
        serialized,
      );
      this.upsert(meta.addr, {
        ...meta,
        contractType,
        kycFactory: decoded[0],
        asset: decoded[1],
      } as KYCDefaultTokenMeta);
    } else if (contractType === KYC_UNDERLYING_ON_DEMAND) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "kycFactory" },
          { type: "address", name: "asset" },
          { type: "address", name: "pool" },
          { type: "address", name: "liquidityProvider" },
        ],
        serialized,
      );
      this.upsert(meta.addr, {
        ...meta,
        contractType,
        kycFactory: decoded[0],
        asset: decoded[1],
        pool: decoded[2],
        liquidityProvider: decoded[3],
      } as KYCOnDemandTokenMeta);
    }
  }

  async #loadDSTokens(kycFactories: AddressSet): Promise<void> {
    const resp = await this.#client.multicall({
      contracts: kycFactories.map(address => ({
        address,
        abi: iSecuritizeKYCFactoryAbi,
        functionName: "getDSTokens",
      })),
      allowFailure: false,
      batchSize: 0,
    });
    const dsToken = new AddressSet(resp.flat() as Address[]);
    // if token does not exist in tokensMeta, load symbol, name, decimals
    const tokensToLoad = dsToken.difference(new Set(this.keys()));
    this.#logger?.debug(
      `found ${dsToken.size} DSTokens in KYC factories, need to load ${tokensToLoad.size} basic metadata`,
    );
    await this.#loadWithoutCompressor(tokensToLoad);
    for (const token of dsToken) {
      const meta = this.mustGet(token);
      this.upsert(token, {
        ...meta,
        isDSToken: true,
      });
      this.#tokenDataLoaded.add(token);
      this.#logger?.debug(`token ${meta.symbol} (${token}) is a DSToken`);
    }
  }

  async #loadWithoutCompressor(tokens_: Set<Address>): Promise<void> {
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
