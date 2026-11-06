import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { Abi, Address, Hex } from "viem";
import {
  createPublicClient,
  custom,
  decodeFunctionData,
  encodeFunctionResult,
  erc20Abi,
  parseAbi,
} from "viem";
import { getChain } from "../../../onchain/index.js";
import { GovernorContract } from "../../bindings/governance/governor.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { TreasurySplitterContract } from "../../bindings/treasury-splitter.js";
import {
  ADDRESS_PROVIDER,
  CONFIGURATOR,
  GOVERNOR,
  SOURCE_BLOCK,
  SOURCE_BLOCK_HASH,
  SOURCE_TIMESTAMP,
  TIMELOCK,
  TREASURY,
} from "./sdkHarness.js";

const multicallAbi = parseAbi([
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)",
]);
const roleAbi = parseAbi([
  "function getRoleHolders(bytes32 role) view returns (address[])",
]);
const contractsRegisterAbi = parseAbi([
  "function getPools() view returns (address[])",
]);
const abiClient = createPublicClient({
  chain: getChain(1),
  transport: custom({
    request: async () => {
      throw new Error("ABI-only client must not make RPC calls");
    },
  }),
});
const abis: Abi[] = [
  erc20Abi,
  roleAbi,
  contractsRegisterAbi,
  multicallAbi,
  new MarketConfiguratorContract(CONFIGURATOR, abiClient).abi,
  new GovernorContract(GOVERNOR, abiClient).abi,
  new TreasurySplitterContract(TREASURY, abiClient).abi,
];

interface Aggregate3Call {
  target: Address;
  allowFailure: boolean;
  callData: Hex;
}

function contractResult(to: Address, data: Hex): Hex {
  for (const abi of abis) {
    let decoded: { functionName: string; args?: readonly unknown[] };
    try {
      decoded = decodeFunctionData({ abi, data });
    } catch {
      continue;
    }
    let result: unknown;
    switch (decoded.functionName) {
      case "aggregate3":
        result = (decoded.args as readonly [Aggregate3Call[]])[0].map(c => {
          try {
            return {
              success: true,
              returnData: contractResult(c.target, c.callData),
            };
          } catch (e) {
            if (!c.allowFailure) throw e;
            return { success: false, returnData: "0x" };
          }
        });
        break;
      case "version":
        result = 310n;
        break;
      case "decimals":
        result = 6;
        break;
      case "admin":
        result = to.toLowerCase() === CONFIGURATOR ? TIMELOCK : GOVERNOR;
        break;
      case "emergencyAdmin":
        result = TREASURY;
        break;
      case "acl":
        result = ADDRESS_PROVIDER;
        break;
      case "treasury":
        result = TREASURY;
        break;
      case "getRoleHolders":
        result = [];
        break;
      case "queueAdmins":
      case "executionAdmins":
        result = [TIMELOCK];
        break;
      case "vetoAdmin":
        result = TIMELOCK;
        break;
      case "defaultSplit":
        result = {
          initialized: true,
          receivers: [TREASURY],
          proportions: [10_000n],
        };
        break;
      case "activeProposals":
      case "getPeripheryContracts":
      // The stubbed configurator has no markets, so no treasury tokens.
      case "getPools":
        result = [];
        break;
      case "contractsRegister":
        result = ADDRESS_PROVIDER;
        break;
      case "balanceOf":
        result = 10n ** 30n;
        break;
      default:
        throw new Error(`Unstubbed contract function ${decoded.functionName}`);
    }
    return encodeFunctionResult({
      abi,
      functionName: decoded.functionName,
      result,
    } as Parameters<typeof encodeFunctionResult>[0]);
  }
  throw new Error(`Unknown calldata ${data}`);
}

interface RpcMessage {
  id: number;
  method: string;
  params: [{ to: Address; data: Hex }, ...unknown[]];
}

/** A JSON-RPC node answering like Anvil, see {@link startForkNode}. **/
export interface ForkNode {
  url: string;
  requests: RpcMessage[];
  head: bigint;
  blockHash: Hex;
  supportsAnvil: boolean;
  reset(): void;
  close(): Promise<void>;
}

/**
 * A JSON-RPC server that answers like an Anvil node forking mainnet at the
 * source block, so an SDK can be created in fork mode without a real node.
 *
 * `requests` records every call; `head`, `blockHash` and `supportsAnvil` can be
 * changed to move the node, and `reset()` puts everything back.
 **/
export async function startForkNode(): Promise<ForkNode> {
  const node: ForkNode = {
    url: "",
    requests: [],
    head: SOURCE_BLOCK,
    blockHash: SOURCE_BLOCK_HASH,
    supportsAnvil: true,
    reset() {
      node.requests = [];
      node.head = SOURCE_BLOCK;
      node.blockHash = SOURCE_BLOCK_HASH;
      node.supportsAnvil = true;
    },
    async close() {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    },
  };

  function answer(message: RpcMessage): unknown {
    switch (message.method) {
      case "anvil_nodeInfo":
        if (!node.supportsAnvil) throw new Error("Method not found");
        return {
          forkConfig: {
            forkUrl: "http://upstream.invalid",
            forkBlockNumber: Number(node.head),
          },
        };
      case "eth_chainId":
        return "0x1";
      case "eth_blockNumber":
        return `0x${node.head.toString(16)}`;
      case "eth_getBlockByNumber":
        return {
          number: `0x${node.head.toString(16)}`,
          hash: node.blockHash,
          timestamp: `0x${SOURCE_TIMESTAMP.toString(16)}`,
          transactions: [],
          uncles: [],
          gasLimit: "0x1c9c380",
          gasUsed: "0x0",
          baseFeePerGas: "0x1",
        };
      case "eth_call":
        return contractResult(message.params[0].to, message.params[0].data);
      case "eth_getCode":
        return "0x60";
      default:
        throw new Error(`Unstubbed RPC ${message.method}`);
    }
  }

  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const message = JSON.parse(Buffer.concat(chunks).toString()) as RpcMessage;
    node.requests.push(message);
    res.setHeader("Content-Type", "application/json");
    try {
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: answer(message),
        }),
      );
    } catch (e) {
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32601, message: (e as Error).message },
        }),
      );
    }
  });
  await new Promise<void>(resolve =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  node.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return node;
}
