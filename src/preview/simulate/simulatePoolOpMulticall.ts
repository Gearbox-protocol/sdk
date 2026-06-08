import type { Address, ContractFunctionParameters } from "viem";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import { ierc20Abi } from "../../abi/iERC20.js";
import { AddressMap } from "../../sdk/index.js";

import type { PoolOperation } from "../parse/index.js";
import { decodeSimulationError, PreviewSimulationError } from "./errors.js";
import { watchedHolders } from "./holders.js";
import type {
  AddressBalanceChanges,
  OperationSimulationOptions,
  PoolOperationSimulationInput,
  PoolOperationSimulationResult,
  TokenBalanceChange,
} from "./types.js";

/** Reads a watched holder's "before" balance of a token. */
export type BalanceLookup = (token: Address, holder: Address) => bigint;

/** ERC4626 preview read paired with each pool operation kind. */
type PreviewFunctionName =
  | "previewDeposit"
  | "previewMint"
  | "previewWithdraw"
  | "previewRedeem";

function previewRead(operation: PoolOperation): {
  functionName: PreviewFunctionName;
  amount: bigint;
} {
  switch (operation.operation) {
    case "Deposit":
      return { functionName: "previewDeposit", amount: operation.assets };
    case "Mint":
      return { functionName: "previewMint", amount: operation.shares };
    case "Withdraw":
      return { functionName: "previewWithdraw", amount: operation.assets };
    case "Redeem":
      return { functionName: "previewRedeem", amount: operation.shares };
  }
}

/**
 * Multicall pool-operation flow, used where `eth_simulateV1` is unavailable or
 * as a fallback alongside it.
 *
 * Reads the watched holders' "before" balances together with the matching
 * ERC4626 preview (`previewDeposit`/`previewMint`/`previewWithdraw`/
 * `previewRedeem`) in a single multicall, then computes the theoretical balance
 * changes via {@link computePoolOpBalanceChanges}.
 *
 * Unlike the `eth_simulateV1` flow it does not execute the calldata, so it
 * cannot recover ERC-20 transfers (`transfers` is always `undefined`) and it
 * ignores balance/allowance prerequisites (preview reads succeed regardless).
 *
 * @throws {@link PreviewSimulationError} when the multicall round-trip throws or
 * any call (a balance read or the preview read) reverts.
 */
export async function simulatePoolOpMulticall(
  input: PoolOperationSimulationInput,
  options: OperationSimulationOptions = {},
): Promise<PoolOperationSimulationResult> {
  const { sdk, operation, wallet } = input;
  const { blockNumber } = options;
  const { underlying, pool } = operation;

  const holders = watchedHolders(operation, wallet);
  const tokens = [underlying, pool];

  const balanceCalls = holders.flatMap(holder =>
    tokens.map(token => ({ holder, token })),
  );

  const balanceContracts: ContractFunctionParameters[] = balanceCalls.map(
    ({ holder, token }) => ({
      address: token,
      abi: ierc20Abi,
      functionName: "balanceOf",
      args: [holder],
    }),
  );
  const { functionName, amount } = previewRead(operation);
  const previewContract: ContractFunctionParameters = {
    address: pool,
    abi: iPoolV310Abi,
    functionName,
    args: [amount],
  };

  let results: unknown[];
  try {
    results = (await sdk.client.multicall({
      allowFailure: false,
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber,
      contracts: [...balanceContracts, previewContract],
    })) as unknown[];
  } catch (cause) {
    throw new PreviewSimulationError([
      {
        source: "multicall",
        detail: decodeSimulationError({
          error: cause instanceof Error ? cause : new Error(String(cause)),
        }),
      },
    ]);
  }

  const previewAmount = results[balanceContracts.length] as bigint;

  const balances = new AddressMap<AddressMap<bigint>>();
  for (const [i, { holder, token }] of balanceCalls.entries()) {
    const tokenBalances = balances.get(holder) ?? new AddressMap<bigint>();
    tokenBalances.upsert(token, results[i] as bigint);
    balances.upsert(holder, tokenBalances);
  }

  const before: BalanceLookup = (token, holder) =>
    balances.get(holder)?.get(token) ?? 0n;

  return {
    balanceChanges: computePoolOpBalanceChanges(
      operation,
      wallet,
      previewAmount,
      before,
    ),
    transfers: undefined,
  };
}

/** A single (address, token) balance delta produced by an operation. */
interface BalanceLeg {
  address: Address;
  token: Address;
  delta: bigint;
}

/**
 * Maps a pool operation and its ERC4626 preview result to the two balance legs
 * it produces: the funds source (payer/owner) and the receiver. `previewAmount`
 * is the counterpart amount returned by the matching preview read (shares for
 * deposit/withdraw, assets for mint/redeem).
 */
function balanceLegs(
  operation: PoolOperation,
  wallet: Address,
  previewAmount: bigint,
): BalanceLeg[] {
  const { underlying, pool, receiver } = operation;
  switch (operation.operation) {
    case "Deposit":
      return [
        { address: wallet, token: underlying, delta: -operation.assets },
        { address: receiver, token: pool, delta: previewAmount },
      ];
    case "Mint":
      return [
        { address: wallet, token: underlying, delta: -previewAmount },
        { address: receiver, token: pool, delta: operation.shares },
      ];
    case "Withdraw":
      return [
        { address: operation.owner, token: pool, delta: -previewAmount },
        { address: receiver, token: underlying, delta: operation.assets },
      ];
    case "Redeem":
      return [
        { address: operation.owner, token: pool, delta: -operation.shares },
        { address: receiver, token: underlying, delta: previewAmount },
      ];
  }
}

/**
 * Pure computation of {@link AddressBalanceChanges} for a pool operation from
 * its ERC4626 preview result and the watched holders' "before" balances. Legs
 * sharing the same address are grouped together.
 */
export function computePoolOpBalanceChanges(
  operation: PoolOperation,
  wallet: Address,
  previewAmount: bigint,
  before: BalanceLookup,
): AddressBalanceChanges[] {
  const byAddress = new AddressMap<AddressBalanceChanges>();
  for (const { address, token, delta } of balanceLegs(
    operation,
    wallet,
    previewAmount,
  )) {
    const beforeBalance = before(token, address);
    const change: TokenBalanceChange = {
      token,
      before: beforeBalance,
      after: beforeBalance + delta,
      delta,
    };
    const existing = byAddress.get(address);
    if (existing) {
      existing.changes.push(change);
    } else {
      byAddress.upsert(address, { address, changes: [change] });
    }
  }
  return byAddress.values();
}
