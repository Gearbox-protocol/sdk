import {
  type Address,
  BaseError,
  type Chain,
  createPublicClient,
  custom,
  type Hex,
  type PublicClient,
  type RpcBlock,
  type RpcTransactionRequest,
  type Transport,
  toHex,
} from "viem";
import { getConfiguratorState } from "../state/configurator/getConfiguratorState.js";
import { getMarketState } from "../state/market/getMarketState.js";
import { errorMessage } from "../utils/errorMessage.js";
import { attachForkSdk, readFailures } from "./forkReads.js";
import {
  GipSimulationError,
  type GipSimulationOptions,
  type GipSimulationOutcome,
  type GipSimulationTarget,
} from "./GipSimulationError.js";
import {
  type ForkExecutionCall,
  type ForkExecutionReceipt,
  simulateGipPayloadOnFork,
  validateForkExecutionCalls,
} from "./simulateGipOnFork.js";

function rpcError(error: unknown): string {
  return error instanceof BaseError
    ? [error.shortMessage, error.details].filter(Boolean).join(" ")
    : errorMessage(error);
}

/** Read exclusively against the simulated head, including adaptive multicall reads. */
function postStateClient(
  chain: Chain,
  head: RpcBlock,
  read: (call: RpcTransactionRequest) => Promise<Hex>,
  missingReads: Set<string>,
) {
  return createPublicClient({
    chain,
    cacheTime: 0,
    transport: custom(
      {
        async request({ method, params = [] }) {
          switch (method) {
            case "eth_chainId":
              return toHex(chain.id);
            case "eth_blockNumber":
              return head.number;
            case "eth_getBlockByNumber":
              if (params[0] === "latest" || params[0] === head.number)
                return head;
              break;
            case "eth_call": {
              const [call, block, ...overrides] = params;
              if (
                overrides.length ||
                (block && block !== "latest" && block !== head.number)
              )
                break;
              return read(call);
            }
          }
          const reason = `Unsupported simulated post-state read: ${method}`;
          missingReads.add(reason);
          throw new Error(reason);
        },
      },
      { retryCount: 0 },
    ),
  });
}

