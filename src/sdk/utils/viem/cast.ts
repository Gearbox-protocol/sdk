import type { CallParameters } from "viem";

export function generateCastTraceCall(params: CallParameters): string {
  const { to, data, blockNumber, gas, gasPrice, maxPriorityFeePerGas, value } =
    params;
  const cmd = ["cast", "call", "--trace", "--rpc-url", "$RPC_URL"];
  if (blockNumber) {
    cmd.push("--block-number", blockNumber.toString());
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
