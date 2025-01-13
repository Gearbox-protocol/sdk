import type { Abi, Address, Hex } from "viem";
import { decodeFunctionData } from "viem";

import { iPriceFeedCompressorAbi, iUpdatablePriceFeedAbi } from "../abi";
import type {
  PriceFeedMapEntry,
  PriceFeedTreeNode,
  PriceOracleData,
} from "../base";
import { BaseContract } from "../base";
import type { BaseContractOptions } from "../base/BaseContract";
import { AP_PRICE_FEED_COMPRESSOR } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { PriceOracleV3StateHuman } from "../types";
import { AddressMap } from "../utils";
import type {
  IPriceFeedContract,
  PriceFeedUsageType,
  UpdatePriceFeedsResult,
} from "./pricefeeds";
import { PriceFeedRef } from "./pricefeeds";

export interface PriceFeedsForTokensOptions {
  main?: boolean;
  reserve?: boolean;
}

/**
 * Data to be passed to credit facade's multicall
 * Compatible with both v300 and v310 facades
 */
export interface OnDemandPriceUpdate {
  priceFeed: Address;
  token: Address;
  reserve: boolean;
  data: Hex;
}

export interface IPriceOracleContract {
  priceFeedsForTokens: (
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ) => IPriceFeedContract[];
  updatePriceFeeds: () => Promise<UpdatePriceFeedsResult>;
  onDemandPriceUpdates: (
    updates?: UpdatePriceFeedsResult,
  ) => OnDemandPriceUpdate[];
  convertToUnderlying: (
    token: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
  convert: (
    from: Address,
    to: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
}

export class PriceOracleBaseContract<abi extends Abi | readonly unknown[]>
  extends BaseContract<abi>
  implements IPriceOracleContract
{
  /**
   * Underlying token of market to which this price oracle belongs
   */
  public readonly underlying: Address;
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly mainPriceFeeds = new AddressMap<PriceFeedRef>();
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly reservePriceFeeds = new AddressMap<PriceFeedRef>();
  /**
   * Mapping Token => Price in underlying
   */
  public readonly mainPrices = new AddressMap<bigint>();
  /**
   * Mapping Token => Price in underlying
   */
  public readonly reservePrices = new AddressMap<bigint>();

  #priceFeedTree: readonly PriceFeedTreeNode[] = [];

  constructor(
    sdk: GearboxSDK,
    args: BaseContractOptions<abi>,
    data: PriceOracleData,
    underlying: Address,
  ) {
    super(sdk, args);
    this.underlying = underlying;
    const { priceFeedMapping, priceFeedStructure } = data;
    this.#loadState(priceFeedMapping, priceFeedStructure);
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
        main ? this.mainPriceFeeds.get(t)?.priceFeed : undefined,
        reserve ? this.reservePriceFeeds.get(t)?.priceFeed : undefined,
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
      this.logger?.debug("empty updates list");
      return result;
    }
    const { txs } = updates;

    for (const tx of txs) {
      const { to: priceFeed, callData, description } = tx;
      const [token, reserve] = this.findTokenForPriceFeed(priceFeed);
      // this situation happend when we have combined updates from multiple markrts,
      // but this particular feed is not added to this particular oracle
      if (!token) {
        this.logger?.debug(
          `skipping onDemandPriceUpdate ${description}): token not found for price feed ${priceFeed} in oracle ${this.address}`,
        );
        continue;
      }
      const { args } = decodeFunctionData({
        abi: iUpdatablePriceFeedAbi,
        data: callData,
      });
      const data = args[0]!;
      result.push({
        priceFeed,
        token,
        reserve,
        data,
      });
    }
    this.logger?.debug(
      `got ${result.length} onDemandPriceUpdates from ${txs.length} txs`,
    );
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
    const fromScale = 10n ** BigInt(this.sdk.tokensMeta.decimals(from));
    const toPrice = reserve
      ? this.reservePrices.mustGet(to)
      : this.mainPrices.mustGet(to);
    const toScale = 10n ** BigInt(this.sdk.tokensMeta.decimals(to));

    return (amount * fromPrice * toScale) / (toPrice * fromScale);
  }

  /**
   * Tries to convert amount of token to USD, using latest known prices
   * @param from
   * @param to
   * @param amount
   * @param reserve
   */
  public convertToUSD(from: Address, amount: bigint, reserve = false): bigint {
    const price = reserve
      ? this.reservePrices.mustGet(from)
      : this.mainPrices.mustGet(from);
    const scale = 10n ** BigInt(this.sdk.tokensMeta.decimals(from));
    return (amount * price) / scale;
  }

  /**
   * Loads new prices for this oracle from PriceFeedCompressor
   * Does not update price feeds, only updates prices
   */
  public async updatePrices(): Promise<void> {
    await this.sdk.marketRegister.updatePrices([this.address]);
  }

  public syncStateMulticall() {
    const args: any[] = [this.address];
    if (this.version === 300) {
      args.push(
        Array.from(
          new Set([
            this.underlying,
            ...this.mainPriceFeeds.keys(),
            ...this.reservePriceFeeds.keys(),
          ]),
        ),
      );
    }
    return {
      call: {
        abi: iPriceFeedCompressorAbi,
        address: this.sdk.addressProvider.getLatestVersion(
          AP_PRICE_FEED_COMPRESSOR,
        ),
        functionName: "getPriceFeeds",
        args,
      },
      onResult: ([entries, tree]: [
        PriceFeedMapEntry[],
        PriceFeedTreeNode[],
      ]) => {
        this.#loadState(entries, tree);
      },
    };
  }

  #loadState(
    entries: readonly PriceFeedMapEntry[],
    tree: readonly PriceFeedTreeNode[],
  ): void {
    this.#priceFeedTree = tree;
    this.mainPriceFeeds.clear();
    this.reservePriceFeeds.clear();
    this.mainPrices.clear();
    this.reservePrices.clear();

    for (const node of tree) {
      this.sdk.priceFeeds.getOrCreate(node);
    }

    entries.forEach(node => {
      const { token, priceFeed, reserve, stalenessPeriod } = node;
      const ref = new PriceFeedRef(this.sdk, priceFeed, stalenessPeriod);
      const price = this.#priceFeedTree.find(
        n => n.baseParams.addr === priceFeed,
      )?.answer?.price;
      if (reserve) {
        this.reservePriceFeeds.upsert(token, ref);
        if (price) {
          this.reservePrices.upsert(token, price);
        }
      } else {
        this.mainPriceFeeds.upsert(token, ref);
        if (price) {
          this.mainPrices.upsert(token, price);
        }
      }
      this.#labelPriceFeed(priceFeed, reserve ? "Reserve" : "Main", token);
    });

