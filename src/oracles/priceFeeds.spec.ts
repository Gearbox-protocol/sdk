import { expect } from "chai";
import { BigNumber, ethers } from "ethers";

import { CHAINS, NetworkType } from "../core/chains";
import { SupportedToken } from "../tokens/token";
import { AggregatorV3Interface__factory } from "../types";
import { AggregatorV3InterfaceInterface } from "../types/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface";
import { formatBN } from "../utils/formatter";
import safeMulticall, { KeyedCall } from "../utils/multicall";
import { priceFeedsByToken } from "./priceFeeds";
import { PriceFeedData, PriceFeedType } from "./pricefeedType";

type PricesDict = Record<
  string,
  {
    error: boolean;
    value?:
      | {
          answer: BigNumber;
        }
      | undefined;
  }
>;

const iFeed = AggregatorV3Interface__factory.createInterface();

class PriceFeedsSuite {
  public readonly networkTypes: NetworkType[];
  public readonly calls: KeyedCall<AggregatorV3InterfaceInterface>[][];

  constructor(...networkTypes: NetworkType[]) {
    this.networkTypes = networkTypes;
    this.calls = networkTypes.map(c => this.collectCalls(c));
  }

  public async getAnswers(): Promise<PricesDict[]> {
    const providers = this.networkTypes.map(c => {
      const url = process.env[`${c.toUpperCase()}_TESTS_FORK`];
      if (!url) {
        throw new Error(`Provider for ${c} not found in env`);
      }
      return new ethers.providers.StaticJsonRpcProvider(url, CHAINS[c]);
    });

    const resps = await Promise.all(
      this.networkTypes.map((_, i) =>
        safeMulticall<{ answer: BigNumber }>(this.calls[i], providers[i]),
      ),
    );
    return resps.map((_, i) => this.buildDict(this.calls[i], resps[i]));
  }

  private collectCalls(
    c: NetworkType,
  ): KeyedCall<AggregatorV3InterfaceInterface>[] {
    const calls: KeyedCall<AggregatorV3InterfaceInterface>[] = [];
    for (const [symb, data] of Object.entries(priceFeedsByToken)) {
      calls.push(...this.getCallsForToken(c, symb as SupportedToken, data));
    }
    return calls;
  }

  private getCallsForToken(
    network: NetworkType,
    token: SupportedToken,
    data: PriceFeedData,
  ): KeyedCall<AggregatorV3InterfaceInterface>[] {
    const calls: KeyedCall<AggregatorV3InterfaceInterface>[] = [];
    switch (data.type) {
      case PriceFeedType.NETWORK_DEPENDENT:
        calls.push(
          ...this.getCallsForToken(network, token, data.feeds[network]),
        );
        break;
      case PriceFeedType.CHAINLINK_ORACLE:
        if (data.address.startsWith("0x")) {
          calls.push({
            address: data.address,
            interface: iFeed,
            method: "latestRoundData()",
            key: token,
          });
        }
        break;
      case PriceFeedType.BOUNDED_ORACLE:
        if (data.priceFeed.startsWith("0x")) {
          calls.push({
            address: data.priceFeed,
            interface: iFeed,
            method: "latestRoundData()",
            key: token,
          });
        }
        break;
      case PriceFeedType.COMPOSITE_ORACLE:
        if (data.baseToUsdPriceFeed.startsWith("0x")) {
          calls.push({
            address: data.baseToUsdPriceFeed,
            interface: iFeed,
            method: "latestRoundData()",
            key: `${token}.baseToUsdPriceFeed`,
          });
        }
        if (data.targetToBasePriceFeed.startsWith("0x")) {
          calls.push({
            address: data.targetToBasePriceFeed,
            interface: iFeed,
            method: "latestRoundData()",
            key: `${token}.targetToBasePriceFeed`,
          });
        }
        break;
    }
    return calls;
  }

  private buildDict<T>(
    calls: KeyedCall<AggregatorV3InterfaceInterface>[],
    responses: T[],
  ): Record<string, T> {
    return calls.reduce(
      (acc, call, i) => ({
        ...acc,
        [call.key]: responses[i],
      }),
      {} as Record<string, T>,
    );
  }
}

describe("Price feeds", () => {
  const suite = new PriceFeedsSuite("Mainnet", "Arbitrum");
  const PERCENTAGE_FACTOR = 1_00_00;
  const THRESHOLD = 100; // 1%
  let answers: PricesDict[] = [];

  before(async function (this) {
    this.timeout(10000);
    answers = await suite.getAnswers();
  });

  describe(`should not deviate for more than ${
    (100 * THRESHOLD) / PERCENTAGE_FACTOR
  }% from mainnet`, () => {
    // have to use suite.calls here, because answers are empty atm
    // this is how mocha works, it builds test tree before execution
    const [_, ...chainCalls] = suite.calls;

    for (let i = 0; i < chainCalls.length; i++) {
      const calls = chainCalls[i];
      const chain = suite.networkTypes[i + 1];
      for (const call of calls) {
        it(`${chain}.${call.key} deviation`, () => {
          const mainDict = answers[0];
          const chainDict = answers[i + 1];

          const chainPrice = chainDict[call.key].value?.answer;
          const mainPrice = mainDict[call.key]?.value?.answer;
          if (!mainPrice) {
            // some tokens do not exist on mainnet
            return;
          }
          const deviation = chainPrice
            ?.sub(mainPrice)
            .mul(PERCENTAGE_FACTOR)
            .div(mainPrice)
            .abs()
            .toNumber();
          // console.log(
          //   call.key,
          //   deviation,
          //   chainPrice?.toNumber(),
          //   mainPrice.toNumber(),
          // );
          expect(
            deviation,
            `Mainnet price: ${formatBN(
              mainPrice,
              8,
            )}$, ${chain} price: ${formatBN(chainPrice, 8)}$ at ${
              call.address
            }`,
          ).to.be.below(THRESHOLD);
        });
      }
    }
  });
});
