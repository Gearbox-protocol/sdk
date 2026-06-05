import { type Address, isAddressEqual, type Log, parseEventLogs } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import type { TokenTransfer } from "../parse/index.js";

/**
 * Parses ERC-20 `Transfer` logs and keeps only those involving one of the
 * watched addresses (as sender or receiver). A log that touches several watched
 * addresses is still emitted once.
 *
 * @param logs - raw logs from the simulated call
 * @param watch - addresses whose transfers we care about (e.g. wallet + recipient)
 */
export function extractERC20Transfers(
  logs: Log[],
  watch: Address[],
): TokenTransfer[] {
  const parsed = parseEventLogs({
    abi: ierc20Abi,
    eventName: "Transfer",
    logs,
  });

  const transfers: TokenTransfer[] = [];
  for (const log of parsed) {
    const { from, to, value } = log.args;
    const involved = watch.some(
      address => isAddressEqual(from, address) || isAddressEqual(to, address),
    );
    if (involved) {
      transfers.push({ token: log.address, amount: value, from, to });
    }
  }
  return transfers;
}