/** Execute raw timelock payloads in ephemeral blocks, one block per compiled batch. */
export async function simulateOnRpc(args: {
  client: PublicClient<Transport, Chain>;
  target: Omit<GipSimulationTarget, "calls">;
  batches: readonly (readonly ForkExecutionCall[])[];
  sender: Address;
  timestamp: number;
  options: GipSimulationOptions;
}): Promise<GipSimulationOutcome> {
  const { client, sender, options } = args;
  const target = {
    ...args.target,
    calls: validateForkExecutionCalls(args.batches.flat()),
  };
  const blocks = args.batches.map((payload, index) => {
    return {
      blockOverrides: { time: toHex(args.timestamp + index) },
      calls: payload.map(call => ({
        from: sender,
        to: call.to,
        data: call.callData,
        value: toHex(BigInt(call.value)),
        ...(options.gas === undefined ? {} : { gas: toHex(options.gas) }),
      })),
    };
  });
  const last = blocks.length - 1;
  async function run(read?: RpcTransactionRequest) {
    const blockStateCalls = read
      ? blocks.map((block, index) =>
          index === last ? { ...block, calls: [...block.calls, read] } : block,
        )
      : blocks;
    const result = await client.request(
      {
        method: "eth_simulateV1",
        params: [
          { blockStateCalls, validation: false, returnFullTransactions: false },
          toHex(target.sourceBlockNumber),
        ],
      },
      { retryCount: 0 },
    );
    if (result[0]?.parentHash !== target.sourceBlockHash)
      throw new Error(
        "Simulated blocks do not descend from the session source hash",
      );
    if (
      result.length !== blocks.length ||
      result.some(
        (b, i) =>
          b.number === null ||
          BigInt(b.number) !== target.sourceBlockNumber + BigInt(i + 1) ||
          BigInt(b.timestamp) !== BigInt(args.timestamp + i) ||
          b.calls.length !== blockStateCalls[i].calls.length ||
          b.transactions.length !== b.calls.length,
      )
    )
      throw new Error("RPC returned an incomplete simulation");
    return result;
  }

  const chainId = await client.getChainId();
  if (chainId !== target.chainId)
    throw new GipSimulationError("RPC chain ID differs from the session", {
      phase: "setup",
    });
  const executed = await run().catch(error => {
    throw new GipSimulationError(
      `RPC payload simulation at block ${target.sourceBlockNumber} requires eth_simulateV1: ${rpcError(error)}`,
      { phase: "setup" },
    );
  });
  const receipts: ForkExecutionReceipt[] = executed.flatMap(
    (block, blockIndex) =>
      block.calls.map((call, index) => {
        const hash = block.transactions[index];
        if (typeof hash !== "string")
          throw new GipSimulationError("Missing simulated transaction hash", {
            phase: "execute",
          });
        return {
          hash,
          status: call.status === "0x1" ? "success" : "reverted",
          gasUsed: BigInt(call.gasUsed),
          blockNumber: target.sourceBlockNumber + BigInt(blockIndex + 1),
          blockTimestamp: Number(block.timestamp),
          ...(call.error
            ? {
                revertReason: [call.error.message, call.error.data]
                  .filter(Boolean)
                  .join(" "),
              }
            : {}),
        };
      }),
  );
  const head = executed[last];
  const missingReads = new Set<string>();
  const observed = postStateClient(
    client.chain,
    head,
    async call => {
      // The SDK's eth_call gas ceiling can exceed a block. Let the node allocate
      // the remaining gas to the final observation.
      const replay = await run({ ...call, gas: undefined }).catch(error => {
        const reason = rpcError(error);
        missingReads.add(reason);
        throw new Error(reason);
      });
      for (const [i, block] of executed.entries()) {
        if (
          block.calls.some((original, j) => {
            const repeated = replay[i].calls[j];
            return (
              repeated.status !== original.status ||
              repeated.returnData !== original.returnData ||
              repeated.gasUsed !== original.gasUsed
            );
          })
        ) {
          const reason = "RPC payload results changed during post-state replay";
          missingReads.add(reason);
          throw new Error(reason);
        }
      }
      const result = replay[last].calls[blocks[last].calls.length];
      if (result.status !== "0x1")
        throw Object.assign(
          new Error(result.error?.message ?? "Post-state getter reverted"),
          result.error,
        );
      return result.returnData;
    },
    missingReads,
  );
  let sdk: ReturnType<typeof attachForkSdk> | undefined;
  const result = await simulateGipPayloadOnFork(target, {
    getChainId: async () => chainId,
    execute: async (_, i) => receipts[i],
    readConfiguratorState: address => getConfiguratorState(observed, address),
    async readMarketState(address, read) {
      sdk ??= attachForkSdk({
        client: observed,
        chainId: target.chainId,
        marketConfigurator: target.marketConfigurator,
        addressProvider: options.addressProvider,
      });
      const attached = await sdk;
      return getMarketState(attached, target.marketConfigurator, address, {
        client: observed,
        timestamp: Number(head.timestamp),
        registry: target.registry,
        knownDeployments: read?.knownDeployments,
      });
    },
  });
  const failures = readFailures(result, target.marketConfigurator);
  if (result.executionError)
    failures.push({
      phase: "execute",
      reason: result.executionError.reason,
      ...(result.executionError.index === null
        ? {}
        : { callIndex: result.executionError.index }),
    });
  if (missingReads.size) {
    return {
      ...result,
      verdict: result.verdict === "match" ? "incomplete" : result.verdict,
      incompleteReasons: [...(result.incompleteReasons ?? []), ...missingReads],
      failures,
      setupChanges: [],
    };
  }
  return { ...result, failures, setupChanges: [] };
}
