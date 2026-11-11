import type { OnchainSDK, PluginsMap } from "../../index.js";
import { AbstractAdapterContract } from "../../market/adapters/contracts/AbstractAdapter.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * Has every adapter called in `multicall` read what it needs to replay its
 * call, see {@link AbstractAdapterContract.loadReplayState}. Runs before
 * {@link replayInnerOperations}, which cannot wait on the chain.
 */
export async function loadAdapterReplayState<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  multicall: InnerOperation[],
): Promise<void> {
  await Promise.all(
    multicall.map(op => {
      if (op.operation !== "Execute") {
        return undefined;
      }
      const adapter = sdk.getContract(op.adapter);
      return adapter instanceof AbstractAdapterContract
        ? adapter.loadReplayState(op.calldata)
        : undefined;
    }),
  );
}
