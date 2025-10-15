export const defillamaCompressorAbi = [
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
    name: "getCreditAccounts",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      { name: "offset", type: "uint256", internalType: "uint256" },
      { name: "limit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct DefillamaCreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "debt", type: "uint256", internalType: "uint256" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct DefillamaTokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "balance", type: "uint256", internalType: "uint256" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct DefillamaCreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "debt", type: "uint256", internalType: "uint256" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct DefillamaTokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "balance", type: "uint256", internalType: "uint256" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditManagers",
    inputs: [
      { name: "configurators", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      { name: "creditManagers", type: "address[]", internalType: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditManagers",
    inputs: [],
    outputs: [
      { name: "creditManagers", type: "address[]", internalType: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPools",
    inputs: [
      { name: "configurators", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "pools",
        type: "tuple[]",
        internalType: "struct DefillamaPoolData[]",
        components: [
          { name: "pool", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          {
            name: "availableLiquidity",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "totalBorrowed", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPools",
    inputs: [],
    outputs: [
      {
        name: "pools",
        type: "tuple[]",
        internalType: "struct DefillamaPoolData[]",
        components: [
          { name: "pool", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          {
            name: "availableLiquidity",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "totalBorrowed", type: "uint256", internalType: "uint256" },
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
