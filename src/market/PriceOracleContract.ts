import { getTokenSymbolOrTicker } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";
import { decodeFunctionData, encodeFunctionData } from "viem";

import {
  iCreditFacadeV3MulticallAbi,
  iUpdatablePriceFeedAbi,
  priceOracleV3Abi,
} from "../abi";
import type { PriceFeedTreeNode, PriceOracleData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PriceOracleState } from "../state";
import type { MultiCall } from "../types";
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

export class PriceOracleContract extends BaseContract<abi> {
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly mainPriceFeeds: Record<Address, PriceFeedRef> = {};
  /**
   * Mapping Token => [PriceFeed Address, stalenessPeriod]
   */
  public readonly reservePriceFeeds: Record<Address, PriceFeedRef> = {};

  readonly #priceFeedTree: readonly PriceFeedTreeNode[];

  constructor(sdk: GearboxSDK, data: PriceOracleData) {
    super(sdk, {
      address: data.baseParams.addr,
      contractType: data.baseParams.contractType,
      version: Number(data.baseParams.version),
      name: "PriceOracleV3",
      abi: priceOracleV3Abi,
    });
    const { priceFeedMapping, priceFeedStructure } = data;
    this.#priceFeedTree = priceFeedStructure;

    for (const node of priceFeedStructure) {
      sdk.priceFeeds.create(node);
    }

    priceFeedMapping.forEach(node => {
      const { token, priceFeed, reserve, stalenessPeriod } = node;
      const ref = new PriceFeedRef(sdk, priceFeed, stalenessPeriod);
      if (reserve) {
        this.reservePriceFeeds[token] = ref;
      } else {
        this.mainPriceFeeds[token] = ref;
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
  public async updateRedstonePriceFeeds(): Promise<UpdatePriceFeedsResult> {
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
   * @param priceUpdates
   * @returns
   */
  public onDemandPriceUpdates(
    creditFacade: Address,
    priceUpdates?: UpdatePriceFeedsResult,
  ): MultiCall[] {
    // TODO: really here I'm doing lots of reverse processing:
    // decooding RawTx into Redstone calldata
    // and then finding token + reserve value for a price feed
    // it would be much nicer to have intermediate format and get RawTx/OnDemandPriceUpdate/ViemMulticall from it (as it's done in liquidator)
    const result: MultiCall[] = [];
    if (!priceUpdates) {
      return result;
    }
    const { txs } = priceUpdates;

    for (const tx of txs) {
      const { to: priceFeed, callData } = tx;
      const [token, reserve] = this.#findTokenForPriceFeed(priceFeed);
      const { args } = decodeFunctionData({
        abi: iUpdatablePriceFeedAbi,
        data: callData,
      });
      const data = args[0]!;
      result.push({
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV3MulticallAbi,
          functionName: "onDemandPriceUpdate",
          args: [token, reserve, data],
        }),
      });
    }
    return result;
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
      let pricefeedTag = `${getTokenSymbolOrTicker(token)}.${usage}`;

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
