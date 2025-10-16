import { Address, parseAbi, PublicClient } from "viem";
import { InputValueParams, PriceFeedSetupParams } from "../../core";

export const curveCryptoPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::CURVE_CRYPTO",
  version: 310,
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
          publicClient: PublicClient
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
