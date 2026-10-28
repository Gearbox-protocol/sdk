import { type Address, getContract } from "viem";
import { iPriceFeedStoreAbi } from "../../../../abi/310/iPriceFeedStore.js";
import { iPriceFeedAbi } from "../../../../abi/iPriceFeed.js";
import { isSameAddress } from "../../utils/addressUtils.js";
import {
  type ActionDiagnostic,
  actionError,
  incompleteCheck,
} from "../actionDiagnostics.js";
import type { GipBuilderContext } from "../builderContext.js";
import {
  type ChainRead,
  contractRejected,
  isUnknown,
  readBytecode,
  readChain,
} from "./chainReads.js";

export type PriceFeedMode = "main" | "reserve" | "alias";
export interface PriceFeedResolution {
  code: ChainRead<boolean>;
  allowed: ChainRead<boolean>;
  staleness: ChainRead<number>;
  decimals: ChainRead<number>;
  skip: ChainRead<boolean>;
}

/** Source metadata shared by feed setters, asset admission and aliases. */
export async function resolvePriceFeed(
  ctx: GipBuilderContext,
  token: Address,
  address: Address,
  mode: PriceFeedMode = "main",
): Promise<PriceFeedResolution> {
  const feed = getContract({ address, abi: iPriceFeedAbi, client: ctx.client });
  const store = await readChain(async () => {
    const ap = await ctx.marketConfigurator.getAddressProvider();
    return getContract({
      address: await ap.getAddressOrRevert("PRICE_FEED_STORE"),
      abi: iPriceFeedStoreAbi,
      client: ctx.client,
    });
  });
  const storeContract = store.value;
  const withStore = <T>(
    read: (contract: NonNullable<typeof store.value>) => Promise<T>,
  ): Promise<ChainRead<T>> =>
    storeContract
      ? readChain(() => read(storeContract))
      : Promise.resolve({ error: store.error });
  const [code, allowed, zeroFeed, staleness, decimals, skip] =
    await Promise.all([
      readBytecode(ctx, address),
      withStore(store =>
        mode === "alias"
          ? store.read.isKnownPriceFeed([address])
          : store.read.isAllowedPriceFeed([token, address]),
      ),
      mode === "reserve"
        ? withStore(store => store.read.zeroPriceFeed())
        : undefined,
      withStore(store => store.read.getStalenessPeriod([address])),
      readChain(() => feed.read.decimals()),
      readChain(() => feed.read.skipPriceCheck()),
    ]);
  let allowance = allowed;
  if (mode === "reserve") {
    if (zeroFeed?.value && isSameAddress(address, zeroFeed.value))
      allowance = { value: true };
    else if (allowed.value === false && zeroFeed?.value === undefined)
      allowance = { error: zeroFeed?.error };
  }
  return { code, allowed: allowance, staleness, decimals, skip };
}

export function priceFeedDiagnostics(
  resolved: PriceFeedResolution,
): ActionDiagnostic[] {
  const { code, allowed, staleness, decimals, skip } = resolved;
  const skipCheck = skip.value ?? (contractRejected(skip) ? false : undefined);
  const failures: [boolean, string, string][] = [
    [
      code.value === false,
      "FEED_NOT_CONTRACT",
      "Price feed must have bytecode",
    ],
    [
      allowed.value === false,
      "PRICE_FEED_NOT_ALLOWED",
      "Price feed is not allowed for this token or is unknown to the store",
    ],
    [
      (decimals.value !== undefined && Number(decimals.value) !== 8) ||
        contractRejected(decimals),
      "INVALID_FEED_DECIMALS",
      "Price feeds must implement decimals() returning 8",
    ],
    [
      contractRejected(staleness),
      "UNKNOWN_PRICE_FEED",
      "Price feed has no registered staleness metadata",
    ],
    [
      staleness.value !== undefined &&
        skipCheck !== undefined &&
        (skipCheck ? staleness.value !== 0 : staleness.value === 0),
      "INVALID_FEED_STALENESS",
      "Staleness metadata is inconsistent with skipPriceCheck",
    ],
  ];
  const diagnostics = failures
    .filter(([failed]) => failed)
    .map(([, code, message]) => actionError(code, message));
  if (
    [
      code,
      allowed,
      staleness,
      decimals,
      ...(skipCheck === undefined ? [skip] : []),
    ].some(isUnknown)
  )
    diagnostics.push(
      incompleteCheck(
        "priceFeedValidation",
        "Feed metadata or allowance could not be read at the source block",
      ),
    );
  return diagnostics;
}
