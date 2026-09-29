import { type Abi, type Address, zeroAddress } from "viem";
import type {
  AbstractAdapterContract,
  CreditSuite,
} from "../../../../onchain/index.js";
import type { InfinifiAdapterState } from "../../plugins/adapters/infinifi/index.js";
import {
  type AdapterState,
  type AdapterType,
  adapterPlugins,
} from "../../plugins/adapters/logic.js";
import type { MellowClaimerAdapterState } from "../../plugins/adapters/mellow-claimer/index.js";

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
];

const infinifiAdapterAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "lockedToken",
        type: "address",
      },
    ],
    name: "lockedTokenToUnwindingEpoch",
    outputs: [
      {
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
  },
];

/**
 * Updates the MellowClaimer adapter state with the correct multiVault mappings
 * by calling phantomTokenToMultiVault for each collateral token
 */
async function updateMellowClaimerVaultMappings(
  cm: CreditSuite,
  adapterAddress: Address,
  adapterStateRef: MellowClaimerAdapterState,
): Promise<void> {
  const collateralTokens = cm.creditManager.collateralTokens;

  if (
    !collateralTokens ||
    !Array.isArray(collateralTokens) ||
    collateralTokens.length === 0
  ) {
    return;
  }

  const client = cm.sdk.client;

  const results = await client.multicall({
    contracts: collateralTokens.map(token => ({
      address: adapterAddress,
      abi: mellowClaimerAdapterAbi as Abi,
      functionName: "phantomTokenToMultiVault",
      args: [token],
      allowFailure: true,
    })),
  });

  if (!results || results.length === 0) {
    return;
  }

  const multiVaultToStakedToken = new Map<Address, Address>();
  for (let i = 0; i < results.length; i++) {
    if (
      results[i] &&
      results[i].status === "success" &&
      results[i].result &&
      results[i].result !== zeroAddress
    ) {
      multiVaultToStakedToken.set(
        (results[i].result as string).toLowerCase() as Address,
        collateralTokens[i].toLowerCase() as Address,
      );
    }
  }

  if (!adapterStateRef.vaults || adapterStateRef.vaults.length === 0) {
    return;
  }

  for (let i = 0; i < adapterStateRef.vaults.length; i++) {
    const vault = adapterStateRef.vaults[i];
    const multiVault = vault.multiVault.toLowerCase() as Address;
    if (multiVaultToStakedToken.has(multiVault)) {
      vault.stakedToken = multiVaultToStakedToken.get(multiVault) as Address;
    }
  }
}

/**
 * Updates the MellowClaimer adapter state with the correct multiVault mappings
 * by calling phantomTokenToMultiVault for each collateral token
 */
async function updateInfinifiMappings(
  cm: CreditSuite,
  adapterAddress: Address,
  adapterStateRef: InfinifiAdapterState,
): Promise<void> {
  const client = cm.sdk.client;

  const results = await client.multicall({
    contracts: adapterStateRef.lockedTokens.map(token => ({
      address: adapterAddress,
      abi: infinifiAdapterAbi as Abi,
      functionName: "lockedTokenToUnwindingEpoch",
      args: [token],
      allowFailure: true,
    })),
  });

  for (let i = 0; i < adapterStateRef.lockedTokens.length; ++i) {
    const lockedToken = adapterStateRef.lockedTokens[i];
    lockedToken.unwindingEpochs = results[i].result as number;
  }
}

/**
 * Builds the adapters state for a credit manager using SDK plugin adapters
 */
export async function buildAdaptersState(
  cm: CreditSuite,
): Promise<Record<Address, AdapterState>> {
  const adapters = Array.from(cm.creditManager.adapters.values());
  const result: Record<Address, AdapterState> = {};

  for (const adapter of adapters) {
    const adapterTypeFull = adapter.contractType.split("::");
    const adapterType = adapterTypeFull[1] as AdapterType;

    result[adapter.targetContract.toLowerCase() as Address] = adapterPlugins[
      adapterType
    ].getStateFromSDK(adapter as AbstractAdapterContract<Abi, Abi>);

    // workaround to get full state of MELLOW_CLAIMER,
    // since this adapter doesn't return phantom tokens in serialized state
    if (adapterType === "MELLOW_CLAIMER") {
      const adapterStateRef = result[
        adapter.targetContract.toLowerCase() as Address
      ] as MellowClaimerAdapterState;

      await updateMellowClaimerVaultMappings(
        cm,
        adapter.address,
        adapterStateRef,
      );
    }
    if (
      adapterType === "INFINIFI_GATEWAY" ||
      adapterType === "INFINIFI_UNWINDING"
    ) {
      const adapterStateRef = result[
        adapter.targetContract.toLowerCase() as Address
      ] as InfinifiAdapterState;

      await updateInfinifiMappings(cm, adapter.address, adapterStateRef);
    }
  }

  return result;
}
