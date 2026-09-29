import type { Address } from "viem";
import type { OnchainSDK } from "../../../onchain/index.js";
import type { Bundle } from "../bundles/types.js";
import type { GipBuilderContext } from "./actions/context.js";
import type { MarketActions } from "./actions/index.js";
import { applyBundle } from "./bundles/apply-bundle.js";
import {
  type BundleCustomization,
  customizeBundle,
} from "./bundles/customize-bundle.js";
import { MarketExecutor } from "./executor/market-executor.js";
import { getMarketState } from "./market-state/market-state.js";
import type { MarketState } from "./market-state/types.js";
import type { ParsedMarketTx } from "./market-tx.js";
import { batchMarketTransactions } from "./transactions/batch-market-txs.js";
import { getTimelockTransactions } from "./transactions/get-timelock-txs.js";

/** The SDK is attached by the caller, so the builder does not choose an RPC. */
export function createGipBuilder(ctx: GipBuilderContext & { sdk: OnchainSDK }) {
  const executor = new MarketExecutor(ctx);
  return {
    getMarketState(pool: Address) {
      return getMarketState(ctx.sdk, ctx.marketConfigurator.address, pool);
    },
    async applyBundle(args: {
      actions: MarketActions[];
      initialState: MarketState | undefined;
      bundle: Bundle;
      target?: Address;
    }) {
      const currentState = (
        await executor.executeBatch(args.initialState, args.actions)
      ).after;
      return applyBundle({
        actions: args.actions,
        currentState,
        bundle: args.bundle,
        targetCmAddress: args.target,
      });
    },
    customizeBundle(bundle: Bundle, options: BundleCustomization) {
      return customizeBundle(bundle, options);
    },
    replay(args: {
      initialState: MarketState | undefined;
      actions: MarketActions[];
    }) {
      return executor.executeBatch(args.initialState, args.actions);
    },
    async buildTimelockTxs(args: {
      txs: ParsedMarketTx[];
      eta: number;
      author: Address;
    }) {
      const chainId = ctx.client.chain?.id ?? (await ctx.client.getChainId());
      return getTimelockTransactions({
        client: ctx.client,
        marketConfigurator: ctx.marketConfigurator.address,
        batches: batchMarketTransactions({
          chainId,
          txs: args.txs,
        }),
        eta: args.eta,
        author: args.author,
        sdk: ctx.sdk,
      });
    },
  };
}
