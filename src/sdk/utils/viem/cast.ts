import type { CallParameters } from "viem";

/**
 * Builds the argument list of a `cast call --trace` command reproducing the call,
 * without the leading `cast` binary, so that it can be spawned directly.
 */
export function getCastTraceArgs(
  params: CallParameters,
  rpcUrl?: string,
): string[] {
  const {
    to,
    data,
    account,
    blockNumber,
    gas,
    gasPrice,
    maxPriorityFeePerGas,
    value,
  } = params;
  const args = ["call", "--trace"];
  if (rpcUrl) {
    args.push("--rpc-url", rpcUrl);
  }
  if (account) {
    args.push(
      "--from",
      typeof account === "string" ? account : account.address,
    );
  }
  if (blockNumber) {
    args.push("--block", blockNumber.toString());
  }
  if (gas) {
    args.push("--gas-limit", gas.toString());
  }
  if (gasPrice) {
    args.push("--gas-price", gasPrice.toString());
  }
  if (maxPriorityFeePerGas) {
    args.push("--priority-gas-price", maxPriorityFeePerGas.toString());
  }
  if (value) {
    args.push("--value", value.toString());
  }
  return [...args, to, data].filter(Boolean) as string[];
}

export function generateCastTraceCall(
  params: CallParameters,
  rpcUrl?: string,
): string {
  return ["cast", ...getCastTraceArgs(params, rpcUrl)].join(" ");
}
