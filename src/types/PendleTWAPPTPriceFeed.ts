//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PendleTWAPPTPriceFeed
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pendleTwapptPriceFeedAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_market", internalType: "address", type: "address" },
      { name: "_priceFeed", internalType: "address", type: "address" },
      { name: "_stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "_twapWindow", internalType: "uint32", type: "uint32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expiry",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "market",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeed",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeedType",
    outputs: [{ name: "", internalType: "enum PriceFeedType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "skipCheck",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "skipPriceCheck",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stalenessPeriod",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "sy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "twapWindow",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
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
    type: "function",
    inputs: [],
    name: "yt",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectPriceFeedException" },
  { type: "error", inputs: [], name: "StalePriceException" },
] as const

