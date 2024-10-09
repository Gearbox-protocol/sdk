import type { Address, Hex } from "viem";
import { decodeFunctionData } from "viem";

import {
  iPriceFeedCompressorAbi,
  iUpdatablePriceFeedAbi,
  priceOracleV3Abi,
} from "../abi";
import type {
  PriceFeedMapEntry,
  PriceFeedTreeNode,
  PriceOracleData,
} from "../base";
import { BaseContract } from "../base";
import { AP_PRICE_FEED_COMPRESSOR } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { PriceOracleState } from "../state";
import { AddressMap } from "../utils";
import { simulateMulticall } from "../utils/viem";
import type {
  IPriceFeedContract,
  PriceFeedUsageType,
  UpdatePriceFeedsResult,
} from "./pricefeeds";
import { PriceFeedRef, rawTxToMulticallPriceUpdate } from "./pricefeeds";

type abi = typeof priceOracleV3Abi;

interface PriceFeedsForTokensOptions {
  main?: boolean;
  reserve?: boolean;
}

export interface OnDemandPriceUpdate {
  token: Address;
  reserve: boolean;
  data: Hex;
}

export class PriceOracleContract extends BaseContract<abi> {
  /**
   * Underlying token of market to which this price oracle belongs
   */
  public readonly underlying: Address;
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly mainPriceFeeds: Record<Address, PriceFeedRef> = {};
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly reservePriceFeeds: Record<Address, PriceFeedRef> = {};
  /**
   * Mapping Token => Price in underlying
   */
  public readonly mainPrices = new AddressMap<bigint>();
  /**
   * Mapping Token => Price in underlying
   */
  public readonly reservePrices = new AddressMap<bigint>();

  readonly #priceFeedTree: readonly PriceFeedTreeNode[];

  constructor(sdk: GearboxSDK, data: PriceOracleData, underlying: Address) {
    super(sdk, {
      ...data.baseParams,
      name: "PriceOracleV3",
      abi: priceOracleV3Abi,
    });
    this.underlying = underlying;
    const { priceFeedMapping, priceFeedStructure } = data;
    this.#priceFeedTree = priceFeedStructure;

    for (const node of priceFeedStructure) {
      sdk.priceFeeds.create(node);
    }

    priceFeedMapping.forEach(node => {
      const { token, priceFeed, reserve, stalenessPeriod } = node;
      const ref = new PriceFeedRef(sdk, priceFeed, stalenessPeriod);
      const price = this.#priceFeedTree.find(
        n => n.baseParams.addr === priceFeed,
      )?.answer?.price;
      if (reserve) {
        this.reservePriceFeeds[token] = ref;
        if (price) {
          this.reservePrices.upsert(token, price);
        }
      } else {
        this.mainPriceFeeds[token] = ref;
        if (price) {
          this.mainPrices.upsert(token, price);
        }
      }
      this.#labelPriceFeed(priceFeed, reserve ? "Reserve" : "Main", token);
    });

