import type { Address } from "viem";
import type { MarketConfiguratorContract } from "../../../index.js";
import type { GipBuilderContext } from "../actions/context.js";
import type { MarketActions } from "../actions/index.js";
import { marketActionsMap } from "../actions/index-data.js";
import type { ConfiguratorActions } from "../configurator-actions/index.js";
import { configuratorActionsMap } from "../configurator-actions/index-data.js";
import type { ConfiguratorTx } from "../configurator-actions/types.js";
import type { MarketState } from "../market-state/types.js";
import type { MarketStateChanges, ParsedMarketTx } from "../market-tx.js";
import { estimateActionGas } from "../transactions/estimate-action-gas.js";
import { getActionTouchedFeeds } from "../transactions/get-action-touched-feeds.js";

export class MarketExecutor {
  public readonly mc: MarketConfiguratorContract;
  public readonly ctx: GipBuilderContext;

  constructor(ctx: GipBuilderContext) {
    this.mc = ctx.marketConfigurator;
    this.ctx = ctx;
  }

  async executeBatch(
    before: MarketState | undefined,
    actions: MarketActions[],
  ): Promise<MarketStateChanges> {
    let initialState = before;
    let currentState = before;

    const txs: ParsedMarketTx[] = [];

    for (let i = 0; i < actions.length; i++) {
      const a: MarketActions = actions[i];

      const actionData = marketActionsMap[a.type];
      if (currentState === undefined) {
        if (a.type === "MARKET::createMarket" && i === 0) {
          const treasury = await this.mc.treasury();
          currentState = {
            // @note if market is deployed in newly deployed it is not necessary
            // to keep actual treasury state
            treasury: {
              address: treasury,
              type: "TREASURY",
              balances: {},
            },
          } as MarketState;
        } else {
          throw new Error("Market state is undefined");
        }
      }

      const { tx } = await actionData.getRawTx({
        ctx: this.ctx,
        state: currentState,
        action: a,
      });

      currentState = actionData.stateTransition({
        state: currentState,
        params: a.params,
        newContract: tx.newContract,
      });

      const estimatedGas = estimateActionGas({
        action: a,
        afterState: currentState,
      });
      const touchedFeed = getActionTouchedFeeds({
        action: a,
        afterState: currentState,
      });

      if (a.type === "MARKET::createMarket") {
        initialState = currentState;
      }

      txs.push({
        ...tx,
        estimatedGas,
        touchedFeed,
        decoded: this.mc.parseFunctionData(tx.tx.callData),
      });
    }

    if (currentState === undefined) {
      throw new Error("Market state is undefined");
    }

    return { before: initialState!, after: currentState, txs };
  }

  async executeConfiguratorTxs(
    actions: ConfiguratorActions[],
  ): Promise<ConfiguratorTx[]> {
    const txs: ConfiguratorTx[] = [];

    for (let i = 0; i < actions.length; i++) {
      const a: ConfiguratorActions = actions[i];
      const actionData = configuratorActionsMap[a.type];
      const { tx } = await actionData.getRawTx({
        ctx: this.ctx,
        action: a,
      });
      txs.push(tx);
    }

    return txs;
  }

  convertToUnderlyingDecimals(state: MarketState, amount: number): bigint {
    const underlyingDecimals = this.decimals(state.underlyingAsset);
    return BigInt(amount) * BigInt(10 ** underlyingDecimals);
  }

  decimals(token: Address): number {
    return this.ctx.tokens.decimals(token);
  }
}
