/**
 * kpk #116 "frxUSD market": creates the frxUSD market, its debt limits, and
 * its first credit suite.
 *
 * `session.newMarket(params)` records `MARKET::createMarket` as the builder's first
 * action. The credit suite gets an id, so its debt limit can name it as
 * `suite:frxusd-core` before the suite's address is known.
 **/
import type { GipReproduction } from "../types.js";

const FRXUSD = "0xcacd6fd266af91b8aed52accc382b4e165586e29";
const FRXUSD_PRICE_FEED = "0x4e6bfde947c781861a874353a2f08db0f9b8f59c";

export const kpk116FrxusdMarket: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-116",
    name: "frxUSD market",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0xf0cf1e3ec6264b03241826f5b2abda17b4352a75",
    eta: 1787775000,
    executedAtBlock: 25841832n,
    timelockTxHashes: [
      "0x15f5c9ebb0ee792b0fa30b9a387500535750039970771c9f369a40cb4b5acfb8",
      "0x105da4f83c16fa9e055c57bd0aec1d994c8034a74bb5a2514dd4fd0854b57377",
      "0x47d1c74610f387ff0341c97e6c4b2510354c449745cd811c8a60c1f7696a6778",
      "0xa427a68e0e3358f659f2c6b3083ba3c871adaaa5fafbad776764f0ab3a4a9c7d",
      "0x4070d748d494e63154fbb5028ad59430a7c67e355aff221e66d793a0cad25f48",
    ],
  },
  assemble: session => [
    session
      .newMarket({
        minorVersion: 310,
        name: "frxUSD Market",
        symbol: "KPKfrxUSD",
        underlying: FRXUSD,
        underlyingPriceFeed: FRXUSD_PRICE_FEED,
        interestRateModel: {
          type: "LINEAR",
          salt: "0xbf5ccffa60f016fe282e18661ba3615205c01e353504e41d4d52878ea0a8fa02",
          params: {
            U_1: 70,
            U_2: 90,
            R_base: 2,
            R_slope1: 3,
            R_slope2: 3,
            R_slope3: 30,
            isBorrowingMoreU2Forbidden: false,
          },
        },
        rateKeeperParams: { type: "TUMBLER", epochSeconds: 0 },
        lossPolicyParams: { type: "ALIAS" },
      })
      .addAction({
        type: "POOL::setTotalDebtLimit",
        params: { limit: 5_000_000 },
      })
      .addAction({ type: "RATE_KEEPER::TUMBLER::updateRates", params: {} })
      .addAction({
        type: "MARKET::createCreditSuite",
        params: {
          id: "frxusd-core",
          name: "frxUSD core",
          minorVersion: 310,
          maxEnabledTokens: 4,
          feeInterest: 20,
          feeLiquidation: 1,
          feeLiquidationPremium: 4,
          feeLiquidationExpired: 1,
          feeLiquidationPremiumExpired: 4,
          minDebt: 500_000,
          maxDebt: 5_000_000,
          accountFactoryType: "DEFAULT",
          isExpired: false,
          expirationDate: 0,
          whitelistPolicy: "0x0000000000000000000000000000000000000000",
        },
      })
      .addAction({
        type: "POOL::setCreditManagerDebtLimit",
        params: { creditManager: "suite:frxusd-core", limit: 5_000_000 },
      }),
  ],
};
