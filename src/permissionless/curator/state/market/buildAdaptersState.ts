import {
  type Abi,
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import type {
  AbstractAdapterContract,
  CreditSuite,
} from "../../../../onchain/index.js";
import { GipRegistry } from "../../GipRegistry.js";
import { sdkState } from "../../plugins/adapters/adapterPluginHelpers.js";
import type { AdapterState } from "../../plugins/adapters/builtinAdapterPlugins.js";
import type { AdapterStateBase } from "../../plugins/adapters/defineAdapterPlugin.js";
import type { MellowClaimerAdapterState } from "../../plugins/adapters/mellow-claimer/mellowClaimerAdapterPlugin.js";
import { lowerAddress } from "../../utils/addressUtils.js";

const mellowClaimerAdapterAbi = [
  {
    inputs: [
      {
        name: "stakedPhantomToken",
        type: "address",
      },
    ],
    name: "phantomTokenToMultiVault",
    outputs: [
      {
        name: "multiVault",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Fills in the staked token of every MellowClaimer vault.
 *
 * The adapter's serialized state lists its multi vaults but not their staked
 * phantom tokens, so each collateral token is asked which multi vault it
 * belongs to. Vaults no collateral token maps to are left as they are.
 **/
async function withMellowClaimerStakedTokens(
  cm: CreditSuite,
  adapterAddress: Address,
  state: MellowClaimerAdapterState,
  readClient?: PublicClient<Transport, Chain>,
): Promise<MellowClaimerAdapterState> {
  const collateralTokens = cm.creditManager.collateralTokens;
  if (collateralTokens.length === 0 || state.vaults.length === 0) {
    return state;
  }

  const client = readClient ?? cm.sdk.client;
  const results = await client.multicall({
    allowFailure: true,
    contracts: collateralTokens.map(token => ({
      address: adapterAddress,
      abi: mellowClaimerAdapterAbi,
      functionName: "phantomTokenToMultiVault" as const,
      args: [token] as const,
    })),
  });

  const stakedTokenByMultiVault = new Map<Address, Address>();
  results.forEach((result, index) => {
    if (result.status === "success" && result.result !== zeroAddress) {
      stakedTokenByMultiVault.set(
        lowerAddress(result.result),
        lowerAddress(collateralTokens[index]),
      );
    }
  });

  return {
    ...state,
    vaults: state.vaults.map(vault => ({
      ...vault,
      stakedToken:
        stakedTokenByMultiVault.get(lowerAddress(vault.multiVault)) ??
        vault.stakedToken,
    })),
  };
}

/**
 * Builds the adapters state for a credit manager using SDK plugin adapters.
 *
 * An adapter whose type has no plugin in `registry` gets the state every
 * adapter has, so a market using it can still be read and diffed.
 **/
export async function buildAdaptersState(
  cm: CreditSuite,
  readClient?: PublicClient<Transport, Chain>,
  registry: GipRegistry = GipRegistry.builtin,
): Promise<Record<Address, AdapterState | AdapterStateBase>> {
  const result: Record<Address, AdapterState | AdapterStateBase> = {};

  for (const adapter of cm.creditManager.adapters.values()) {
    // `ADAPTER::<type>`
    const adapterType = adapter.contractType.split("::")[1];
    const sdkAdapter = adapter as AbstractAdapterContract<Abi, Abi>;
    const state =
      registry.adapter(adapterType)?.getStateFromSDK(sdkAdapter) ??
      sdkState(adapterType, sdkAdapter);

    result[lowerAddress(adapter.targetContract)] =
      adapterType === "MELLOW_CLAIMER"
        ? await withMellowClaimerStakedTokens(
            cm,
            adapter.address,
            state as MellowClaimerAdapterState,
            readClient,
          )
        : state;
  }

  return result;
}
