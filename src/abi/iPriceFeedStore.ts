export const iPriceFeedStoreAbi = [
  {
    type: "function",
    name: "addPriceFeed",
    inputs: [
      { name: "priceFeed", type: "address", internalType: "address" },
      { name: "stalenessPeriod", type: "uint32", internalType: "uint32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowPriceFeed",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "priceFeed", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "forbidPriceFeed",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "priceFeed", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllowanceTimestamp",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "priceFeed", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getKnownPriceFeeds",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getKnownTokens",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceFeeds",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStalenessPeriod",
    inputs: [{ name: "priceFeed", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenPriceFeedsMap",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct ConnectedPriceFeed[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "priceFeeds", type: "address[]", internalType: "address[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAllowedPriceFeed",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "priceFeed", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setStalenessPeriod",
    inputs: [
      { name: "priceFeed", type: "address", internalType: "address" },
      { name: "stalenessPeriod", type: "uint32", internalType: "uint32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AddPriceFeed",
    inputs: [
      {
        name: "priceFeed",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AllowPriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ForbidPriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetStalenessPeriod",
    inputs: [
      {
        name: "priceFeed",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CallerIsNotOwnerException",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PriceFeedAlreadyAddedException",
    inputs: [{ name: "priceFeed", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PriceFeedIsNotAllowedException",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "priceFeed", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "PriceFeedNotKnownException",
    inputs: [{ name: "priceFeed", type: "address", internalType: "address" }],
  },
] as const;
