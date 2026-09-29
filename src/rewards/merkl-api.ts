import type { Address } from "viem";
import type { ChainId } from "../model/index.js";
import { MerklRequestFailedError } from "./errors.js";

export interface MerkleXYZUserRewardsV4 {
  chain: MerkleXYZChain;
  rewards: Array<{
    root: Address;
    recipient: Address;
    amount: string;
    claimed: string;
    pending: string;
    proofs: Array<Address>;
    token: {
      address: Address;
      chainId: number;
      symbol: string;
      decimals: number;
      /**
       * USD price of one whole token. Optional because Merkl omits the key
       * outright for the tokens it does not price — points and the like —
       * rather than sending a null.
       */
      price?: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: string;
      claimed: string;
      pending: string;
      campaignId: Address;
    }>;
  }>;
}
export type MerkleXYZUserRewardsV4Response = Array<MerkleXYZUserRewardsV4>;

interface MerkleXYZChain {
  id: number;
  name: string;
  icon: string;
}

const MERKL_API_URL = "https://api.merkl.xyz";

export const MERKL_API_KEY_HEADER = "X-API-Key";

/**
 * Merkl has no timeout of its own, and a hung connection would otherwise stall
 * its leg of a fan-out for as long as the socket lives.
 */
const TIMEOUT = 10_000;

export interface FetchMerklUserRewardsProps {
  chainId: ChainId;
  /** Checksummed by the caller — Merkl keys its answer on the exact string. */
  user: Address;
  /** Raises Merkl's rate limit; the keyless path answers too. */
  apiKey?: string;
}

/**
 * The wallet's raw Merkl rewards on one chain.
 *
 * Rejects with {@link MerklRequestFailedError} when Merkl does not answer, so a
 * caller can tell an unreachable Merkl from a wallet with nothing to claim. A
 * non-2xx counts as no answer: it carries no rewards either way, and treating
 * it as success would report emptiness that was never established.
 */
export async function fetchMerklUserRewards({
  chainId,
  user,
  apiKey,
}: FetchMerklUserRewardsProps): Promise<MerkleXYZUserRewardsV4Response> {
  const path = `/v4/users/${user}/rewards?chainId=${chainId}`;
  try {
    const response = await fetch(`${MERKL_API_URL}${path}`, {
      headers: apiKey ? { [MERKL_API_KEY_HEADER]: apiKey } : undefined,
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!response.ok) throw new Error(`answered ${response.status}`);
    return (await response.json()) as MerkleXYZUserRewardsV4Response;
  } catch (error) {
    throw new MerklRequestFailedError(chainId, path, error);
  }
}
