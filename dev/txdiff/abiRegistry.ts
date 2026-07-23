import type { Abi, AbiItem } from "viem";
import { toFunctionSelector } from "viem";
import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../src/abi/310/generated.js";
import * as errorAbis from "../../src/abi/errors.js";
import { iSecuritizeRWAFactoryAbi } from "../../src/abi/rwa/iSecuritizeRWAFactory.js";
import * as adapterAbis from "../../src/plugins/adapters/abi/adapters/index.js";
import * as securitizeAbis from "../../src/plugins/adapters/abi/securitize/index.js";

/**
 * Collects every exported ABI array from a namespace module.
 */
function collectAbis(ns: Record<string, unknown>): Abi[] {
  return Object.values(ns).filter(
    (v): v is Abi => Array.isArray(v) && v.length > 0,
  );
}

/**
 * Outer transaction ABIs: RWA factory wrappers and credit facade entrypoints.
 */
export const OUTER_ABIS: Abi[] = [
  iSecuritizeRWAFactoryAbi as unknown as Abi,
  iCreditFacadeV310Abi as unknown as Abi,
];

/**
 * Inner multicall ABIs: facade self-calls plus every adapter / securitize ABI.
 */
export const INNER_ABIS: Abi[] = [
  iCreditFacadeMulticallV310Abi as unknown as Abi,
  ...collectAbis(adapterAbis as Record<string, unknown>),
  ...collectAbis(securitizeAbis as Record<string, unknown>),
];

/**
 * All ABIs used for decoding (outer + inner + errors).
 */
export const ALL_ABIS: Abi[] = [
  ...OUTER_ABIS,
  ...INNER_ABIS,
  ...collectAbis(errorAbis as Record<string, unknown>),
];

/**
 * Flat selector → ABI function item registry.
 * Error selectors: use the foundry-cast skill (`cast 4byte`).
 */
export function buildSelectorRegistry(
  abis: Abi[] = ALL_ABIS,
): Map<string, AbiItem> {
  const map = new Map<string, AbiItem>();
  for (const abi of abis) {
    for (const item of abi) {
      if (item.type === "function" && "name" in item && item.name) {
        try {
          const sel = toFunctionSelector(item);
          if (!map.has(sel)) {
            map.set(sel, item);
          }
        } catch {
          // skip non-encodable items
        }
      }
    }
  }
  return map;
}
