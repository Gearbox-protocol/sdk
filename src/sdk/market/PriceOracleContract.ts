import type { Address, Hex } from "viem";
import { decodeFunctionData } from "viem";

import { iUpdatablePriceFeedAbi, priceOracleV3Abi } from "../abi";
import type { PriceFeedTreeNode, PriceOracleData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PriceOracleState } from "../state";
import { AddressMap } from "../utils";
import type {
  IPriceFeedContract,
  PriceFeedUsageType,
  UpdatePriceFeedsResult,
} from "./pricefeeds";
import { PriceFeedRef } from "./pricefeeds";

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
        main ? this.mainPriceFeeds[t].priceFeed : undefined,
        reserve ? this.reservePriceFeeds[t].priceFeed : undefined,
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

  // async loadPrices(
  //   priceUpdatesTxs: Array<RawTx>,
  //   block: bigint,
  // ): Promise<{
  //   mainPrices: Record<Address, bigint>;
  //   reservePrices: Record<Address, bigint>;
  // }> {
  //   const priceUpdateCalls: Array<MultiCallStruct> = priceUpdatesTxs.map(
  //     tx => ({
  //       target: tx.to,
  //       callData: tx.callData,
  //       allowFailure: false,
  //     }),
  //   );

  //   const getPricesRawCalls = (reserve: boolean): Array<MultiCallStruct> => {
  //     return Object.keys(
  //       reserve ? this.reservePriceFeeds : this.mainPriceFeeds,
  //     ).map(token => ({
  //       target: this.address,
  //       callData: encodeFunctionData({
  //         functionName: "getPriceRaw",
  //         args: [token as Address, reserve],
  //         abi: this.abi,
  //       }),
  //       allowFailure: true,
  //     }));
  //   };

  //   const { result } = await this.v3.publicClient.simulateContract({
  //     address: MULTICALL_ADDRESS,
  //     abi: multicall3Abi,
  //     functionName: "aggregate3",
  //     args: [
  //       [
  //         ...priceUpdateCalls,
  //         ...getPricesRawCalls(false),
  //         ...getPricesRawCalls(true),
  //       ],
  //     ],
  //     chain: this.v3.publicClient.chain!,
  //     account: this.v3.walletClient.account!,
  //     gas: 550_000_000n,
  //     // blockNumber: BigInt(block),
  //   });

  //   const returnRawPrices = (
  //     result as Array<{ success: boolean; returnData: Hex }>
  //   ).slice(priceUpdateCalls.length);

  //   const prices = returnRawPrices.map(callReturn =>
  //     callReturn.success
  //       ? decodeFunctionResult({
  //           functionName: "getPrice",
  //           abi: this.abi,
  //           data: callReturn.returnData! as Hex,
  //         })
  //       : 0n,
  //   ) as Array<bigint>;

  //   const mainPrices: Record<Address, bigint> = {};
  //   const reservePrices: Record<Address, bigint> = {};

  //   const mainPFlength = Object.keys(this.mainPriceFeeds).length;

  //   prices.forEach((price, i) => {
  //     if (i < mainPFlength) {
  //       mainPrices[Object.keys(this.mainPriceFeeds)[i] as Address] = price;
  //     } else {
  //       reservePrices[
  //         Object.keys(this.reservePriceFeeds)[i - mainPFlength] as Address
  //       ] = price;
  //     }
  //   });

  //   return { mainPrices, reservePrices };
  // }

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
