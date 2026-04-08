import type { Address } from "abitype";
import { decodeAbiParameters, type Hex } from "viem";
import { iKYCCompressorAbi } from "../../../abi/kyc/iKYCCompressor.js";
import {
  KYC_ON_DEMAND_LP_MONOPOLIZED,
  KYC_UNDERLYING_DEFAULT,
  KYC_UNDERLYING_ON_DEMAND,
  type KYCDefaultTokenMeta,
  type KYCOnDemandLPMeta,
  type KYCOnDemandLPMonopolizedMeta,
  type KYCOnDemandTokenMeta,
  type TokenMetaData,
} from "../../base/index.js";
import { SDKConstruct } from "../../base/SDKConstruct.js";
import { AP_KYC_COMPRESSOR, VERSION_RANGE_310 } from "../../constants/index.js";
import { bytes32ToString } from "../../utils/bytes32ToString.js";
import type {
  KYCCOmpressorCall,
  KYCCompressorResponse,
  KYCFactoryData,
  KYCUnderlyingData,
} from "./types.js";

export class KYCRegister extends SDKConstruct {
  #kycUnderlyingData: KYCUnderlyingData[] = [];
  #kycFactoryData: KYCFactoryData[] = [];

  public getCompressorCall(
    configurators: Address[],
    kycFactories: Address[] = [],
  ): KYCCOmpressorCall[] {
    const [kycCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_KYC_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return kycFactories.length
      ? [
          {
            abi: iKYCCompressorAbi,
            address: kycCompressorAddress,
            functionName: "getKYCMarketsData",
            args: [configurators, kycFactories ?? []],
          },
        ]
      : [];
  }

  public setState(resp?: KYCCompressorResponse): void {
    if (resp) {
      this.#kycUnderlyingData = [...resp[0]];
      this.#kycFactoryData = [...resp[1]];
    }
    for (const u of this.#kycUnderlyingData) {
      this.#loadUnderlyingTokenData(u);
    }
    for (const f of this.#kycFactoryData) {
    }
  }

  #loadUnderlyingTokenData(u: KYCUnderlyingData): void {
    const contractType = bytes32ToString(u.baseParams.contractType);
    // token must be loaded by market compressor first
    const meta = this.tokensMeta.get(u.baseParams.addr);
    if (!meta) {
      throw new Error(
        `KYC underlying token ${contractType} (${u.baseParams.addr}) not found in tokensMeta`,
      );
    }

    switch (contractType) {
      case KYC_UNDERLYING_DEFAULT:
        this.#loadKYCUnderlyingDefault(meta, u);
        break;

      case KYC_UNDERLYING_ON_DEMAND:
        this.#loadKYCUnderlyingOnDemand(meta, u);
        break;
      default:
        if (this.sdk.strictContractTypes) {
          throw new Error(`Unknown KYC underlying type: ${contractType}`);
        }
        this.logger?.warn(`unknown KYC underlying type: ${contractType}`);
    }
  }

  #loadKYCUnderlyingDefault(
    meta: TokenMetaData,
    data: KYCUnderlyingData,
  ): void {
    const decoded = decodeAbiParameters(
      [
        { name: "factory", type: "address" },
        { name: "asset", type: "address" },
      ],
      data.baseParams.serializedParams,
    );
    this.tokensMeta.upsert(data.baseParams.addr, {
      ...meta,
      contractType: KYC_UNDERLYING_DEFAULT,
      kycFactory: decoded[0],
      asset: decoded[1],
    } as KYCDefaultTokenMeta);
  }

  #loadKYCUnderlyingOnDemand(
    meta: TokenMetaData,
    data: KYCUnderlyingData,
  ): void {
    const decoded = decodeAbiParameters(
      [
        { name: "factory", type: "address" },
        { name: "asset", type: "address" },
        { name: "pool", type: "address" },
        { name: "liquidityProvider", type: "address" },
        { name: "marketConfigurator", type: "address" },
        { name: "allowedDepositors", type: "address[]" },
      ],
      data.baseParams.serializedParams,
    );
    const lpMeta = this.#getOnDemandLPMeta(data.extraDetails);

    if (decoded[3] !== lpMeta.addr) {
      throw new Error(
        `Liquidity provider mismatch: ${decoded[3]} !== ${lpMeta.addr} for on-demand underlying ${data.baseParams.addr}`,
      );
    }

    this.tokensMeta.upsert(data.baseParams.addr, {
      ...meta,
      contractType: KYC_UNDERLYING_ON_DEMAND,
      kycFactory: decoded[0],
      asset: decoded[1],
      pool: decoded[2],
      marketConfigurator: decoded[4],
      allowedDepositors: decoded[5],
      // liquidityProvider: decoded[3],
      liquidityProvider: lpMeta,
    } as KYCOnDemandTokenMeta);
  }

  #getOnDemandLPMeta(extraDetails: Hex): KYCOnDemandLPMeta {
    const decoded = decodeAbiParameters(
      // const [lpAddr, version, lpContractTypeHex, lpSerialized] = decodeAbiParameters(
      [
        { name: "addr", type: "address" },
        { name: "version", type: "uint256" },
        { name: "contractType", type: "bytes32" },
        { name: "serializedParams", type: "bytes" },
      ],
      extraDetails,
    );
    const contractType = bytes32ToString(decoded[2]);
    switch (contractType) {
      case KYC_ON_DEMAND_LP_MONOPOLIZED:
        return this.#getOnDemandLPMonopolizedMeta(
          decoded[0],
          decoded[1],
          decoded[3],
        );
      default:
        throw new Error(`Unknown on-demand LP contract type: ${contractType}`);
    }
  }

  #getOnDemandLPMonopolizedMeta(
    addr: Address,
    version: bigint,
    serializedParams: Hex,
  ): KYCOnDemandLPMonopolizedMeta {
    const [marketConfigurator, depositor, pools] = decodeAbiParameters(
      [
        { name: "marketConfigurator", type: "address" },
        { name: "depositor", type: "address" },
        {
          name: "pools",
          type: "tuple[]",
          components: [
            { name: "pool", type: "address" },
            { name: "wrappedUnderlying", type: "address" },
            { name: "unwrappedUnderlying", type: "address" },
            { name: "depositAllowance", type: "uint256" },
            { name: "claimableAmount", type: "uint256" },
          ],
        },
      ],
      serializedParams,
    );
    return {
      addr,
      version,
      contractType: KYC_ON_DEMAND_LP_MONOPOLIZED,
      marketConfigurator,
      depositor,
      pools: [...pools],
    };
  }
}
