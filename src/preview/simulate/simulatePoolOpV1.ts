import type { Address, Hex, Log } from "viem";
import { simulateCalls } from "viem/actions";
import { ierc20Abi } from "../../abi/iERC20.js";
import { decodeSimulationError, PreviewSimulationError } from "./errors.js";
import { extractERC20Transfers } from "./extractERC20Transfers.js";
import { watchedHolders } from "./holders.js";
import type {
  AddressBalanceChanges,
  OperationSimulationOptions,
  PoolOperationSimulationInput,
  PoolOperationSimulationResult,
  TokenBalanceChange,
} from "./types.js";

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
 * `eth_simulateV1` pool-operation flow.
 *
 * Sandwiches the raw calldata between `balanceOf` reads of the underlying and
 * pool (share) tokens for every watched holder, then derives the balance changes
 * from the before/after diff and the wallet-relevant ERC-20 transfers from the
 * emitted logs. Simulation runs against real chain state (no overrides), so an
 * unmet prerequisite surfaces here as a revert.
 *
 * @throws {@link PreviewSimulationError} when the round-trip throws or the
 * simulated transaction reverts.
 */
export async function simulatePoolOpV1(
  input: PoolOperationSimulationInput,
  options: OperationSimulationOptions = {},
): Promise<PoolOperationSimulationResult> {
  const { sdk, operation, to, calldata, wallet } = input;
  const { blockNumber } = options;
  const { underlying, pool } = operation;

  const holders = watchedHolders(operation, wallet);
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

  let results: readonly unknown[];
  try {
    ({ results } = await simulateCalls(sdk.client, {
      account: wallet,
      // `undefined` lets viem simulate at `latest`; `blockNumber` is only set
      // for testnet forks pinned to a specific block.
      blockNumber,
      calls: [...balanceCalls, { to, data: calldata }, ...balanceCalls],
    }));
  } catch (cause) {
    throw new PreviewSimulationError([
      {
        source: "eth_simulateV1",
        detail: decodeSimulationError({
          error: cause instanceof Error ? cause : new Error(String(cause)),
        }),
      },
    ]);
  }

  const sim = results as unknown as SimCallResult[];
  const txIndex = balanceCalls.length;
  const afterOffset = txIndex + 1;
  const txResult = sim[txIndex];

  if (!txResult || txResult.status === "failure") {
    throw new PreviewSimulationError([
      {
        source: "eth_simulateV1",
        detail: decodeSimulationError({
          error: txResult?.error,
          data: txResult?.data,
        }),
      },
    ]);
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
    transfers: extractERC20Transfers(txResult.logs ?? [], holders),
    balanceChanges,
  };
}

/** Reads a `balanceOf` result, defaulting to `0n` when the read failed. */
function readBalance(result: SimCallResult | undefined): bigint {
  return result?.status === "success" ? (result.result as bigint) : 0n;
}
