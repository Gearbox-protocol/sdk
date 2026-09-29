import type { MarketConfiguratorContract } from "../../../index.js";
import type { GipBuilderContext } from "../actions/context.js";
import type { ConfiguratorActions } from "../configurator-actions/index.js";
import { configuratorActionsMap } from "../configurator-actions/index-data.js";
import type { ConfiguratorTx } from "../configurator-actions/types.js";
import type { ConfiguratorState } from "../configurator-state/types.js";

export interface ConfiguratorStateChanges {
  before: ConfiguratorState;
  after: ConfiguratorState;
  txs: ConfiguratorTx[];
}

export class ConfigurationExecutor {
  public readonly mc: MarketConfiguratorContract;
  public readonly ctx: GipBuilderContext;

  constructor(ctx: GipBuilderContext) {
    this.mc = ctx.marketConfigurator;
    this.ctx = ctx;
  }

  /**
   * Execute a batch of configurator actions and track state changes
   */
  async executeBatch(
    before: ConfiguratorState,
    actions: ConfiguratorActions[],
  ): Promise<ConfiguratorStateChanges> {
    let currentState = before;
    const txs: ConfiguratorTx[] = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const actionData = configuratorActionsMap[action.type];

      // Get the raw transaction
      const { tx } = await actionData.getRawTx({
        ctx: this.ctx,
        action,
      });

      // Apply state transition
      currentState = actionData.stateTransition({
        state: currentState,
        params: action.params,
        newContract: tx.newContract,
      });

      txs.push(tx);
    }

    return {
      before,
      after: currentState,
      txs,
    };
  }

  /**
   * Execute configurator actions without state tracking (just get transactions)
   */
  async executeConfiguratorTxs(
    actions: ConfiguratorActions[],
  ): Promise<ConfiguratorTx[]> {
    const txs: ConfiguratorTx[] = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const actionData = configuratorActionsMap[action.type];
      const { tx } = await actionData.getRawTx({
        ctx: this.ctx,
        action,
      });
      txs.push(tx);
    }

    return txs;
  }
}
