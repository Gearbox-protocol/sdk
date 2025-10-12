import { format, formatDistanceToNow } from "date-fns";
import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionReturnType,
} from "viem";
import { stringToHex } from "viem";

import { iPriceFeedCompressorAbi } from "../../../abi/compressors.js";
import type { BaseContractOptions } from "../../base/BaseContract.js";
import type {
  PriceFeedMapEntry,
  PriceFeedTreeNode,
  PriceOracleData,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { PriceFeedAnswer } from "../../base/types.js";
import {
  AP_PRICE_FEED_COMPRESSOR,
  isV300,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PriceOracleStateHuman } from "../../types/index.js";
import { AddressMap, formatBN, hexEq } from "../../utils/index.js";
import type {
  IPriceFeedContract,
  PriceFeedUsageType,
  PriceUpdateV300,
  PriceUpdateV310,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import { PriceFeedRef } from "../pricefeeds/index.js";
import PriceFeedAnswerMap from "./PriceFeedAnswerMap.js";
import type { OnDemandPriceUpdates } from "./types";
import type {
  DelegatedOracleMulticall,
  IPriceOracleContract,
  PriceFeedsForTokensOptions,
} from "./types.js";

const ZERO_PRICE_FEED = stringToHex("PRICE_FEED::ZERO", { size: 32 });

export abstract class PriceOracleBaseContract<
    abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IPriceOracleContract
{
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly mainPriceFeeds = new AddressMap<PriceFeedRef>(
    undefined,
    "mainPriceFeeds",
  );
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly reservePriceFeeds = new AddressMap<PriceFeedRef>(
    undefined,
    "reservePriceFeeds",
  );
  /**
   * Mapping Token => Price in USD
   */
  public readonly mainPrices = new PriceFeedAnswerMap(undefined, "mainPrices");
  /**
   * Mapping Token => Price in USD
   */
  public readonly reservePrices = new PriceFeedAnswerMap(
    undefined,
    "reservePrices",
  );

  #priceFeedTree = new AddressMap<PriceFeedTreeNode>(
    undefined,
    "priceFeedTree",
  );

  constructor(
    sdk: GearboxSDK,
    args: BaseContractOptions<abi>,
    data: PriceOracleData,
  ) {
    super(sdk, args);
    const { priceFeedMap, priceFeedTree } = data;
    this.#loadState(priceFeedMap, priceFeedTree, true);
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
    for (const node of this.#priceFeedTree.values()) {
      if (node.updatable) {
        updatables.push(this.sdk.priceFeeds.mustGet(node.baseParams.addr));
      }
    }
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(updatables);
  }

  public abstract onDemandPriceUpdates(
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ): OnDemandPriceUpdates<PriceUpdateV310 | PriceUpdateV300>;

  /**
   * Gets main price for given token
   * Throws if token price feed is not found or answer is not successful
   * @param token
   * @returns
   */
  public mainPrice(token: Address): bigint {
    return this.mainPrices.price(token);
  }

  /**
   * Gets reserve price for given token
   * Throws if token price feed is not found or answer is not successful
   * @param token
   * @returns
   */
  public reservePrice(token: Address): bigint {
    return this.reservePrices.price(token);
  }

  /**
   * Returns true if oracle's price feed tree contains given price feed
   * This feed is not necessary connected to token, but can be a component of composite feed for some token
   * @param priceFeed
   * @returns
   */
  public usesPriceFeed(priceFeed: Address): boolean {
    return this.#priceFeedTree.has(priceFeed);
  }

  /**
   * Tries to convert amount of from one token to another, using latest known prices
   * @param from
   * @param to
   * @param amount
   * @param reserve use reserve price feed instead of main
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
    const fromPrice = reserve ? this.reservePrice(from) : this.mainPrice(from);
    const fromScale = 10n ** BigInt(this.sdk.tokensMeta.decimals(from));
    const toPrice = reserve ? this.reservePrice(to) : this.mainPrice(to);
    const toScale = 10n ** BigInt(this.sdk.tokensMeta.decimals(to));

    return (amount * fromPrice * toScale) / (toPrice * fromScale);
  }

  /**
   * Tries to convert amount of token to USD, using latest known prices
   * @param from
   * @param amount
   * @param reserve use reserve price feed instead of main
   */
  public convertToUSD(from: Address, amount: bigint, reserve = false): bigint {
    const price = reserve ? this.reservePrice(from) : this.mainPrice(from);
    const scale = 10n ** BigInt(this.sdk.tokensMeta.decimals(from));
    return (amount * price) / scale;
  }

  /**
   * Tries to convert amount of USD to token, using latest known prices
   * @param to
   * @param amount
   * @param reserve use reserve price feed instead of main
   */
  public convertFromUSD(to: Address, amount: bigint, reserve = false): bigint {
    const price = reserve ? this.reservePrice(to) : this.mainPrice(to);
    const scale = 10n ** BigInt(this.sdk.tokensMeta.decimals(to));
    return (amount * scale) / price;
  }

  /**
   * Loads new prices for this oracle from PriceFeedCompressor
   * Will (re)create price feeds if needed
   */
  public async updatePrices(): Promise<void> {
    await this.sdk.marketRegister.updatePrices([this.address]);
  }

  /**
   * All price feed tree nodes known to this oracle
   */
  public get priceFeeds(): IPriceFeedContract[] {
    return this.#priceFeedTree
      .values()
      .map(node => this.sdk.priceFeeds.mustGet(node.baseParams.addr));
  }

  /**
   * Paired method to updatePrices, helps to update prices on all oracles in one multicall
   */
  public syncStateMulticall(): DelegatedOracleMulticall {
    let args: ContractFunctionArgs<
      typeof iPriceFeedCompressorAbi,
      "view",
      "getPriceOracleState"
    > = [this.address];

    if (isV300(this.version)) {
      args = [
        args[0],
        Array.from(
          new Set([
            ...this.mainPriceFeeds.keys(),
            ...this.reservePriceFeeds.keys(),
          ]),
        ),
      ];
    }

    const [address] = this.sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return {
      call: {
        abi: iPriceFeedCompressorAbi,
        address,
        functionName: "getPriceOracleState",
        args,
      },
      onResult: (
        resp: ContractFunctionReturnType<
          typeof iPriceFeedCompressorAbi,
          "view",
          "getPriceOracleState"
        >,
      ) => {
        const { priceFeedMap, priceFeedTree } = resp;
        // in this case we want reset = true, since we've passed all tokens as getPriceOracleState arg for v300
        // or in case of v310 this list is not needed at all, and we're 100% getting full oracle state)
        this.#loadState(priceFeedMap, priceFeedTree, true);
      },
    };
  }

  /**
   * Helper function to handle situation when we have multiple different compressor data entries for same oracle
   * This happens in v300
   *
   * @deprecated should be unnecessary after full v310 migration (oracles will be unique)
   * @param data
   * @returns
   */
  public merge(data: PriceOracleData): this {
    const { priceFeedMap, priceFeedTree } = data;
    this.#loadState(priceFeedMap, priceFeedTree, false);
    return this;
  }

  #loadState(
    entries: readonly PriceFeedMapEntry[],
    tree: readonly PriceFeedTreeNode[],
    reset: boolean,
  ): void {
    if (reset) {
      this.#priceFeedTree.clear();
      this.mainPriceFeeds.clear();
      this.reservePriceFeeds.clear();
      this.mainPrices.clear();
      this.reservePrices.clear();
    }

    for (const node of tree) {
      this.#priceFeedTree.upsert(node.baseParams.addr, node);
      this.sdk.priceFeeds.upsert(node);
    }

    for (const entry of entries) {
      const { token, priceFeed, reserve, stalenessPeriod } = entry;
      const ref = new PriceFeedRef(this.sdk, priceFeed, stalenessPeriod);
      const node = this.#priceFeedTree.get(priceFeed);
      const price = node?.answer?.price;
      const priceFeedType = node?.baseParams.contractType;
      if (reserve) {
        this.reservePriceFeeds.upsert(token, ref);
        this.reservePrices.upsert(token, node?.answer);
        if (!price && priceFeedType !== ZERO_PRICE_FEED) {
          this.#noAnswerWarn(priceFeed, node);
        }
      } else {
        this.mainPriceFeeds.upsert(token, ref);
        this.mainPrices.upsert(token, node?.answer);
        if (!price && priceFeedType !== ZERO_PRICE_FEED) {
          this.#noAnswerWarn(priceFeed, node);
        }
      }
      this.#labelPriceFeed(priceFeed, reserve ? "Reserve" : "Main", token);
    }
    this.dirty = false;
  }

  #labelPriceFeed(
    address: Address,
    usage: PriceFeedUsageType,
    token: Address,
  ): void {
    this.sdk.provider.addressLabels.set(address, oldLabel => {
      const symbol = this.sdk.tokensMeta.symbol(token);
      let pricefeedTag = `${symbol}.${usage}`;

      if (oldLabel) {
        const oldLabelParts = new Set(oldLabel.split(", "));
        oldLabelParts.add(pricefeedTag);
        pricefeedTag = Array.from(oldLabelParts).join(", ");
      }
      return pricefeedTag;
    });
  }

  /**
   * Helper method to find "attachment point" of price feed (makes sense for updatable price feeds only) -
   * returns token (in v3.0 can be ticker) and main/reserve flag
   *
   * @deprecated Should be gone after v310 migration
   *
   * @param priceFeed
   * @returns
   */
  public findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address | undefined, reserve: boolean] {
    for (const [token, pf] of this.mainPriceFeeds.entries()) {
      if (hexEq(pf.address, priceFeed)) {
        return [token, false];
      }
    }
    for (const [token, pf] of this.reservePriceFeeds.entries()) {
      if (hexEq(pf.address, priceFeed)) {
        return [token, true];
      }
    }
    return [undefined, false];
  }

  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  public override get watchAddresses(): Set<Address> {
    return new Set([this.address]);
  }

  public override stateHuman(raw = true): PriceOracleStateHuman {
    return {
      ...super.stateHuman(raw),
      mainPriceFeeds: Object.fromEntries(
        this.mainPriceFeeds
          .entries()
          .map(([token, v]) => [this.labelAddress(token), v.stateHuman(raw)]),
      ),
      reservePriceFeeds: Object.fromEntries(
        this.reservePriceFeeds
          .entries()
          .map(([token, v]) => [this.labelAddress(token), v.stateHuman(raw)]),
      ),
      mainPrices: Object.fromEntries(
        this.mainPrices
          .entries()
          .map(([token, answer]) => [
            this.labelAddress(token),
            formatAnswer(answer, raw),
          ]),
      ),
      reservePrices: Object.fromEntries(
        this.reservePrices
          .entries()
          .map(([token, answer]) => [
            this.labelAddress(token),
            formatAnswer(answer, raw),
          ]),
      ),
    };
  }

  #noAnswerWarn(priceFeed: Address, node?: PriceFeedTreeNode): void {
    let label = this.labelAddress(priceFeed);
    if (!node) {
      this.logger?.warn(`no node found for price feed ${label}`);
      return;
    }
    const { answer, baseParams, description } = node;
    const { success, updatedAt } = answer;
    const { addr } = baseParams;
    label = description ? `${description} at ${addr}` : label;
    let upd = "";
    if (updatedAt) {
      const u = new Date(Number(updatedAt) * 1000);
      upd = `${format(u, "PPppp")} (${formatDistanceToNow(u)})`;
    }

    if (success) {
      upd = upd || "never";
      this.logger?.warn(`zero answer for price feed ${label}, updated ${upd}`);
    } else {
      upd = upd ? `, updated ${upd}` : "";
      this.logger?.warn(`failed to get answer for price feed ${label}${upd}`);
    }
  }
}

function formatAnswer(
  { price, success, updatedAt }: PriceFeedAnswer,
  raw = true,
): string {
  if (!success) {
    return "failed";
  }
  let priceS = formatBN(price, 8);
  let updated = updatedAt
    ? format(new Date(Number(updatedAt) * 1000), "dd MMM yyyy HH:mm")
    : "";
  if (raw) {
    priceS = `${priceS} (${price.toString(10)})`;
    updated = [updated, `(${updatedAt.toString(10)})`]
      .filter(Boolean)
      .join(" ");
  }
  return `${priceS} at ${updated}`;
}
