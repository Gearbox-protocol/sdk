import type {
  Block,
  Chain,
  Client,
  Hex,
  Prettify,
  PublicClient,
  TestActions,
  TestRpcSchema,
  Transport,
  WalletClient,
} from "viem";
import { createTestClient, publicActions, toHex, walletActions } from "viem";

import type { NetworkType } from "../../chain";
import { detectNetwork } from "./detectNetwork";

interface AnvilNodeInfo {
  currentBlockNumber: string; // hexutil.Big is a big number in hex format
  currentBlockTimestamp: number;
  currentBlockHash: string;
  hardFork: string;
  transactionOrder: string;
  environment: {
    baseFee: string; // big.Int is a big number, represented as string in JSON
    chainId: number;
    gasLimit: string;
    gasPrice: string;
  };
  forkConfig: {
    forkUrl: string;
    forkBlockNumber: string;
    forkRetryBackoff: number;
  };
}

type AnvilRPCSchema = [
  ...TestRpcSchema<"anvil">,
  {
    Method: "anvil_nodeInfo";
    Parameters: [];
    ReturnType: AnvilNodeInfo;
  },
  {
    Method: "evm_mine_detailed";
    Parameters: [Hex];
    ReturnType: Block<Hex>[];
  },
];

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AnvilActions = {
  isAnvil: () => Promise<boolean>;
  detectNetwork: () => Promise<NetworkType>;
  evmMineDetailed: (timestamp: bigint) => Promise<Block<Hex> | undefined>;
};

export type AnvilClient = Prettify<
  { mode: "anvil" } & Client<
    Transport,
    Chain,
    undefined,
    AnvilRPCSchema,
    AnvilActions & TestActions
  >
> &
  PublicClient &
  WalletClient;

export interface AnvilClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
> {
  transport: transport;
  chain?: chain;
}

export function createAnvilClient({
  chain,
  transport,
}: AnvilClientConfig): AnvilClient {
  return createTestClient<"anvil", Transport, Chain, undefined, AnvilRPCSchema>(
    {
      chain,
      mode: "anvil",
      transport,
      cacheTime: 0,
    },
  )
    .extend(publicActions)
    .extend(walletActions)
    .extend(client => ({
      isAnvil: () => isAnvil(client),
      detectNetwork: () => detectNetwork(client),
      evmMineDetailed: (timestamp: bigint) =>
        evmMineDetailed(client, timestamp),
    })) as any;
}

/**
 * View action to detect if client is an anvil client
 * @param client
 * @returns
 */
export async function isAnvil(
  client: Client<any, any, any, AnvilRPCSchema, any>,
): Promise<boolean> {
  try {
    const resp = await client.request({
      method: "anvil_nodeInfo",
      params: [],
    });
    return !!resp.currentBlockNumber;
  } catch {
    return false;
  }
}

/**
 * Safely tries to mine block with given timestamp
 * @param client
 * @param timestamp in seconds
 * @returns
 */
export async function evmMineDetailed(
  client: Client<any, any, any, AnvilRPCSchema, any>,
  timestamp: bigint,
): Promise<Block<Hex> | undefined> {
  try {
    const [block] = await client.request({
      method: "evm_mine_detailed",
      params: [toHex(timestamp)],
    });
    return block;
  } catch {
    return undefined;
  }
}
