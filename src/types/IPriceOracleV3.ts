//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV3Abi = [
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "getPriceRaw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPriceSafe",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedParams",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint8", type: "uint8" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
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
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "priceFeedsRaw",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "safeConvertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
    name: "setPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
    ],
    name: "setReservePriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    name: "setReservePriceFeedStatus",
    outputs: [],
    stateMutability: "nonpayable",
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
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
      { name: "trusted", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPriceFeed",
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
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeed",
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
      { name: "active", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeedStatus",
  },
] as const

