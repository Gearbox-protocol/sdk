import { format, formatDistanceToNow } from "date-fns";
import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionReturnType,
} from "viem";
import { stringToHex } from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import type { BaseContractArgs } from "../../base/BaseContract.js";
import type {
  PriceFeedMapEntry,
  PriceFeedTreeNode,
  PriceOracleData,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { PriceFeedAnswer } from "../../base/types.js";
import {
  AP_PRICE_FEED_COMPRESSOR,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PriceOracleStateHuman } from "../../types/index.js";
import { AddressMap, formatBN } from "../../utils/index.js";
import type {
  IPriceFeedContract,
  PriceFeedUsageType,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import { PriceFeedRef } from "../pricefeeds/index.js";
import PriceFeedAnswerMap from "./PriceFeedAnswerMap.js";
import type {
  DelegatedOracleMulticall,
  IPriceOracleContract,
  OnDemandPriceUpdates,
  PriceFeedsForTokensOptions,
} from "./types.js";

const ZERO_PRICE_FEED = stringToHex("PRICE_FEED::ZERO", { size: 32 });

/**
 * Base implementation of the Gearbox price oracle.
 *
 * Manages dual main/reserve price feed mappings and price answers for
 * every collateral token in a market. Provides token-to-USD and
 * token-to-token conversion using the latest known prices.
 *
 * @typeParam abi - The concrete oracle contract's ABI type.
 **/
export abstract class PriceOracleBaseContract<
    abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IPriceOracleContract
{
  public readonly sdk: GearboxSDK;
  /**
   * {@inheritDoc IPriceOracleContract.mainPriceFeeds}
   **/
  public readonly mainPriceFeeds = new AddressMap<PriceFeedRef>(
    undefined,
    "mainPriceFeeds",
  );
  /**
   * {@inheritDoc IPriceOracleContract.reservePriceFeeds}
   **/
  public readonly reservePriceFeeds = new AddressMap<PriceFeedRef>(
    undefined,
    "reservePriceFeeds",
  );
  /**
   * {@inheritDoc IPriceOracleContract.mainPrices}
   **/
  public readonly mainPrices = new PriceFeedAnswerMap(undefined, "mainPrices");
  /**
   * {@inheritDoc IPriceOracleContract.reservePrices}
   **/
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
    args: BaseContractArgs<abi>,
    data: PriceOracleData,
  ) {
    super(sdk, args);
    this.sdk = sdk;
    const { priceFeedMap, priceFeedTree } = data;
    this.#loadState(priceFeedMap, priceFeedTree);
  }

  /**
   * {@inheritDoc IPriceOracleContract.priceFeedsForTokens}
   **/
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

  public abstract onDemandPriceUpdates(
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ): OnDemandPriceUpdates;

  /**
   * {@inheritDoc IPriceOracleContract.mainPrice}
   **/
  public mainPrice(token: Address): bigint {
    return this.mainPrices.price(token);
  }

  /**
   * {@inheritDoc IPriceOracleContract.reservePrice}
   **/
  public reservePrice(token: Address): bigint {
    return this.reservePrices.price(token);
  }

  /**
   * {@inheritDoc IPriceOracleContract.usesPriceFeed}
   **/
  public usesPriceFeed(priceFeed: Address): boolean {
    return this.#priceFeedTree.has(priceFeed);
  }

  /**
   * {@inheritDoc IPriceOracleContract.convert}
   **/
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
    const fromScale = 10n ** BigInt(this.tokensMeta.decimals(from));
    const toPrice = reserve ? this.reservePrice(to) : this.mainPrice(to);
    const toScale = 10n ** BigInt(this.tokensMeta.decimals(to));

    return (amount * fromPrice * toScale) / (toPrice * fromScale);
  }

  /**
   * {@inheritDoc IPriceOracleContract.convertToUSD}
   **/
  public convertToUSD(from: Address, amount: bigint, reserve = false): bigint {
    if (amount === 0n) {
      return 0n;
    }
    const price = reserve ? this.reservePrice(from) : this.mainPrice(from);
    const scale = 10n ** BigInt(this.tokensMeta.decimals(from));
    return (amount * price) / scale;
  }

  /**
   * {@inheritDoc IPriceOracleContract.convertFromUSD}
   **/
  public convertFromUSD(to: Address, amount: bigint, reserve = false): bigint {
    if (amount === 0n) {
      return 0n;
    }
    const price = reserve ? this.reservePrice(to) : this.mainPrice(to);
    const scale = 10n ** BigInt(this.tokensMeta.decimals(to));
    return (amount * scale) / price;
  }

  /**
   * {@inheritDoc IPriceOracleContract.priceFeeds}
   **/
  public get priceFeeds(): IPriceFeedContract[] {
    return this.#priceFeedTree
      .values()
      .map(node => this.sdk.priceFeeds.mustGet(node.baseParams.addr));
  }

  /**
   * {@inheritDoc IPriceOracleContract.syncStateMulticall}
   **/
  public syncStateMulticall(): DelegatedOracleMulticall {
    const args: ContractFunctionArgs<
      typeof priceFeedCompressorAbi,
      "view",
      "getPriceOracleState"
    > = [this.address];

    const [address] = this.sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return {
      call: {
        abi: priceFeedCompressorAbi,
        address,
        functionName: "getPriceOracleState",
        args,
      },
      onResult: (
        resp: ContractFunctionReturnType<
          typeof priceFeedCompressorAbi,
          "view",
          "getPriceOracleState"
        >,
      ) => {
        const { priceFeedMap, priceFeedTree } = resp;
        this.#loadState(priceFeedMap, priceFeedTree);
      },
    };
  }

  #loadState(
    entries: readonly PriceFeedMapEntry[],
    tree: readonly PriceFeedTreeNode[],
  ): void {
    this.#priceFeedTree.clear();
    this.mainPriceFeeds.clear();
    this.reservePriceFeeds.clear();
    this.mainPrices.clear();
    this.reservePrices.clear();

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
    this.sdk.setAddressLabel(address, oldLabel => {
      const symbol = this.tokensMeta.symbol(token);
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
   * {@inheritDoc IPriceOracleContract.watchAddresses}
   **/
  public override get watchAddresses(): Set<Address> {
    return new Set([this.address]);
  }

  /**
   * {@inheritDoc IPriceOracleContract.stateHuman}
   **/
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
