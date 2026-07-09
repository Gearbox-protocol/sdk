export const iUniswapV2AdapterAbi = [
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
    ],
    name: "isPairAllowed",
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
        name: "pairs",
        internalType: "struct UniswapV2PairStatus[]",
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
            name: "allowed",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    name: "setPairStatusBatch",
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
        name: "path",
        internalType: "address[]",
        type: "address[]",
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
        name: "path",
        internalType: "address[]",
        type: "address[]",
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
    inputs: [
      {
        name: "amountOut",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "amountInMax",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "path",
        internalType: "address[]",
        type: "address[]",
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
    name: "swapTokensForExactTokens",
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
        name: "allowed",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "SetPairStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidPathException",
  },
] as const;
