import type { Address } from "viem";
import { AddressSet } from "../../sdk/index.js";
import type { PoolOperation } from "../parse/index.js";

/**
 * Address that provides the funds for the operation: the payer (msg.sender) for
 * deposit/mint, or the share owner for withdraw/redeem.
 */
function sourceHolder(operation: PoolOperation, wallet: Address): Address {
  switch (operation.operation) {
    case "Deposit":
    case "Mint":
      return wallet;
    case "Withdraw":
    case "Redeem":
      return operation.owner;
  }
}

/**
 * Distinct addresses whose balances change during the operation: the funds
 * source (payer or share owner) and the receiver.
 */
export function watchedHolders(
  operation: PoolOperation,
  wallet: Address,
): Address[] {
  const holders = new AddressSet([
    sourceHolder(operation, wallet),
    operation.receiver,
  ]);
  return holders.asArray();
}
