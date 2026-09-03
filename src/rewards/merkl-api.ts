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

/**
 * Merkl's own host and the Angle mirror, tried in this order.
 */
export const MERKL_DOMAINS = [
  "https://api.merkl.xyz",
  "https://api-merkl.angle.money",
] as const;

export const MERKL_API_KEY_HEADER = "X-API-Key";

/**
 * Per-attempt budget. Merkl has no timeout of its own, and a hung connection
 * would otherwise stall its leg of a fan-out for as long as the socket lives.
 */
const ATTEMPT_TIMEOUT = 10_000;

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
 * Rejects with {@link MerklRequestFailedError} when neither domain answers, so
 * a caller can tell an unreachable Merkl from a wallet with nothing to claim.
 * A non-2xx counts as no answer and moves to the next domain: it carries no
 * rewards either way, and treating it as success would report emptiness that
 * was never established.
 */
export async function fetchMerklUserRewards({
  chainId,
  user,
  apiKey,
}: FetchMerklUserRewardsProps): Promise<MerkleXYZUserRewardsV4Response> {
  const path = `/v4/users/${user}/rewards?chainId=${chainId}`;
  const headers = apiKey ? { [MERKL_API_KEY_HEADER]: apiKey } : undefined;
  const attempts: Array<[domain: string, cause: unknown]> = [];

  for (const domain of MERKL_DOMAINS) {
    try {
      const response = await fetch(`${domain}${path}`, {
        headers,
        // A fresh signal per attempt: one shared budget would let a slow
        // primary eat the mirror's.
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT),
      });
      if (!response.ok) {
        attempts.push([domain, new Error(`answered ${response.status}`)]);
        continue;
      }
      return (await response.json()) as MerkleXYZUserRewardsV4Response;
    } catch (error) {
      attempts.push([domain, error]);
    }
  }

  throw new MerklRequestFailedError(chainId, path, attempts);
}
