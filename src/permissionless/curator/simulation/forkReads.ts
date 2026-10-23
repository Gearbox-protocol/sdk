/** Reading an executed fork back. **/

import type { Address, Chain, PublicClient, Transport } from "viem";
import { getNetworkType, OnchainSDK } from "../../../onchain/index.js";
import type { GipSimulationFailure } from "./GipSimulationError.js";
import type { GipSimulationComparison } from "./simulateGipOnFork.js";

/** A fresh SDK attached to the fork's current (post-execution) state. **/
export async function attachForkSdk(args: {
  client: PublicClient<Transport, Chain>;
  chainId: number;
  marketConfigurator: Address;
  /** Override when the fork is not on a known deployment. **/
  addressProvider?: Address;
}): Promise<OnchainSDK> {
  const sdk = new OnchainSDK(
    getNetworkType(args.chainId),
    { client: args.client as never },
    {},
  );
  await sdk.attach({
    ...(args.addressProvider ? { addressProvider: args.addressProvider } : {}),
    marketConfigurators: [args.marketConfigurator],
    ignoreUpdateablePrices: true,
  });
  return sdk;
}

/** The states a comparison could not read, as structured failures. **/
export function readFailures(
  comparison: Pick<GipSimulationComparison, "markets" | "configurator">,
  marketConfigurator: Address,
): GipSimulationFailure[] {
  const failures: GipSimulationFailure[] = [];
  for (const market of comparison.markets) {
    if (market.readError) {
      failures.push({
        phase: "read",
        reason: market.readError,
        target: market.address,
      });
    }
  }
  if (comparison.configurator?.readError) {
    failures.push({
      phase: "read",
      reason: comparison.configurator.readError,
      target: marketConfigurator,
    });
  }
  return failures;
}
