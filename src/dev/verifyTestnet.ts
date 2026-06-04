import type { Address, PublicClient } from "viem";

/**
 * Address is stable, contract deployed via create2
 */
export const ONCHAIN_EXECUTION_ID_ADDRESS: Address =
  "0x34131bc13eaa4ef5f98c2a423f93bc88d6ee01ba";

/**
 * This contract is deployed on every Gearbox testnet and contains
 * execution id and alias of the testnet
 */
export const iOnchainExecutionIdAbi = [
  {
    type: "function",
    name: "deployer",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "executionId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "forkAlias",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "info",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ExecutionId.Info",
        components: [
          {
            name: "deployer",
            type: "string",
            internalType: "string",
          },
          {
            name: "executionId",
            type: "string",
            internalType: "string",
          },
          {
            name: "forkAlias",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

export type VerifyTestnetParams =
  | {
      executionId: string;
    }
  | { alias: string }
  | { executionId: string; alias: string };

/**
 * Tries to read the contract that is deployed on every Gearbox testnet
 * and verify that we're on expected testnet.
 *
 * Used to check that wallet is using correct RPC for the testnet.
 *
 * @param client - Public client
 * @param expected - Expected tesnet alias or execution id
 * @returns True if we're on expected testnet
 */
export async function verifyTestnet(
  client: PublicClient,
  expected: VerifyTestnetParams,
): Promise<boolean> {
  try {
    const { deployer, executionId, forkAlias } = await client.readContract({
      abi: iOnchainExecutionIdAbi,
      address: ONCHAIN_EXECUTION_ID_ADDRESS,
      functionName: "info",
    });
    if (deployer !== "anvil-manager") {
      return false;
    }
    if (
      "executionId" in expected &&
      expected.executionId &&
      expected.executionId !== executionId
    ) {
      return false;
    }
    if ("alias" in expected && expected.alias && expected.alias !== forkAlias) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
