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
  SDKConstruct,
  type TokenMetaData,
} from "../../base/index.js";
import { AP_KYC_COMPRESSOR, VERSION_RANGE_310 } from "../../constants/index.js";
import { AddressMap, bytes32ToString } from "../../utils/index.js";
import type { DelegatedMulticall } from "../../utils/viem/index.js";
import {
  KYC_FACTORY_SECURITIZE,
  SecuritizeKYCFactory,
} from "./securitize/index.js";
import type {
  InvestorData,
  KYCCompressorResponse,
  KYCFactoryData,
  KYCState,
  KYCStateHuman,
  KYCUnderlyingData,
} from "./types.js";

/**
 * Registry of KYC underlying tokens and KYC factory contracts.
 *
 * Populated from the on-chain {@link https://github.com/Gearbox-protocol/periphery-v3 KYCCompressor}
 * during SDK attach/hydrate. Provides methods to query investor-level data and
 * to resolve KYC factory instances by address.
 **/
export class KYCRegistry extends SDKConstruct {
  #state?: KYCState;
  #factories = new AddressMap<SecuritizeKYCFactory>();

  /**
   * @internal
   *
   * Returns delegated multicalls for loading all KYC underlying tokens from the on-chain KYC compressor.
   * Used by the SDK to compose batched RPC calls.
   *
   * @param configurators - Market configurators to query.
   * @param kycFactories - KYC factory contracts to query.
   */
  public getLoadMulticalls(
    configurators: Address[],
    kycFactories: Address[] = [],
  ): DelegatedMulticall[] {
    if (!kycFactories.length) return [];
    const [kycCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_KYC_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return [
      {
        call: {
          abi: iKYCCompressorAbi,
          address: kycCompressorAddress,
          functionName: "getKYCMarketsData",
          args: [configurators, kycFactories],
        },
        onResult: (resp: unknown) =>
          this.setState(resp as KYCCompressorResponse),
      },
    ];
  }

  /**
   * Fetches decoded investor data from the on-chain KYC compressor.
   *
   * Each factory produces its own investor data (e.g. registered tokens,
   * cached signatures, EIP-712 messages to sign).
   *
   * @param investor - Investor EOA address.
   * @param factories_ - Optional subset of factory addresses to query.
   *   When omitted, all loaded factories are used.
   */
  public async getInvestorData(
    investor: Address,
    factories_?: Address[],
  ): Promise<InvestorData[]> {
    const [kycCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_KYC_COMPRESSOR,
      VERSION_RANGE_310,
    );
    let factories = this.#factories.values();
    if (factories_?.length) {
      factories = factories_.map(f => this.#factories.mustGet(f));
    }
    const resp = await this.client.readContract({
      abi: iKYCCompressorAbi,
      address: kycCompressorAddress,
      functionName: "getKYCInvestorData",
      args: [investor, factories.map(f => f.address)],
    });
    const result: InvestorData[] = [];
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      const factoryData = resp[i];
      const investorData = factory.decodeInvestorData(factoryData);
      result.push(investorData);
    }
    return result;
  }

  /** All loaded KYC factory instances. */
  public get factories(): SecuritizeKYCFactory[] {
    return this.#factories.values();
  }

  /** Raw KYC compressor response, or `undefined` before attach/hydrate. */
  public get state(): KYCState | undefined {
    return this.#state;
  }

  /**
   * Returns a human-readable snapshot of the KYC state.
   */
  public stateHuman(raw?: boolean): KYCStateHuman {
    return {
      factories: this.factories.map(f => f.stateHuman(raw)),
    };
  }

  /**
   * @internal
   *
   * Replaces the internal state with a new KYC compressor response.
   * Rebuilds token metadata for KYC underlyings and re-instantiates factory
   * wrappers.
   */
  public setState(resp?: KYCCompressorResponse): void {
    this.#state = resp;
    for (const u of resp?.[0] ?? []) {
      this.#loadUnderlyingTokenData(u);
    }
    this.#factories.clear();
    for (const f of resp?.[1] ?? []) {
      this.#loadKYCFactoryData(f);
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
    const [decoded] = decodeAbiParameters(
      [
        {
          name: "baseParams",
          type: "tuple",
          components: [
            { name: "addr", type: "address" },
            { name: "version", type: "uint256" },
            { name: "contractType", type: "bytes32" },
            { name: "serializedParams", type: "bytes" },
          ],
        },
      ],
      extraDetails,
    );
    const contractType = bytes32ToString(decoded.contractType);
    switch (contractType) {
      case KYC_ON_DEMAND_LP_MONOPOLIZED:
        return this.#getOnDemandLPMonopolizedMeta(
          decoded.addr,
          decoded.version,
          decoded.serializedParams,
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

  #loadKYCFactoryData(data: KYCFactoryData): void {
    const contractType = bytes32ToString(data.baseParams.contractType);
    switch (contractType) {
      case KYC_FACTORY_SECURITIZE:
        this.#factories.upsert(
          data.baseParams.addr,
          new SecuritizeKYCFactory(this.sdk, data),
        );
        break;
      default:
        throw new Error(
          `Unknown KYC factory type: ${contractType} for ${data.baseParams.addr}`,
        );
    }
  }
}
