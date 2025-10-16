import { toHex } from "viem";
import { PriceFeedSetupParams } from "../../core";

export const redstonePriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::REDSTONE",
  version: 310,
  constructorParams: [
    {
      label: "token",
      type: { type: "address" },
      displayOrder: 1,
    },
    {
      label: "dataServiceId",
      type: { type: "string" },
      defaultValue: "redstone-primary-prod",
      displayOrder: 3,
    },
    {
      label: "dataFeedId",
      type: {
        type: "bytes32",
        formatValue: (value) => toHex(value, { size: 32 }),
      },
      displayOrder: 4,
    },
    {
      label: "signer",
      type: {
        type: "addressArrayFixed",
        qty: 10,
        minNonZero: 0,
        minNonZeroRefLabel: "signersThreshold",
      },
      defaultValue: [
        "0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774",
        "0xdEB22f54738d54976C4c0fe5ce6d408E40d88499",
        "0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202",
        "0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE",
        "0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de",
      ],
      displayOrder: 6,
    },
    {
      label: "signersThreshold",
      type: { type: "uint8" },
      displayOrder: 5,
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 2,
    },
  ],
  stalenessPeriod: true,
};
