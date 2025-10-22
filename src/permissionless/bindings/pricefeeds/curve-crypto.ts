import { type Address, type PublicClient, parseAbi } from "viem";
import type {
  InputValueParams,
  PriceFeedSetupParams,
} from "../../core/index.js";

export const curveCryptoPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::CURVE_CRYPTO",
  version: 311,
  constructorParams: [
    {
      label: "priceStore",
      type: { type: "owner" },
    },
    {
      label: "lowerbound",
      type: {
        type: "lowerbound",
        getter: async (
          values: Record<string, InputValueParams>,
          publicClient: PublicClient,
        ) => {
          const { pool } = values;

          return await publicClient.readContract({
            abi: parseAbi([
              "function get_virtual_price() external view returns (uint256)",
            ]),
            address: pool as Address,
            functionName: "get_virtual_price",
          });
        },
      },
    },
    {
      label: "token",
      type: { type: "address" },
    },
    {
      label: "pool",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeeds",
      type: { type: "pricefeedParamsFixed", qty: 3, minNonZero: 2 },
    },
  ],
  stalenessPeriod: false,
};
