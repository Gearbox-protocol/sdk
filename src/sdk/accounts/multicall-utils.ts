import type { Address, Hex } from "viem";
import {
  decodeFunctionData,
  encodeFunctionData,
  getAbiItem,
  toFunctionSelector,
} from "viem";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import type { PriceUpdateV310 } from "../market/pricefeeds/types.js";
import type { MultiCall } from "../types/index.js";
import { AddressMap } from "../utils/AddressMap.js";
import { AddressSet } from "../utils/AddressSet.js";

const ON_DEMAND_SELECTOR = toFunctionSelector(
  getAbiItem({
    abi: iCreditFacadeMulticallV310Abi,
    name: "onDemandPriceUpdates",
  }),
);

const UPDATE_QUOTA_SELECTOR = toFunctionSelector(
  getAbiItem({
    abi: iCreditFacadeMulticallV310Abi,
    name: "updateQuota",
  }),
);

/**
 * Splits a multicall array into existing price-update data and remaining calls.
 *
 * All `onDemandPriceUpdates` entries are decoded and their {@link PriceUpdate}
 * tuples are collected into a flat array. The remaining (non-price-update)
 * calls are returned in their original order.
 *
 * @param calls - Array of multicall entries to split
 * @returns Object with `priceUpdates` (decoded price update tuples) and
 *          `remainingCalls` (everything else, preserving order)
 */
export function extractPriceUpdates(calls: MultiCall[]): {
  priceUpdates: PriceUpdateV310[];
  remainingCalls: MultiCall[];
} {
  const priceUpdates: PriceUpdateV310[] = [];
  const remainingCalls: MultiCall[] = [];

  for (const call of calls) {
    if (isOnDemandPriceUpdateCall(call)) {
      const decoded = decodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        data: call.callData,
      });
      const updates = decoded.args[0] as PriceUpdateV310[];
      priceUpdates.push(...updates);
    } else {
      remainingCalls.push(call);
    }
  }

  return { priceUpdates, remainingCalls };
}

/**
 * Extracts token addresses from `updateQuota` calls that have a positive `quotaChange`.
 *
 * Only tokens whose quota is being increased (i.e. `quotaChange > 0`) are
 * returned, since those are the tokens that require fresh price feed data.
 *
 * @param calls - Array of multicall entries to scan
 * @returns Unique token addresses from positive-change quota updates
 */
export function extractQuotaTokens(calls: MultiCall[]): AddressSet {
  const tokens = new AddressSet();

  for (const { callData } of calls) {
    if (callData.slice(0, 10) !== UPDATE_QUOTA_SELECTOR) {
      continue;
    }

    const decoded = decodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      data: callData,
    });
    const [token, quotaChange] = decoded.args as [Address, bigint, bigint];
    if (quotaChange > 0n) {
      tokens.add(token);
    }
  }

  return tokens;
}

/**
 * Merges two {@link PriceUpdate} arrays, deduplicating by `priceFeed` address.
 *
 * When both arrays contain an update for the same price feed, the entry from
 * `existing` takes priority (the caller explicitly included it).
 *
 * @param existing - Price updates already present in the multicall
 * @param generated - Newly generated price updates to merge in
 * @returns Merged array with no duplicate `priceFeed` addresses
 */
export function mergePriceUpdates(
  existing: PriceUpdateV310[],
  generated: PriceUpdateV310[],
): PriceUpdateV310[] {
  const seen = new AddressMap<PriceUpdateV310>();

  for (const u of [...generated, ...existing]) {
    seen.upsert(u.priceFeed, u);
  }

  return seen.values();
}

/**
 * Checks whether a {@link MultiCall} is an `onDemandPriceUpdates` call.
 *
 * @param call - Multicall entry to check
 * @returns `true` if `call.callData` starts with the `onDemandPriceUpdates` selector
 */
function isOnDemandPriceUpdateCall(call: MultiCall): boolean {
  return call.callData.slice(0, 10) === ON_DEMAND_SELECTOR;
}
