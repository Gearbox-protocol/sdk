import type { Address } from "abitype";
import { decodeAbiParameters, type Hex } from "viem";
import { iRWACompressorAbi } from "../../../abi/rwa/iRWACompressor.js";
import {
  RWA_ON_DEMAND_LP_MONOPOLIZED,
  RWA_UNDERLYING_DEFAULT,
  RWA_UNDERLYING_ON_DEMAND,
  type RWADefaultTokenMeta,
  type RWAOnDemandLPMeta,
  type RWAOnDemandLPMonopolizedMeta,
  type RWAOnDemandTokenMeta,
  SDKConstruct,
  type TokenMetaData,
} from "../../base/index.js";
import { AP_RWA_COMPRESSOR, VERSION_RANGE_310 } from "../../constants/index.js";
import { AddressMap, bytes32ToString } from "../../utils/index.js";
import type { DelegatedMulticall } from "../../utils/viem/index.js";
import {
  RWA_FACTORY_SECURITIZE,
  SecuritizeRWAFactory,
} from "./securitize/index.js";
import type {
  RWACompressorResponse,
  RWAFactoryData,
  RWAInvestorData,
  RWAState,
  RWAStateHuman,
  RWAUnderlyingData,
} from "./types.js";

/**
 * Registry of RWA underlying tokens and RWA factory contracts.
 *
 * Populated from the on-chain {@link https://github.com/Gearbox-protocol/periphery-v3 RWACompressor}
 * during SDK attach/hydrate. Provides methods to query investor-level data and
 * to resolve RWA factory instances by address.
 **/
export class RWARegistry extends SDKConstruct {
  #state?: RWAState;
  #factories = new AddressMap<SecuritizeRWAFactory>();

  /**
   * @internal
   *
   * Returns delegated multicalls for loading all RWA underlying tokens from the on-chain RWA compressor.
   * Used by the SDK to compose batched RPC calls.
   *
   * @param configurators - Market configurators to query.
   * @param rwaFactories - RWA factory contracts to query.
   */
  public getLoadMulticalls(
    configurators: Address[],
    rwaFactories: Address[] = [],
  ): DelegatedMulticall[] {
    if (!rwaFactories.length) {
      return [];
    }
    const [rwaCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_RWA_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return [
      {
        call: {
          abi: iRWACompressorAbi,
          address: rwaCompressorAddress,
          functionName: "getRWAMarketsData",
          args: [configurators, rwaFactories],
        },
        onResult: (resp: unknown) =>
          this.setState(resp as RWACompressorResponse),
      },
    ];
  }

  /**
   * Fetches decoded investor data from the on-chain RWA compressor.
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
  ): Promise<RWAInvestorData[]> {
    let factories = this.#factories.values();
    if (factories_?.length) {
      factories = factories_.map(f => this.#factories.mustGet(f));
    }
    if (!factories.length) {
      return [];
    }
    const [rwaCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_RWA_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const resp = await this.client.readContract({
      abi: iRWACompressorAbi,
      address: rwaCompressorAddress,
      functionName: "getRWAInvestorData",
      args: [investor, factories.map(f => f.address)],
    });
    const result: RWAInvestorData[] = [];
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      const factoryData = resp[i];
      const investorData = factory.decodeInvestorData(factoryData);
      result.push(investorData);
    }
    return result;
  }

  /** All loaded RWA factory instances. */
  public get factories(): SecuritizeRWAFactory[] {
    return this.#factories.values();
  }

  /** Raw RWA compressor response, or `undefined` before attach/hydrate. */
  public get state(): RWAState | undefined {
    return this.#state;
  }

  /**
   * Returns a human-readable snapshot of the RWA state.
   */
  public stateHuman(raw?: boolean): RWAStateHuman {
    return {
      factories: this.factories.map(f => f.stateHuman(raw)),
    };
  }

  /**
   * @internal
   *
   * Replaces the internal state with a new RWA compressor response.
   * Rebuilds token metadata for RWA underlyings and re-instantiates factory
   * wrappers.
   */
  public setState(resp?: RWACompressorResponse): void {
    this.#state = resp;
    for (const u of resp?.[0] ?? []) {
      this.#loadUnderlyingTokenData(u);
    }
    this.#factories.clear();
    for (const f of resp?.[1] ?? []) {
      this.#loadRWAFactoryData(f);
    }
  }

  #loadUnderlyingTokenData(u: RWAUnderlyingData): void {
    const contractType = bytes32ToString(u.baseParams.contractType);
    // token must be loaded by market compressor first
    const meta = this.tokensMeta.get(u.baseParams.addr);
    if (!meta) {
      throw new Error(
        `RWA underlying token ${contractType} (${u.baseParams.addr}) not found in tokensMeta`,
      );
    }

    switch (contractType) {
      case RWA_UNDERLYING_DEFAULT:
        this.#loadRWAUnderlyingDefault(meta, u);
        break;

      case RWA_UNDERLYING_ON_DEMAND:
        this.#loadRWAUnderlyingOnDemand(meta, u);
        break;
      default:
        if (this.sdk.strictContractTypes) {
          throw new Error(`Unknown RWA underlying type: ${contractType}`);
        }
        this.logger?.warn(`unknown RWA underlying type: ${contractType}`);
    }
  }

  #loadRWAUnderlyingDefault(
    meta: TokenMetaData,
    data: RWAUnderlyingData,
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
      contractType: RWA_UNDERLYING_DEFAULT,
      rwaFactory: decoded[0],
      asset: decoded[1],
    } as RWADefaultTokenMeta);
  }

  #loadRWAUnderlyingOnDemand(
    meta: TokenMetaData,
    data: RWAUnderlyingData,
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
      contractType: RWA_UNDERLYING_ON_DEMAND,
      rwaFactory: decoded[0],
      asset: decoded[1],
      pool: decoded[2],
      marketConfigurator: decoded[4],
      allowedDepositors: decoded[5],
      // liquidityProvider: decoded[3],
      liquidityProvider: lpMeta,
    } as RWAOnDemandTokenMeta);
  }

  #getOnDemandLPMeta(extraDetails: Hex): RWAOnDemandLPMeta {
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
      case RWA_ON_DEMAND_LP_MONOPOLIZED:
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
  ): RWAOnDemandLPMonopolizedMeta {
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
      contractType: RWA_ON_DEMAND_LP_MONOPOLIZED,
      marketConfigurator,
      depositor,
      pools: [...pools],
    };
  }

  #loadRWAFactoryData(data: RWAFactoryData): void {
    const contractType = bytes32ToString(data.baseParams.contractType);
    switch (contractType) {
      case RWA_FACTORY_SECURITIZE:
        this.#factories.upsert(
          data.baseParams.addr,
          new SecuritizeRWAFactory(this.sdk, data),
        );
        break;
      default:
        throw new Error(
          `Unknown RWA factory type: ${contractType} for ${data.baseParams.addr}`,
        );
    }
  }
}
