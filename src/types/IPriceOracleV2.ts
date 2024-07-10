//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV2Abi = [
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "convert",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertFromUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amountFrom", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "amountTo", internalType: "uint256", type: "uint256" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "fastCheck",
    outputs: [
      { name: "collateralFrom", internalType: "uint256", type: "uint256" },
      { name: "collateralTo", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedsWithFlags",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewPriceFeed",
  },
  { type: "error", inputs: [], name: "ChainPriceStaleException" },
  { type: "error", inputs: [], name: "PriceOracleNotExistsException" },
  { type: "error", inputs: [], name: "ZeroPriceException" },
] as const

