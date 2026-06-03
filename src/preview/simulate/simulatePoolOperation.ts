import { type Address, type Hex, isAddressEqual, type Log } from "viem";
import { simulateCalls } from "viem/actions";
import { ierc20Abi } from "../../abi/iERC20.js";
import type { OnchainSDK } from "../../sdk/index.js";

import type { PoolOperation } from "../parse/index.js";

import { decodeSimulationError } from "./decodeSimulationError.js";
import { extractERC20Transfers } from "./extractERC20Transfers.js";
import type {
  AddressBalanceChanges,
  PoolSimulationResult,
  TokenBalanceChange,
} from "./types.js";

export interface SimulatePoolOperationInput {
  /** Only `client` is used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed operation, used to resolve the underlying and pool tokens. */
  operation: PoolOperation;
  /** Target contract the calldata is sent to (the pool). */
  to: Address;
  /** Raw deposit/redeem calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
  /** Block to simulate at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}

/** Minimal shape of a `simulateCalls` per-call result (`allowFailure` style). */
type SimCallResult =
  | {
      status: "success";
      result: unknown;
      data: Hex;
      gasUsed: bigint;
      logs?: Log[];
      error?: undefined;
    }
  | {
      status: "failure";
      error: Error;
      data: Hex;
      gasUsed: bigint;
      logs?: Log[];
      result?: undefined;
    };

/**
 * Simulates a pool deposit/redeem by sandwiching the raw calldata between
 * `balanceOf(wallet)` reads of the underlying and pool (share) tokens.
 *
 * On success, returns the ERC-20 transfers emitted by the call that involve the
 * wallet or the operation recipient (for merging into the parsed operation) and
 * the balance changes grouped by watched address (wallet, plus the recipient
 * when distinct); on revert, returns the decoded reason. Simulation runs against
 * real chain state (no overrides), so an unmet prerequisite surfaces here as a
 * failure.
 */
export async function simulatePoolOperation(
  input: SimulatePoolOperationInput,
): Promise<PoolSimulationResult> {
  const { sdk, operation, to, calldata, wallet, blockNumber } = input;
  const { underlying, pool } = operation;

  // Watch the wallet and, when distinct, the operation recipient: shares/assets
  // may be routed to a recipient that is not the wallet.
  const receiverIsWallet = isAddressEqual(operation.receiver, wallet);
  const holders: Address[] = receiverIsWallet
    ? [wallet]
    : [wallet, operation.receiver];

  // For every watched holder we read both the underlying and the pool (share)
  // token balance. The reads are sandwiched around the tx as a contiguous
  // "before" block, the call, then an identically ordered "after" block.
  const tokens: Address[] = [underlying, pool];

  const balanceOf = (token: Address, holder: Address) =>
    ({
      to: token,
      abi: ierc20Abi,
      functionName: "balanceOf" as const,
      args: [holder] as const,
    }) as const;

  const balanceCalls = holders.flatMap(holder =>
    tokens.map(token => balanceOf(token, holder)),
  );

  const { results } = await simulateCalls(sdk.client, {
    account: wallet,
    // `undefined` lets viem simulate at `latest`; `blockNumber` is only set for
    // testnet forks pinned to a specific block.
    blockNumber,
    calls: [...balanceCalls, { to, data: calldata }, ...balanceCalls],
  });

  const sim = results as unknown as SimCallResult[];
  const txIndex = balanceCalls.length;
  const afterOffset = txIndex + 1;
  const txResult = sim[txIndex];

  if (!txResult || txResult.status === "failure") {
    return {
      status: "failure",
      error: decodeSimulationError({
        error: txResult?.error,
        data: txResult?.data,
      }),
    };
  }

  const balanceChanges: AddressBalanceChanges[] = [];
  for (const [holderIndex, address] of holders.entries()) {
    const changes: TokenBalanceChange[] = [];
    for (const [tokenIndex, token] of tokens.entries()) {
      const slot = holderIndex * tokens.length + tokenIndex;
      const before = readBalance(sim[slot]);
      const after = readBalance(sim[afterOffset + slot]);
      const delta = after - before;
      // Drop dust / no-op changes (including 1-wei rounding artifacts).
      const magnitude = delta >= 0n ? delta : -delta;
      if (magnitude > 1n) {
        changes.push({ token, before, after, delta });
      }
    }
    if (changes.length > 0) {
      balanceChanges.push({ address, changes });
    }
  }

  return {
    status: "success",
    transfers: extractERC20Transfers(txResult.logs ?? [], holders),
    balanceChanges,
    gasUsed: txResult.gasUsed,
  };
}

/** Reads a `balanceOf` result, defaulting to `0n` when the read failed. */
function readBalance(result: SimCallResult | undefined): bigint {
  return result?.status === "success" ? (result.result as bigint) : 0n;
}