    this.logger?.debug(
      `Got ${this.mainPriceFeeds.size} main and ${this.reservePriceFeeds.size} reserve price feeds`,
    );
  }

  #labelPriceFeed(
    address: Address,
    usage: PriceFeedUsageType,
    token: Address,
  ): void {
    this.sdk.provider.addressLabels.set(address, label => {
      const symbol = this.sdk.tokensMeta.symbol(token);
      let pricefeedTag = `${symbol}.${usage}`;

      if (label) {
        pricefeedTag = `${label}, ${pricefeedTag}`;
      }
      return pricefeedTag;
    });
  }

  /**
   * Helper method to find "attachment point" of price feed (makes sense for updatable price feeds only) -
   * returns token (in v3.0 can be ticker) and main/reserve flag
   *
   * @param priceFeed
   * @returns
   */
  protected findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address | undefined, reserve: boolean] {
    for (const [token, pf] of this.mainPriceFeeds.entries()) {
      if (pf.address === priceFeed) {
        return [token, false];
      }
    }
    for (const [token, pf] of this.reservePriceFeeds.entries()) {
      if (pf.address === priceFeed) {
        return [token, true];
      }
    }
    return [undefined, false];
  }

  public override stateHuman(raw = true): PriceOracleV3StateHuman {
    return {
      ...super.stateHuman(raw),
      mainPriceFeeds: Object.fromEntries(
        this.mainPriceFeeds
          .entries()
          .map(([token, v]) => [
            this.labelAddress(token as Address),
            v.stateHuman(raw),
          ]),
      ),
      reservePriceFeeds: Object.fromEntries(
        this.reservePriceFeeds
          .entries()
          .map(([token, v]) => [
            this.labelAddress(token as Address),
            v.stateHuman(raw),
          ]),
      ),
    };
  }

  protected get priceFeedTree(): readonly PriceFeedTreeNode[] {
    return this.#priceFeedTree;
  }
}
