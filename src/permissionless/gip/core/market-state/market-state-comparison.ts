// External libraries
import { Address, zeroAddress } from "viem";

// Local imports
import type { MarketState } from "./types.js";

/**
 * Utility function to normalize addresses in objects for comparison
 */
function normalizeAddressesInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    // If it looks like an address (starts with 0x and is 42 chars), normalize it
    if (obj.startsWith("0x") && obj.length === 42) {
      return obj.toLowerCase();
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeAddressesInObject);
  }

  if (typeof obj === "object") {
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Normalize the key if it's an address
      const normalizedKey =
        key.startsWith("0x") && key.length === 42 ? key.toLowerCase() : key;
      normalized[normalizedKey] = normalizeAddressesInObject(value);
    }
    return normalized;
  }

  return obj;
}

/**
 * Normalize all addresses in a MarketState object for consistent comparison
 */
export function normalizeMarketState(marketState: MarketState): MarketState {
  return normalizeAddressesInObject(marketState) as MarketState;
}

/**
 * Comparison result for MarketState objects
 */
export interface MarketStateComparison {
  isEqual: boolean;
  differences: MarketStateDifference[];
}

export interface MarketStateDifference {
  path: string;
  type: "added" | "removed" | "modified" | "type_mismatch";
  lhsValue?: any;
  rhsValue?: any;
  details?: string;
}

// ================================
// NORMALIZATION STRATEGIES
// ================================

/**
 * Normalizes Ethereum addresses to lowercase for case-insensitive comparison.
 * Purpose: Ensures 0xABC... and 0xabc... are treated as the same address.
 */
function normalizeEthereumAddresses(value: any): any {
  if (
    typeof value === "string" &&
    value.startsWith("0x") &&
    value.length === 42
  ) {
    return value.toLowerCase();
  }
  return value;
}

/**
 * Normalizes token pair objects by ensuring consistent token ordering.
 * Purpose: DEX trading pairs like DAI/WETH and WETH/DAI represent the same market.
 * Ensures token0 is always the lexicographically smaller address.
 */
function normalizeTokenPair(obj: Record<string, any>): Record<string, any> {
  if (!Object.hasOwn(obj, "token0") || !Object.hasOwn(obj, "token1")) {
    return obj;
  }

  const token0 = normalizeEthereumAddresses(obj.token0);
  const token1 = normalizeEthereumAddresses(obj.token1);

  // Sort tokens lexicographically to ensure consistent ordering
  const [sortedToken0, sortedToken1] = [token0, token1].sort();

  return {
    ...obj,
    token0: sortedToken0,
    token1: sortedToken1,
  };
}

/**
 * Normalizes object property order for consistent comparison.
 * Purpose: Objects with same properties in different order should be equal.
 * Example: {a: 1, b: 2} === {b: 2, a: 1}
 */
function normalizePropertyOrder(obj: Record<string, any>): Record<string, any> {
  const sortedKeys = Object.keys(obj).sort();
  const normalized: Record<string, any> = {};

  for (const key of sortedKeys) {
    normalized[key] = obj[key];
  }

  return normalized;
}

/**
 * Registry of normalization strategies that can be easily extended.
 * Add new normalizers here as needed for different object types.
 */
