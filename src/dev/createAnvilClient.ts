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
import { createPublicClient, testActions, toHex, walletActions } from "viem";

export interface AnvilNodeInfo {
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

export type AnvilRPCSchema = [
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

export type AnvilActions = {
  anvilNodeInfo: () => Promise<AnvilNodeInfo>;
  isAnvil: () => Promise<boolean>;
  evmMineDetailed: (
    /**
     * Block timestamp in seconds
     */
    timestamp: bigint | number,
  ) => Promise<Block<Hex> | undefined>;
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
  cacheTime?: number;
  pollingInterval?: number;
}

export function extendAnvilClient(client: PublicClient): AnvilClient {
  return client
    .extend(testActions({ mode: "anvil" }))
    .extend(walletActions)
    .extend(c => ({
      anvilNodeInfo: () => anvilNodeInfo(c),
      isAnvil: () => isAnvil(c),
      evmMineDetailed: (timestamp: bigint | number) =>
        evmMineDetailed(c, timestamp),
    })) as any;
}

export function createAnvilClient({
  chain,
  transport,
  cacheTime = 0,
  pollingInterval = 50,
}: AnvilClientConfig): AnvilClient {
  const client = createPublicClient({
    chain,
    transport,
    cacheTime,
    pollingInterval,
  });
  return extendAnvilClient(client);
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
 * Anvil node info
 * @param client
 * @returns
 */
export async function anvilNodeInfo(
  client: Client<any, any, any, AnvilRPCSchema, any>,
): Promise<AnvilNodeInfo> {
  return client.request({
    method: "anvil_nodeInfo",
    params: [],
  });
}

/**
 * Safely tries to mine block with given timestamp
 * @param client
 * @param timestamp in seconds
 * @returns
 */
export async function evmMineDetailed(
  client: Client<any, any, any, AnvilRPCSchema, any>,
  timestamp: bigint | number,
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
