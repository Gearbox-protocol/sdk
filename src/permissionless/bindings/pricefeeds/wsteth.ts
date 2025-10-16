import { type Address, type PublicClient, parseAbi } from "viem";
import type { InputValueParams, PriceFeedSetupParams } from "../../core";

export const wstethPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::WSTETH",
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
          const { wstETH } = values;

          return await publicClient.readContract({
            abi: parseAbi([
              "function stEthPerToken() external view returns (uint256)",
            ]),
            address: wstETH as Address,
            functionName: "stEthPerToken",
          });
        },
      },
    },
    {
      label: "wstETH",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
  ],
  stalenessPeriod: false,
};
