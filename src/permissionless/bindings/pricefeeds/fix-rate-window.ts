import { type Address, type PublicClient, parseAbi } from "viem";
import type {
  InputValueParams,
  PriceFeedParams,
  PriceFeedSetupParams,
} from "../../core/index.js";

export const fixRateWindowPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::FIXED_RATE_WINDOW",
  version: 310,
  constructorParams: [
    {
      label: "priceStore",
      type: { type: "owner" },
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
    {
      label: "initial growth rate",
      type: { type: "uint16" },
      defaultValue: "0",
    },
    {
      label: "initial lowerbound",
      type: {
        type: "lowerbound",
        getter: async (
          values: Record<string, InputValueParams>,
          publicClient: PublicClient,
        ) => {
          const { underlyingPriceFeed } = values;
          const { address } = underlyingPriceFeed as PriceFeedParams;

          const [, answer] = await publicClient.readContract({
            abi: parseAbi([
              "function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint80)",
            ]),
            address: address as Address,
            functionName: "latestRoundData",
          });

          return answer;
        },
      },
    },
    {
      label: "max growth rate",
      type: { type: "uint16" },
      defaultValue: "10000",
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 2,
    },
  ],
  stalenessPeriod: false,
};
