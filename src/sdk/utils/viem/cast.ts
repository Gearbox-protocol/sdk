import type { CallParameters } from "viem";

export function generateCastTraceCall(
  params: CallParameters,
  rpcUrl?: string,
): string {
  const { to, data, blockNumber, gas, gasPrice, maxPriorityFeePerGas, value } =
    params;
  const cmd = ["cast", "call", "--trace"];
  if (rpcUrl) {
    cmd.push("--rpc-url", rpcUrl);
  }
  if (blockNumber) {
    cmd.push("--block", blockNumber.toString());
  }
  if (gas) {
    cmd.push("--gas-limit", gas.toString());
  }
  if (gasPrice) {
    cmd.push("--gas-price", gasPrice.toString());
  }
  if (maxPriorityFeePerGas) {
    cmd.push("priority-gas-price", maxPriorityFeePerGas.toString());
  }
  if (value) {
    cmd.push("--value", value.toString());
  }
  return [...cmd, to, data].join(" ");
}
