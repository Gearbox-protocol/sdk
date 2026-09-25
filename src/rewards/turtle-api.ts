import type { Address } from "viem";
import type { OnchainSDK } from "../onchain/index.js";
import { TurtleRequestFailedError } from "./errors.js";

export interface TurtleWalletStream {
  streamId: string;
  snapshots: Array<{ rewardsAccumulated: string }>;
  stream: {
    orgId: string;
    contractAddress: Address | null;
    /** For Gearbox the target is a pool's share token. */
    customArgs: {
      targetToken?: { address: Address; chain: { chainId: string } };
    };
    point?: { id: string; name: string; decimals: number } | null;
    rewardToken: {
      address: Address;
      symbol: string;
      name: string;
      decimals: number;
    } | null;
    lastSnapshot: { rewardTokenPrice: string | null } | null;
  };
}

export interface TurtleMerkleProof {
  streamId: string;
  chainId: number;
  contractAddress: Address;
  /** Cumulative committed allocation, not what is left to claim. */
  amount: string;
}

export interface TurtleWalletRewards {
  streams: TurtleWalletStream[];
  proofs: TurtleMerkleProof[];
}

const TURTLE_API_URL = "https://earn.turtle.xyz";
const GEARBOX_ORG_ID = "d171ba3d-ff89-4e6c-8f13-d94840b06edd";
const TIMEOUT = 10_000;

export const turtleStreamAbi = [
  {
    type: "function",
    name: "getClaimedRewards",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function fetchTurtleWalletRewards(
  user: Address,
  apiKey: string,
): Promise<TurtleWalletRewards> {
  const { streams: all } = await get<{ streams: TurtleWalletStream[] }>(
    `/v2/streams/wallets/${user}`,
    apiKey,
  );
  const streams = all.filter(s => s.stream.orgId === GEARBOX_ORG_ID);
  const tokenStreamIds = streams
    .filter(s => s.stream.rewardToken && s.stream.contractAddress)
    .map(s => s.streamId);
  if (tokenStreamIds.length === 0) return { streams, proofs: [] };

  const query = new URLSearchParams({ wallet: user });
  for (const id of tokenStreamIds) query.append("streamIds", id);
  const { proofs } = await get<{ proofs: TurtleMerkleProof[] }>(
    `/v2/streams/merkle_proofs?${query}`,
    apiKey,
  );
  return { streams, proofs };
}

async function get<T>(path: string, apiKey: string): Promise<T> {
  try {
    const response = await fetch(`${TURTLE_API_URL}${path}`, {
      headers: { "X-API-Key": apiKey },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!response.ok) throw new Error(`answered ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    throw new TurtleRequestFailedError(path, error);
  }
}

/** What each of the wallet's streams on the chain has paid out, at the latest block. */
export async function readTurtleClaimed(
  sdk: OnchainSDK,
  user: Address,
  { proofs }: TurtleWalletRewards,
): Promise<Map<string, bigint>> {
  const onChain = proofs.filter(p => p.chainId === sdk.chainId);
  if (onChain.length === 0) return new Map();
  const claimed = await sdk.client.multicall({
    contracts: onChain.map(p => ({
      address: p.contractAddress,
      abi: turtleStreamAbi,
      functionName: "getClaimedRewards",
      args: [user],
    })),
    allowFailure: false,
    blockTag: "latest",
  });
  return new Map(onChain.map((p, i) => [p.streamId, claimed[i]]));
}
