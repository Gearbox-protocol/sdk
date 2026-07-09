export const iVelodromeV2RouterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [
      {
        name: "",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
      },
      {
        name: "stable",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "factory",
        internalType: "address",
        type: "address",
      },
    ],
    name: "isPoolAllowed",
    outputs: [
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [
      {
        name: "serializedData",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct VelodromeV2PoolStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "token0",
            internalType: "address",
            type: "address",
          },
          {
            name: "token1",
            internalType: "address",
            type: "address",
          },
          {
            name: "stable",
            internalType: "bool",
            type: "bool",
          },
          {
            name: "factory",
            internalType: "address",
            type: "address",
          },
          {
            name: "allowed",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    name: "setPoolStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          {
            name: "from",
            internalType: "address",
            type: "address",
          },
          {
            name: "to",
            internalType: "address",
            type: "address",
          },
          {
            name: "stable",
            internalType: "bool",
            type: "bool",
          },
          {
            name: "factory",
            internalType: "address",
            type: "address",
          },
        ],
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amountIn",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "amountOutMin",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          {
            name: "from",
            internalType: "address",
            type: "address",
          },
          {
            name: "to",
            internalType: "address",
            type: "address",
          },
          {
            name: "stable",
            internalType: "bool",
            type: "bool",
          },
          {
            name: "factory",
            internalType: "address",
            type: "address",
          },
        ],
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stable",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "allowed",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "SetPoolStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidPathException",
  },
] as const;
