import type { Address, ContractFunctionParameters } from "viem";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import { ierc20Abi } from "../../abi/iERC20.js";
import { iZapperAbi } from "../../abi/iZapper.js";
import { AddressMap } from "../../sdk/index.js";

import type { PoolOperation } from "../parse/index.js";
import {
  asPreviewSimulationError,
  decodeSimulationError,
  PreviewSimulationError,
} from "./errors.js";
import { watchedHolders } from "./holders.js";
import type {
  AddressBalanceChanges,
  OperationSimulationOptions,
  PoolOperationSimulation,
  PoolOperationSimulationInput,
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
 * The "outside" token whose balance changes for the funds source/receiver: the
 * pool underlying for direct operations, or the zapper's input/output token for
 * zapper-routed ones. The parser sets `tokenIn`/`tokenOut` to the underlying for
 * direct operations, so reading them works uniformly for both routes.
 */
function outsideToken(operation: PoolOperation): Address {
  switch (operation.operation) {
    case "Deposit":
    case "Mint":
      return operation.tokenIn;
    case "Withdraw":
    case "Redeem":
      return operation.tokenOut;
  }
}

/**
 * Builds the preview read that converts the operation's known amount into its
 * counterpart. Direct operations read the pool's ERC4626 preview; zapper-routed
 * operations (only ever `Deposit`/`Redeem`) read the zapper's
 * `previewDeposit`/`previewRedeem`, which account for the zapper's own
 * conversion in addition to the pool's.
 */
function previewContract(operation: PoolOperation): ContractFunctionParameters {
  const { functionName, amount } = previewRead(operation);
  if (operation.zapper) {
    return {
      address: operation.zapper,
      abi: iZapperAbi,
      functionName,
      args: [amount],
    };
  }
  return {
    address: operation.pool,
    abi: iPoolV310Abi,
    functionName,
    args: [amount],
  };
}

/**
 * Simulates a pool deposit/mint/withdraw/redeem (direct or zapper-routed) and
 * returns the resulting balance changes, or a decoded failure.
 *
 * Reads the watched holders' "before" balances together with the matching
 * preview (the pool's ERC4626 `previewDeposit`/`previewMint`/`previewWithdraw`/
 * `previewRedeem`, or the zapper's `previewDeposit`/`previewRedeem`) in a single
 * multicall, then computes the theoretical balance changes via
 * {@link computePoolOpBalanceChanges}. It works on every network the SDK
 * supports.
 *
 * It does not execute the calldata, so it ignores balance/allowance
 * prerequisites (preview reads succeed regardless).
 */
export async function simulatePoolOperation(
  input: PoolOperationSimulationInput,
  options: OperationSimulationOptions = {},
): Promise<PoolOperationSimulation> {
  const { sdk, operation, wallet } = input;
  const { blockNumber, logger } = options;
  const { pool } = operation;

  try {
    const holders = watchedHolders(operation, wallet);
    const tokens = [outsideToken(operation), pool];

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
    const preview = previewContract(operation);

    let results: unknown[];
    try {
      results = (await sdk.client.multicall({
        allowFailure: false,
        // `undefined` lets viem read at `latest`; `blockNumber` is only set for
        // testnet forks pinned to a specific block.
        blockNumber,
        contracts: [...balanceContracts, preview],
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
      status: "success",
      balanceChanges: computePoolOpBalanceChanges(
        operation,
        wallet,
        previewAmount,
        before,
      ),
    };
  } catch (cause) {
    const error = asPreviewSimulationError(cause, "multicall");
    logger?.error(error, "pool operation simulation failed");
    return { status: "failure", error };
  }
}

/** A single (address, token) balance delta produced by an operation. */
interface BalanceLeg {
  address: Address;
  token: Address;
  delta: bigint;
}

/**
 * Maps a pool operation and its preview result to the two balance legs it
 * produces: the funds source (payer/owner) and the receiver. `previewAmount` is
 * the counterpart amount returned by the matching preview read (shares for
 * deposit/withdraw, assets for mint/redeem, and the zapper's converted amount
 * for zapper-routed deposit/redeem).
 *
 * The "outside" token is `tokenIn` for deposit/mint and `tokenOut` for
 * withdraw/redeem: the pool underlying for direct operations, or the zapper's
 * input/output token for zapper-routed ones.
 */
function balanceLegs(
  operation: PoolOperation,
  wallet: Address,
  previewAmount: bigint,
): BalanceLeg[] {
  const { pool, receiver } = operation;
  switch (operation.operation) {
    case "Deposit":
      return [
        { address: wallet, token: operation.tokenIn, delta: -operation.assets },
        { address: receiver, token: pool, delta: previewAmount },
      ];
    case "Mint":
      return [
        { address: wallet, token: operation.tokenIn, delta: -previewAmount },
        { address: receiver, token: pool, delta: operation.shares },
      ];
    case "Withdraw":
      return [
        { address: operation.owner, token: pool, delta: -previewAmount },
        {
          address: receiver,
          token: operation.tokenOut,
          delta: operation.assets,
        },
      ];
    case "Redeem":
      return [
        { address: operation.owner, token: pool, delta: -operation.shares },
        { address: receiver, token: operation.tokenOut, delta: previewAmount },
      ];
  }
}

/**
 * Pure computation of {@link AddressBalanceChanges} for a pool operation from
 * its preview result and the watched holders' "before" balances. Legs sharing
 * the same address are grouped together.
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
