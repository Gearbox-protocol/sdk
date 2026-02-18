import {
  type Address,
  type Chain,
  decodeAbiParameters,
  type Hex,
  type MulticallResponse,
  type PublicClient,
  type Transport,
} from "viem";
import { iStateSerializerAbi } from "../../abi/iStateSerializer.js";
import { iVersionAbi } from "../../abi/iVersion.js";
import {
  bytes32ToString,
  KYC_UNDERLYING_DEFAULT,
  KYC_UNDERLYING_ON_DEMAND,
  type PhantomTokenContractType,
} from "../index.js";
import type { Asset } from "../router/index.js";
import { AddressMap, formatBN } from "../utils/index.js";
import type {
  KYCDefaultTokenMeta,
  KYCOnDemandTokenMeta,
  KYCTokenMeta,
  PhantomTokenMeta,
  TokenMetaData,
} from "./token-types.js";

export interface FormatBNOptions {
  precision?: number;
  symbol?: boolean;
}

export class TokensMeta extends AddressMap<TokenMetaData> {
  #client: PublicClient<Transport, Chain>;
  #tokenDataLoaded: boolean = false;

  constructor(client: PublicClient<Transport, Chain>) {
    super(undefined, "tokensMeta");
    this.#client = client;
  }

  public reset(): void {
    this.clear();
    this.#tokenDataLoaded = false;
  }

  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

  public decimals(token: Address): number {
    return this.mustGet(token).decimals;
  }

  public isPhantomToken(t: TokenMetaData): t is PhantomTokenMeta {
    if (!this.#tokenDataLoaded) {
      throw new Error("extended token data not loaded");
    }
    return "contractType" in t && t.contractType.startsWith("PHANTOM_TOKEN::");
  }

  public isKYCUnderlying(t: TokenMetaData): t is KYCTokenMeta {
    if (!this.#tokenDataLoaded) {
      throw new Error("extended token data not loaded");
    }
    return "contractType" in t && t.contractType.startsWith("KYC_UNDERLYING::");
  }

  /**
   * Returns a map of all phantom tokens
   * Throws if the phantom token data is not loaded
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

  public get kycUnderlyings(): AddressMap<KYCTokenMeta> {
    const result = new AddressMap<KYCTokenMeta>();
    for (const [token, meta] of this.entries()) {
      if (this.isKYCUnderlying(meta)) {
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
   * Loads token information about phantom token and KYC underlying tokens
   */
  public async loadTokenData(): Promise<void> {
    const tokens = this.keys();
    const resp = await this.#client.multicall({
      contracts: tokens.flatMap(
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
    for (let i = 0; i < tokens.length; i++) {
      this.#overrideTokenMeta(tokens[i], resp[i], resp[i + 1]);
    }
    this.#tokenDataLoaded = true;
  }

  #overrideTokenMeta(
    token: Address,
    contractTypeResp: MulticallResponse<Hex>,
    serializeResp: MulticallResponse<Hex>,
  ): void {
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
      } else if (contractType.startsWith("PHANTOM_TOKEN::")) {
        this.upsert(token, {
          ...meta,
          contractType: contractType as PhantomTokenContractType,
        });
      }
    }
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
}
