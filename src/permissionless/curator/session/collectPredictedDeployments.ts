import type { MarketTx } from "../types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import type { PredictedDeployment } from "./types.js";

/** Contracts the given transactions are expected to deploy. **/
export function collectPredictedDeployments(
  txs: readonly MarketTx[],
): PredictedDeployment[] {
  return txs.flatMap((tx, actionIndex) =>
    tx.newContract
      ? [
          {
            address: lowerAddress(tx.newContract),
            actionIndex,
            actionType: tx.action.type,
            // The Bytecode Repository address is a CREATE2 derivation; the
            // configurator's own deployments are previewed on chain.
            prediction:
              tx.action.type === "BCR::deployContract"
                ? ("create2" as const)
                : ("preview" as const),
          },
        ]
      : [],
  );
}
