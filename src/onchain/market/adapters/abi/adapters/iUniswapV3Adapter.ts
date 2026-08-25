export const iUniswapV3AdapterAbi = [
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
        name: "params",
        internalType: "struct IUniswapV3AdapterTypes.ExactDiffInputParams",
        type: "tuple",
        components: [
          {
            name: "path",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
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
        ],
      },
    ],
    name: "exactDiffInput",
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
        name: "params",
        internalType:
          "struct IUniswapV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          {
            name: "tokenIn",
            internalType: "address",
            type: "address",
          },
          {
            name: "tokenOut",
            internalType: "address",
            type: "address",
          },
          {
            name: "fee",
            internalType: "uint24",
            type: "uint24",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
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
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactDiffInputSingle",
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
        name: "params",
        internalType: "struct ISwapRouter.ExactInputParams",
        type: "tuple",
        components: [
          {
            name: "path",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "recipient",
            internalType: "address",
            type: "address",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountIn",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactInput",
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
        name: "params",
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        type: "tuple",
        components: [
          {
            name: "tokenIn",
            internalType: "address",
            type: "address",
          },
          {
            name: "tokenOut",
            internalType: "address",
            type: "address",
          },
          {
            name: "fee",
            internalType: "uint24",
            type: "uint24",
          },
          {
            name: "recipient",
            internalType: "address",
            type: "address",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountIn",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactInputSingle",
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
        name: "params",
        internalType: "struct ISwapRouter.ExactOutputParams",
        type: "tuple",
        components: [
          {
            name: "path",
            internalType: "bytes",
            type: "bytes",
          },
          {
            name: "recipient",
            internalType: "address",
            type: "address",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountOut",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountInMaximum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactOutput",
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
        name: "params",
        internalType: "struct ISwapRouter.ExactOutputSingleParams",
        type: "tuple",
        components: [
          {
            name: "tokenIn",
            internalType: "address",
            type: "address",
          },
          {
            name: "tokenOut",
            internalType: "address",
            type: "address",
          },
          {
            name: "fee",
            internalType: "uint24",
            type: "uint24",
          },
          {
            name: "recipient",
            internalType: "address",
            type: "address",
          },
          {
            name: "deadline",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountOut",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "amountInMaximum",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactOutputSingle",
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
        name: "fee",
        internalType: "uint24",
        type: "uint24",
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
        internalType: "struct UniswapV3PoolStatus[]",
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
            name: "fee",
            internalType: "uint24",
            type: "uint24",
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
        name: "fee",
        internalType: "uint24",
        type: "uint24",
        indexed: true,
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
