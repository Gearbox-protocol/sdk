import type { Address, PublicClient } from "viem";
import { AP_PRICE_FEED_COMPRESSOR } from "../../../sdk/constants/index.js";
import { GearboxSDK } from "../../../sdk/index.js";
import { AddressProviderContract } from "../../bindings/index.js";
import type { ParsedCall } from "../../core/index.js";
import { Addresses } from "../../deployment/addresses.js";
import { deepJsonParse } from "../format.js";
import { getUpdatablePriceFeeds } from "./get-updatable-feeds.js";

export function getCallTouchedPriceFeeds(parsedCall: ParsedCall): Address[] {
  const priceFeeds: Address[] = [];

  // Deep parse the arguments to handle nested JSON strings
  const deepParsedArgs = deepJsonParse(parsedCall.args);

  function searchForPriceFeeds(obj: unknown): void {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => {
        searchForPriceFeeds(item);
      });
      return;
    }

    if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        // Check if the key indicates a price feed
        if (key === "priceFeed" || key === "underlyingPriceFeed") {
          priceFeeds.push(value as Address);
        }

        // Recursively search the value
        searchForPriceFeeds(value);
      }
    }
  }

  searchForPriceFeeds(deepParsedArgs);

  return priceFeeds;
}

export function getCallsTouchedPriceFeeds(
  parsedCalls: ParsedCall[],
): Address[] {
  return parsedCalls.flatMap(call => getCallTouchedPriceFeeds(call));
}

export async function getCallsTouchedUpdatablePriceFeeds({
  parsedCalls,
  client,
}: {
  client: PublicClient;
  parsedCalls: ParsedCall[];
}): Promise<Address[]> {
  const addressProvider = new AddressProviderContract(
    Addresses.ADDRESS_PROVIDER,
    client,
  );

  const pfCompressor = await addressProvider.getAddressOrRevert(
    AP_PRICE_FEED_COMPRESSOR,
    310n,
  );

  const sdk = await GearboxSDK.attach({
    rpcURLs: [client.transport.url!],
    marketConfigurators: [],
  });

  const touchedFeeds = parsedCalls.flatMap(call =>
    getCallTouchedPriceFeeds(call),
  );

  return (
    await getUpdatablePriceFeeds({
      sdk,
      client,
      pfCompressor,
      priceFeeds: touchedFeeds,
    })
  ).map(feed => feed.address);
}