    this.logger?.debug(
      `Got ${Object.keys(this.mainPriceFeeds).length} main and ${Object.keys(this.reservePriceFeeds).length} reserve price feeds`,
    );
  }

  /**
   * Returns main and reserve price feeds for given tokens
   * @param tokens
   * @param opts Option to include main/reserve feeds only, defaults to both
   * @returns
   */
  public priceFeedsForTokens(
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ): IPriceFeedContract[] {
    const main = opts?.main ?? true;
    const reserve = opts?.reserve ?? true;
    return tokens
      .flatMap(t => [
        main ? this.mainPriceFeeds[t]?.priceFeed : undefined,
        reserve ? this.reservePriceFeeds[t]?.priceFeed : undefined,
      ])
      .filter((f): f is IPriceFeedContract => !!f);
  }

  /**
   * Generates updates for all updateable price feeds in this oracle (including dependencies)
   * @returns
   */
  public async updatePriceFeeds(): Promise<UpdatePriceFeedsResult> {
    const updatables: IPriceFeedContract[] = [];
    for (const node of this.#priceFeedTree) {
      if (node.updatable) {
        updatables.push(this.sdk.priceFeeds.mustGet(node.baseParams.addr));
      }
    }
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(updatables);
  }

  /**
   * Converts previously obtained price updates into CreditFacade multicall entries
   * @param creditFacade
   * @param updates
   * @returns
   */
  public onDemandPriceUpdates(
    updates?: UpdatePriceFeedsResult,
  ): OnDemandPriceUpdate[] {
    // TODO: really here I'm doing lots of reverse processing:
    // decoding RawTx into Redstone calldata
    // and then finding token + reserve value for a price feed
    // it would be much nicer to have intermediate format and get RawTx/OnDemandPriceUpdate/ViemMulticall from it (as it's done in liquidator)
    const result: OnDemandPriceUpdate[] = [];
    if (!updates) {
      return result;
    }
    const { txs } = updates;

    for (const tx of txs) {
      const { to: priceFeed, callData } = tx;
      const [token, reserve] = this.#findTokenForPriceFeed(priceFeed);
      const { args } = decodeFunctionData({
        abi: iUpdatablePriceFeedAbi,
        data: callData,
      });
      const data = args[0]!;
      result.push({
        token,
        reserve,
        data,
      });
    }
    return result;
  }

  /**
   * Tries to convert amount of token into underlying of current market
   * @param token
   * @param amount
   * @param reserve
   * @returns
   */
  public convertToUnderlying(
    token: Address,
    amount: bigint,
    reserve = false,
  ): bigint {
    return this.convert(token, this.underlying, amount, reserve);
  }

  /**
   * Tries to convert amount of from one token to another, using latest known prices
   * @param from
   * @param to
   * @param amount
   * @param reserve
   */
  public convert(
    from: Address,
    to: Address,
    amount: bigint,
    reserve = false,
  ): bigint {
    if (from === to) {
      return amount;
    }
    const fromPrice = reserve
      ? this.reservePrices.mustGet(from)
      : this.mainPrices.mustGet(from);
    const fromScale =
      10n ** BigInt(this.sdk.marketRegister.tokensMeta.mustGet(from).decimals);
    const toPrice = reserve
      ? this.reservePrices.mustGet(to)
      : this.mainPrices.mustGet(to);
    const toScale =
      10n ** BigInt(this.sdk.marketRegister.tokensMeta.mustGet(to).decimals);

    return (amount * fromPrice * toScale) / (toPrice * fromScale);
  }

  /**
   * Loads new prices for this oracle from PriceFeedCompressor
   * Does not update price feeds, only updates prices
   */
  public async updatePrices(): Promise<void> {
    const { txs } = await this.updatePriceFeeds();
    const resp = await simulateMulticall(this.provider.publicClient, {
      contracts: [
        ...txs.map(rawTxToMulticallPriceUpdate),
        {
          abi: iPriceFeedCompressorAbi,
          address: this.sdk.addressProvider.getLatestVersion(
            AP_PRICE_FEED_COMPRESSOR,
          ),
          functionName: "getPriceFeeds",
          args: [this.address],
        },
      ],
      allowFailure: false,
      gas: 550_000_000n,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
    });
    const [entries, tree] = resp.pop() as [
      PriceFeedMapEntry[],
      PriceFeedTreeNode[],
    ];

    entries.forEach(({ token, priceFeed, reserve }) => {
      const price = tree.find(n => n.baseParams.addr === priceFeed)?.answer
        ?.price;
      if (reserve && price) {
        this.reservePrices.upsert(token, price);
      } else if (price) {
        this.mainPrices.upsert(token, price);
      }
    });
  }

  #labelPriceFeed(
    address: Address,
    usage: PriceFeedUsageType,
    token: Address,
  ): void {
    this.sdk.provider.addressLabels.set(address, label => {
      const { symbol } = this.sdk.marketRegister.tokensMeta.mustGet(token);
      let pricefeedTag = `${symbol}.${usage}`;

      if (label) {
        pricefeedTag = `${label}, ${pricefeedTag}`;
      }
      return pricefeedTag;
    });
  }

  /**
   * Helper method to find "attachment point" of price feed (makes sense for updatable price feeds only) - token (in v3.0 can be ticker) and main/reserve flag
   *
   * @param priceFeed
   * @returns
   */
  #findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address, reserve: boolean] {
    for (const [token, pf] of Object.entries(this.mainPriceFeeds)) {
      if (pf.address === priceFeed) {
        return [token as Address, false];
      }
    }
    for (const [token, pf] of Object.entries(this.reservePriceFeeds)) {
      if (pf.address === priceFeed) {
        return [token as Address, true];
      }
    }
    throw new Error(`cannot find token for price feed ${priceFeed}`);
  }

  public get state(): PriceOracleState {
    return {
      priceOracleV3: this.contractData,
      mainPriceFeeds: Object.fromEntries(
        Object.entries(this.mainPriceFeeds).map(([token, v]) => [
          token,
          v.state,
        ]),
      ),
      reservePriceFeeds: Object.fromEntries(
        Object.entries(this.reservePriceFeeds).map(([token, v]) => [
          token,
          v.state,
        ]),
      ),
    };
  }
}
