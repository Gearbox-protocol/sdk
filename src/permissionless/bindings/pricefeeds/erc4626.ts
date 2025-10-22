import { type Address, type PublicClient, parseAbi } from "viem";
import type {
  InputValueParams,
  PriceFeedSetupParams,
} from "../../core/index.js";

export const erc4626PriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::ERC4626",
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
          const { vault } = values;
          const decimals = await publicClient.readContract({
            abi: parseAbi([
              "function decimals() external view returns (uint8)",
            ]),
            address: vault as Address,
            functionName: "decimals",
          });

          const price = await publicClient.readContract({
            abi: parseAbi([
              "function convertToAssets(uint256 assets) external view returns (uint256)",
            ]),
            address: vault as Address,
            functionName: "convertToAssets",
            args: [10n ** BigInt(decimals)],
          });

          return price;
        },
      },
    },
    {
      label: "vault",
      type: { type: "address" },
    },

    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
  ],
  stalenessPeriod: false,
};
