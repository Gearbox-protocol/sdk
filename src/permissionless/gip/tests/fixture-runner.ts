// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zeroAddress } from "viem";
import { MarketConfiguratorContract } from "../../index.js";
import { applyBundle, MarketExecutor } from "../index.js";

const root = fileURLToPath(new URL("../bundles/catalog/", import.meta.url));
const pool = "0x1111111111111111111111111111111111111111";
const creditManager = "0x2222222222222222222222222222222222222222";
const configurator = "0x3333333333333333333333333333333333333333";
const addressProvider = "0x4444444444444444444444444444444444444444";
const decimalsByToken = {
  "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb": 6,
  "0x0b2c639c533813f4aa9d7837caf62653d097ff85": 6,
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6,
  "0xdac17f958d2ee523a2206206994597c13d831ec7": 6,
  "0x4c9edd5852cd905f086c759e8383e09bff1e68b3": 6,
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 8,
};
function initialState(underlying) {
  return {
    minorVersion: 310,
    address: pool,
    symbol: "GPOOL",
    name: "GPOOL",
    underlyingAsset: underlying,
    underlyingPriceFeed: zeroAddress,
    totalDebtLimit: "Unlimited",
    creditManagerDebtLimit: {},
    assets: {},
    creditManagers: {},
    treasury: { address: configurator, type: "TREASURY", balances: {} },
    rateKeeper: { type: "TUMBLER", epochSeconds: 0, rates: {} },
    lossPolicy: { type: "ALIAS", enabled: true, aliases: {}, mode: 0 },
    interestRateModel: {
      type: "LINEAR",
      params: {
        U_1: 70,
        U_2: 90,
        R_base: 0,
        R_slope1: 5,
        R_slope2: 20,
        R_slope3: 100,
        isBorrowingMoreU2Forbidden: true,
      },
    },
    paused: false,
    periphery: [],
  };
}
export async function computeBundleFixtures() {
  const failures = [],
    results = {};
  for (const chain of ["mainnet", "plasma", "optimism", "monad"]) {
    for (const file of fs
      .readdirSync(path.join(root, chain))
      .filter(x => x.endsWith(".json"))) {
      const data = JSON.parse(
        fs.readFileSync(path.join(root, chain, file), "utf8"),
      );
      const underlying = data.tokensIn[0].toLowerCase();
      const bundle = {
        name: data.name,
        actions: data.actions,
        tokenIn: data.tokensIn,
        tokenOut: data.tokensOut,
        enabledTokens: data.maxEnabledTokens,
        warning: undefined,
      };
      const client = {
        chain: {
          id: { mainnet: 1, plasma: 9745, optimism: 10, monad: 143 }[chain],
        },
        readContract: async ({ functionName }) => {
          if (functionName === "addressProvider") return addressProvider;
          if (functionName === "previewCreateCreditSuite") return creditManager;
          throw Error("Unexpected RPC " + functionName);
        },
      };
      const marketConfigurator = new MarketConfiguratorContract(
        configurator,
        client,
      );
      const ctx = {
        client,
        marketConfigurator,
        tokens: {
          decimals: token => decimalsByToken[token.toLowerCase()] ?? 18,
        },
      };
      try {
        const state = initialState(underlying);
        const actions = applyBundle({
          actions: [],
          currentState: state,
          bundle,
          targetCmAddress: creditManager,
        });
        const { after, txs } = await new MarketExecutor(ctx).executeBatch(
          state,
          actions,
        );
        results[`${chain}/${file}`] = {
          name: data.name,
          actions: actions.map(x => x.type),
          calldata: txs.map(x => x.tx.callData),
          after,
        };
      } catch (e) {
        if (
          `${chain}/${file}` === "mainnet/teth-strategy.json" &&
          e.message === "Market action type not found"
        ) {
          results[`${chain}/${file}`] = {
            unsupportedAction: "ADAPTER::BALANCER_VAULT::setPoolStatus",
          };
        } else failures.push(`${chain}/${file}: ${e.stack}`);
      }
    }
  }
  if (failures.length) throw new Error(failures.join("\n"));
  return results;
}
