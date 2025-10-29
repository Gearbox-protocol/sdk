export const tokenCompressorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider_", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
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
    name: "getTokenInfo",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct TokenData",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "name", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokens",
    inputs: [{ name: "tokens", type: "address[]", internalType: "address[]" }],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "name", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
