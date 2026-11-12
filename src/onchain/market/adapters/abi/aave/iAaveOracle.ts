export const iAaveOracleAbi = [
  {
    name: "BASE_CURRENCY_UNIT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getAssetsPrices",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address[]", name: "assets" }],
    outputs: [{ type: "uint256[]" }],
  },
] as const;
