//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompositePriceFeed
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const compositePriceFeedAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "priceFeeds",
        internalType: "struct PriceFeedParams[2]",
        type: "tuple[2]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
        ],
      },
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
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "answer", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeed0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeed1",
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
    name: "skipCheck1",
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
    name: "stalenessPeriod0",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stalenessPeriod1",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetFeedScale",
    outputs: [{ name: "", internalType: "int256", type: "int256" }],
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
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectPriceFeedException" },
  { type: "error", inputs: [], name: "StalePriceException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const

