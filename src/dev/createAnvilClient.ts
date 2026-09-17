import type {
  Abi,
  Account,
  Address,
  Block,
  Chain,
  Client,
  ContractFunctionArgs,
  ContractFunctionName,
  Hex,
  Prettify,
  PublicClient,
  TestActions,
  TestClient,
  TestRpcSchema,
  Transport,
  WalletClient,
  WriteContractSyncParameters,
  WriteContractSyncReturnType,
} from "viem";
import {
  BaseError,
  createTestClient,
  publicActions,
  testActions,
  toHex,
  walletActions,
} from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { getAction } from "viem/utils";

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

export interface AnvilDealParameters {
  /**
   * ERC20 token address.
   */
  erc20: Address;
  /**
   * Account that should receive the tokens.
   */
  account: Account | Address;
  /**
   * Token amount in raw units (no decimals applied).
   */
  amount: bigint;
}

export type AnvilActions = {
  anvilNodeInfo: () => Promise<AnvilNodeInfo>;
  isAnvil: () => Promise<boolean>;
  evmMineDetailed: (
    /**
     * Block timestamp in seconds
     */
    timestamp: bigint | number,
  ) => Promise<Block<Hex> | undefined>;
  /**
   * Deals ERC20 tokens to an account by overriding the storage of
   * `balanceOf(account)`. Requires `viem-deal` as a peer dependency.
   */
  deal: (params: AnvilDealParameters) => Promise<void>;
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

let dealModulePromise: Promise<typeof import("viem-deal") | null> | undefined;

async function loadDeal(): Promise<typeof import("viem-deal").deal> {
  // Cache the dynamic import (and any failure) so we only pay the resolve cost
  // once even when `deal` is called many times.
  dealModulePromise ??= import("viem-deal").catch(() => null);
  const mod = await dealModulePromise;
  if (!mod) {
    throw new Error(
      "createAnvilClient: deal action requires the 'viem-deal' package; install it as a dependency",
    );
  }
  return mod.deal;
}

function anvilActions(client: Client) {
  return {
    anvilNodeInfo: () => anvilNodeInfo(client),
    isAnvil: () => isAnvil(client),
    evmMineDetailed: (timestamp: bigint | number) =>
      evmMineDetailed(client, timestamp),
    deal: async (params: AnvilDealParameters) => {
      const deal = await loadDeal();
      await deal(client as unknown as TestClient, params);
    },
    writeContractSync: (
      parameters: WriteContractSyncParameters,
    ): Promise<WriteContractSyncReturnType> =>
      writeContractSync(client, parameters),
  };
}

/**
 * Extends an arbitrary viem `PublicClient` with anvil + wallet actions plus
 * the SDK's bonus actions (`anvilNodeInfo`, `isAnvil`, `evmMineDetailed`,
 * `deal`, `writeContractSync`).
 *
 * Used to lift `sdk.client` into an `AnvilClient` shape on the fly when test
 * RPCs (impersonateAccount, setBalance, setStorageAt, ...) are needed.
 */
export function extendAnvilClient(client: PublicClient): AnvilClient {
  return (
    client
      // Mark the client itself as `mode: "anvil"`. Without this, bare
      // `viem/actions` test functions like `setStorageAt(client, ...)` (used
      // internally by `viem-deal`) would build their RPC method names from
      // `client.mode === undefined` and silently fail.
      .extend(() => ({ mode: "anvil" as const }))
      .extend(testActions({ mode: "anvil" }))
      .extend(walletActions)
      .extend(c => anvilActions(c)) as any
  );
}

export function createAnvilClient({
  chain,
  transport,
  cacheTime = 0,
  pollingInterval = 50,
}: AnvilClientConfig): AnvilClient {
  return createTestClient({
    mode: "anvil",
    chain,
    transport,
    cacheTime,
    pollingInterval,
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(c => anvilActions(c)) as unknown as AnvilClient;
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

/**
 * Anvil-compatible `writeContractSync`: send via `writeContract` (Anvil
 * supports `eth_sendTransaction` / `eth_sendRawTransaction`) then wait for
 * the receipt. Viem's own action uses `eth_sendRawTransactionSync`, which
 * Anvil does not implement.
 */
export async function writeContractSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<
    abi,
    "nonpayable" | "payable",
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WriteContractSyncParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<WriteContractSyncReturnType<chain>> {
  const { throwOnReceiptRevert, pollingInterval, timeout, ...writeParams } =
    parameters;
  const hash = await getAction(
    client,
    writeContract,
    "writeContract",
  )(writeParams as never);
  const receipt = await getAction(
    client,
    waitForTransactionReceipt,
    "waitForTransactionReceipt",
  )({
    checkReplacement: false,
    hash,
    pollingInterval,
    timeout,
  });
  if (throwOnReceiptRevert && receipt.status === "reverted") {
    throw new BaseError(
      `Transaction with hash "${receipt.transactionHash}" reverted.`,
      { name: "TransactionReceiptRevertedError" },
    );
  }
  return receipt as WriteContractSyncReturnType<chain>;
}
