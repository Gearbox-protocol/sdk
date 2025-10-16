import { toHex } from "viem";
import { PriceFeedSetupParams } from "../../core";

export const pythPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::PYTH",
  version: 310,
  constructorParams: [
    {
      label: "token",
      type: { type: "address" },
      displayOrder: 1,
    },
    {
      label: "priceFeedId",
      type: {
        type: "bytes32",
        formatValue: (value) => {
          if (value.startsWith("0x") && value.length === 66) {
            return value as `0x${string}`;
          }
          return toHex(value, { size: 32 }) as `0x${string}`;
        },
      },
    },
    {
      label: "pyth",
      type: { type: "address" },
    },
    {
      label: "maxConfToPriceRatio",
      type: { type: "uint256" },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 2,
    },
  ],
  stalenessPeriod: true,
};
