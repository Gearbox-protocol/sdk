import {
  asPreviewSimulationError,
  combinePreviewSimulationErrors,
} from "./errors.js";
import { simulatePoolOpMulticall } from "./simulatePoolOpMulticall.js";
import { simulatePoolOpV1 } from "./simulatePoolOpV1.js";
import type {
  OperationSimulationOptions,
  PoolOperationSimulation,
  PoolOperationSimulationInput,
} from "./types.js";

/**
 * Simulates a pool deposit/mint/withdraw/redeem and returns the resulting
 * balance changes (and, when available, ERC-20 transfers), or a decoded failure.
 *
 * @throws {@link PreviewSimulationError} when the simulation fails.
 */
export async function simulatePoolOperation(
  input: PoolOperationSimulationInput,
  options: OperationSimulationOptions = {},
): Promise<PoolOperationSimulation> {
  const { logger, useSimulateV1 } = options;

  logger?.debug(
    { wallet: input.wallet, to: input.to },
    "simulating pool operation",
  );

  // Two flows back this:
  // - `eth_simulateV1` ({@link simulatePoolOpV1}) — executes the calldata and
  //   recovers real `transfers`; only works on {@link ETH_SIMULATE_V1_NETWORKS}.
  // - multicall ({@link simulatePoolOpMulticall}) — reads balances and an ERC4626
  //   preview; no transfers, but works everywhere.
  //
  // When `eth_simulateV1` is enabled both flows run concurrently and the
  // `eth_simulateV1` result is preferred; the failure branch is only returned when
  // both flows fail (carrying both errors). Otherwise only the multicall flow runs.
  const [v1, multicall] = await Promise.allSettled([
    useSimulateV1 ? simulatePoolOpV1(input, options) : undefined,
    simulatePoolOpMulticall(input, options),
  ]);

  // Prefer eth_simulateV1: it carries the actual ERC-20 transfers.
  if (v1.status === "fulfilled" && v1.value) {
    return { status: "success", ...v1.value };
  }
  if (multicall.status === "fulfilled") {
    if (v1.status === "rejected") {
      logger?.debug(
        asPreviewSimulationError(v1.reason, "eth_simulateV1"),
        "eth_simulateV1 flow failed; falling back to multicall result",
      );
    }
    return { status: "success", ...multicall.value };
  }

  const error = combinePreviewSimulationErrors(
    v1.status === "rejected"
      ? asPreviewSimulationError(v1.reason, "eth_simulateV1")
      : undefined,
    asPreviewSimulationError(multicall.reason, "multicall"),
  );
  logger?.error(error, "pool operation simulation failed");
  return { status: "failure", error };
}
