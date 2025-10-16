import { type Address, type PublicClient, parseAbi } from "viem";
import type {
  InputValueParams,
  PriceFeedSetupParams,
} from "../../core/index.js";

export const balancerWeightedPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::BALANCER_WEIGHTED",
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
          publicClient: PublicClient,
        ) => {
          const { balancerPool } = values;

          return await publicClient.readContract({
            abi: parseAbi([
              "function getRate() external view returns (uint256)",
            ]),
            address: balancerPool as Address,
            functionName: "getRate",
          });
        },
      },
    },
    {
      label: "balancerPool",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeeds",
      type: { type: "pricefeedParamsVariable", qty: 8, minNonZero: 2 },
    },
  ],
  stalenessPeriod: false,
};