const NORMALIZATION_STRATEGIES = [
  // Periphery registration changes only the address/domain pair. Contract type
  // and version are intrinsic metadata read from the deployed contract, while
  // a computed GIP state may only have empty/zero placeholders before
  // deployment.
  {
    name: "peripheryRegistration",
    description:
      "Compares periphery registrations by address and domain identity",
    shouldApply: (obj: any) =>
      obj &&
      typeof obj === "object" &&
      typeof obj.address === "string" &&
      (obj.domain === "DEGEN_NFT" || obj.domain === "ZAPPER") &&
      Object.hasOwn(obj, "type") &&
      Object.hasOwn(obj, "version"),
    normalize: (obj: Record<string, any>) => ({
      address: obj.address,
      domain: obj.domain,
    }),
  },
  // handle token pairs in Uniswap adapters
  {
    name: "tokenPair",
    description:
      "Normalizes adapter's token pairs for order-independent comparison",
    shouldApply: (obj: any) =>
      obj &&
      typeof obj === "object" &&
      Object.hasOwn(obj, "token0") &&
      Object.hasOwn(obj, "token1"),
    normalize: normalizeTokenPair,
  },
  // Remove salt (if it's included in state object)
  {
    name: "salt",
    description: "Removes salt from pool configuration objects",
    shouldApply: (obj: any) => obj && Object.hasOwn(obj, "salt"),
    normalize: (obj: any) => {
      delete obj.salt;
      return obj;
    },
  },
];

/**
 * Applies all applicable normalization strategies to an object.
 * This is the main normalization entry point that:
 * 1. Applies domain-specific normalizations (token pairs, etc.)
 * 2. Normalizes Ethereum addresses to lowercase
 * 3. Sorts object properties for consistent ordering
 */
function normalizeObjectForComparison(obj: any): any {
  // Handle primitives and null/undefined
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return normalizeEthereumAddresses(obj);
  }

  // Handle arrays recursively
  if (Array.isArray(obj)) {
    return obj.map(normalizeObjectForComparison);
  }

  // Start with the original object
  let normalized = { ...obj };

  // Apply domain-specific normalization strategies
  for (const strategy of NORMALIZATION_STRATEGIES) {
    if (strategy.shouldApply(normalized)) {
      normalized = strategy.normalize(normalized);
    }
  }

  // Recursively normalize nested objects and arrays
  for (const [key, value] of Object.entries(normalized)) {
    normalized[key] = normalizeObjectForComparison(value);
  }

  // Finally, normalize property order for consistent comparison
  return normalizePropertyOrder(normalized);
}

// ================================
// COMPARISON FUNCTIONS
// ================================

/**
 * Generic type-driven comparison function
 */
function compareAny(
  lhs: any,
  rhs: any,
  path: string,
  differences: MarketStateDifference[],
): void {
  // Handle null/undefined cases
  if (lhs === null || lhs === undefined || rhs === null || rhs === undefined) {
    if (lhs !== rhs) {
      differences.push({
        path: path || "root",
        type: "modified",
        lhsValue: lhs,
        rhsValue: rhs,
      });
    }
    return;
  }

  // Handle type mismatches
  const lhsType = typeof lhs;
  const rhsType = typeof rhs;

  if (lhsType !== rhsType) {
    differences.push({
      path: path || "root",
      type: "type_mismatch",
      lhsValue: lhs,
      rhsValue: rhs,
      details: `Type changed from ${lhsType} to ${rhsType}`,
    });
    return;
  }

  // Handle arrays
  if (Array.isArray(lhs) && Array.isArray(rhs)) {
    compareArrays(lhs, rhs, path, differences);
    return;
  }

  // Handle primitive types
  if (lhsType !== "object") {
    if (lhs !== rhs) {
      // handle not deployed adapters
      if (path.split(".")[path.split(".").length - 1] === "adapter") {
        if (rhs === zeroAddress) {
          return;
        }
      }
      differences.push({
        path: path || "root",
        type: "modified",
        lhsValue: lhs,
        rhsValue: rhs,
      });
    }
    return;
  }

  // Handle objects
  compareObjects(lhs, rhs, path, differences);
}

/**
 * Compare two arrays (order-independent).
 * Purpose: Arrays with same elements in different order should be equal.
 * Example: [A, B, C] === [C, A, B]
 */
