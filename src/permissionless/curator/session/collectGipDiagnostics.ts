import { type Address, erc20Abi } from "viem";
import type { GipMarketAction } from "../actions/types.js";
import {
  type GipDiagnostic,
  getGipDiagnostics,
} from "../diagnostics/getGipDiagnostics.js";
import { findIncompleteRwaPeripherySetups } from "../rwaPeripherySetup.js";
import { errorMessage } from "../utils/errorMessage.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { rwaPeripheryLookups } from "./rwaPeripheryLookups.js";
import type { IncompleteCheck } from "./types.js";

/** A market as the diagnostic checks see it. **/
export interface DiagnosticMarketInput {
  address: Address;
  underlyingAsset: Address;
  transactions: GipMarketAction[];
}

/**
 * Runs the full `getGipDiagnostics` check set against the source block.
 *
 * Every read it needs is wired here instead of being skipped. When one of them
 * fails, the failing check is named in {@link IncompleteCheck}s rather than
 * silently dropped, so a caller can tell "no diagnostics" from "not checked".
 **/
export async function collectGipDiagnostics(args: {
  runtime: GipSdkRuntime;
  markets: DiagnosticMarketInput[];
}): Promise<{
  diagnostics: GipDiagnostic<DiagnosticMarketInput>[];
  incompleteChecks: IncompleteCheck[];
}> {
  const { runtime, markets } = args;
  const incompleteChecks: IncompleteCheck[] = [];
  if (markets.length === 0) return { diagnostics: [], incompleteChecks };

  const client = runtime.readClient;
  const lookups = rwaPeripheryLookups(runtime);

  const diagnostics = await getGipDiagnostics({
    markets,
    registry: runtime.registry,
    balanceOf: asset =>
      client.readContract({
        address: asset,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [runtime.source.marketConfigurator],
      }),
    registeredPeripheryContracts: async () => [
      ...(await lookups.getRegistered()),
    ],
    incompleteRwaSetups: () =>
      findIncompleteRwaPeripherySetups({ ...lookups, markets }),
    onIncompleteCheck: (check, error) =>
      incompleteChecks.push({ check, reason: errorMessage(error) }),
  });
  return { diagnostics, incompleteChecks };
}
