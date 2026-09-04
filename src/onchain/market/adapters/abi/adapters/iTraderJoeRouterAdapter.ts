export const iTraderJoeRouterAdapterAbi = [
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
        name: "binStep",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "poolVersion",
        internalType: "enum Version",
        type: "uint8",
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
        internalType: "struct TraderJoePoolStatus[]",
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
            name: "binStep",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "poolVersion",
            internalType: "enum Version",
            type: "uint8",
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
    inputs: [],
    name: "supportedPools",
    outputs: [
      {
        name: "pools",
        internalType: "struct TraderJoePool[]",
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
            name: "binStep",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "poolVersion",
            internalType: "enum Version",
            type: "uint8",
          },
        ],
      },
    ],
    stateMutability: "view",
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
        internalType: "struct Path",
        type: "tuple",
        components: [
          {
            name: "pairBinSteps",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          {
            name: "versions",
            internalType: "enum Version[]",
            type: "uint8[]",
          },
          {
            name: "tokenPath",
            internalType: "contract IERC20[]",
            type: "address[]",
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
        internalType: "struct Path",
        type: "tuple",
        components: [
          {
            name: "pairBinSteps",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          {
            name: "versions",
            internalType: "enum Version[]",
            type: "uint8[]",
          },
          {
            name: "tokenPath",
            internalType: "contract IERC20[]",
            type: "address[]",
          },
        ],
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "swapDiffTokensForTokensSupportingFeeOnTransferTokens",
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
        internalType: "struct Path",
        type: "tuple",
        components: [
          {
            name: "pairBinSteps",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          {
            name: "versions",
            internalType: "enum Version[]",
            type: "uint8[]",
          },
          {
            name: "tokenPath",
            internalType: "contract IERC20[]",
            type: "address[]",
          },
        ],
      },
      {
        name: "_to",
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
        internalType: "struct Path",
        type: "tuple",
        components: [
          {
            name: "pairBinSteps",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          {
            name: "versions",
            internalType: "enum Version[]",
            type: "uint8[]",
          },
          {
            name: "tokenPath",
            internalType: "contract IERC20[]",
            type: "address[]",
          },
        ],
      },
      {
        name: "_to",
        internalType: "address",
        type: "address",
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
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
        name: "binStep",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "poolVersion",
        internalType: "enum Version",
        type: "uint8",
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