function compareArrays(
  lhs: any[],
  rhs: any[],
  path: string,
  differences: MarketStateDifference[],
): void {
  // If lengths are different, arrays are not equal
  if (lhs.length !== rhs.length) {
    differences.push({
      path: path || "root",
      type: "modified",
      lhsValue: lhs,
      rhsValue: rhs,
      details: `Array length changed from ${lhs.length} to ${rhs.length}`,
    });
    return;
  }

  // Create normalized and sorted copies for order-independent comparison
  const sortFn = (a: any, b: any) => {
    const normalizedA = normalizeObjectForComparison(a);
    const normalizedB = normalizeObjectForComparison(b);
    const aStr = JSON.stringify(normalizedA);
    const bStr = JSON.stringify(normalizedB);
    return aStr.localeCompare(bStr);
  };

  const sortedLhs = [...lhs].sort(sortFn);
  const sortedRhs = [...rhs].sort(sortFn);

  // Compare sorted arrays element by element
  for (let i = 0; i < sortedLhs.length; i++) {
    const itemPath = path ? `${path}[sorted:${i}]` : `[sorted:${i}]`;
    compareAny(sortedLhs[i], sortedRhs[i], itemPath, differences);
  }
}

/**
 * Compare two objects after normalization.
 * Purpose: Ensures objects are compared using all normalization strategies.
 */
function compareObjects(
  lhs: Record<string, any>,
  rhs: Record<string, any>,
  path: string,
  differences: MarketStateDifference[],
): void {
  // ignore treasury state
  // TODO: remove this once we move treasury state out of the market state
  if (path.split(".")[path.split(".").length - 1] === "treasury") {
    return;
  }

  // Normalize objects for comparison (handles token pairs, property order, etc.)
  const normalizedLhs = normalizeObjectForComparison(lhs);
  const normalizedRhs = normalizeObjectForComparison(rhs);

  const allKeys = new Set([
    ...Object.keys(normalizedLhs),
    ...Object.keys(normalizedRhs),
  ]);

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key;

    if (!(key in normalizedLhs)) {
      differences.push({
        path: keyPath,
        type: "added",
        rhsValue: normalizedRhs[key],
      });
    } else if (!(key in normalizedRhs)) {
      differences.push({
        path: keyPath,
        type: "removed",
        lhsValue: normalizedLhs[key],
      });
    } else {
      compareAny(normalizedLhs[key], normalizedRhs[key], keyPath, differences);
    }
  }
}

/**
 * Compares two MarketState objects and returns detailed differences
 */
export function compareMarketStates(
  lhs: MarketState,
  rhs: MarketState,
): MarketStateComparison {
  // Normalize both states upfront to handle address case differences
  const normalizedLhs = normalizeMarketState(lhs);
  const normalizedRhs = normalizeMarketState(rhs);

  const differences: MarketStateDifference[] = [];

  // Use generic comparison for the entire MarketState
  compareAny(normalizedLhs, normalizedRhs, "", differences);

  return {
    isEqual: differences.length === 0,
    differences,
  };
}

/**
 * Utility function to format comparison results as a human-readable string
 */
export function formatMarketStateComparison(
  comparison: MarketStateComparison,
): string {
  if (comparison.isEqual) {
    return "Market states are identical.";
  }

  const lines: string[] = [
    `Found ${comparison.differences.length} difference(s):`,
    "",
  ];

  for (const diff of comparison.differences) {
    switch (diff.type) {
      case "added":
        lines.push(`+ ${diff.path}: ${JSON.stringify(diff.rhsValue)}`);
        break;
      case "removed":
        lines.push(`- ${diff.path}: ${JSON.stringify(diff.lhsValue)}`);
        break;
      case "modified":
        lines.push(
          `~ ${diff.path}: ${JSON.stringify(diff.lhsValue)} → ${JSON.stringify(
            diff.rhsValue,
          )}`,
        );
        if (diff.details) {
          lines.push(`  ${diff.details}`);
        }
        break;
      case "type_mismatch":
        lines.push(
          `! ${diff.path}: type changed from ${diff.lhsValue} to ${diff.rhsValue}`,
        );
        break;
    }
  }

  return lines.join("\n");
}
