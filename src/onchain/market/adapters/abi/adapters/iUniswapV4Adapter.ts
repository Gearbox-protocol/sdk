export const iUniswapV4AdapterAbi = [
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
        name: "poolKey",
        internalType: "struct PoolKey",
        type: "tuple",
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
            name: "tickSpacing",
            internalType: "int24",
            type: "int24",
          },
          {
            name: "hooks",
            internalType: "address",
            type: "address",
          },
        ],
      },
    ],
    name: "isPoolKeyAllowed",
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
        name: "poolKeys",
        internalType: "struct UniswapV4PoolStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "poolKey",
            internalType: "struct PoolKey",
            type: "tuple",
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
                name: "tickSpacing",
                internalType: "int24",
                type: "int24",
              },
              {
                name: "hooks",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "allowed",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    name: "setPoolKeyStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "supportedPoolKeys",
    outputs: [
      {
        name: "poolKeys",
        internalType: "struct PoolKey[]",
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
            name: "tickSpacing",
            internalType: "int24",
            type: "int24",
          },
          {
            name: "hooks",
            internalType: "address",
            type: "address",
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
        name: "poolKey",
        internalType: "struct PoolKey",
        type: "tuple",
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
            name: "tickSpacing",
            internalType: "int24",
            type: "int24",
          },
          {
            name: "hooks",
            internalType: "address",
            type: "address",
          },
        ],
      },
      {
        name: "zeroForOne",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "amountIn",
        internalType: "uint128",
        type: "uint128",
      },
      {
        name: "amountOutMinimum",
        internalType: "uint128",
        type: "uint128",
      },
      {
        name: "hooks",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    name: "swapExactInputSingle",
    outputs: [
      {
        name: "",
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
        name: "poolKey",
        internalType: "struct PoolKey",
        type: "tuple",
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
            name: "tickSpacing",
            internalType: "int24",
            type: "int24",
          },
          {
            name: "hooks",
            internalType: "address",
            type: "address",
          },
        ],
      },
      {
        name: "zeroForOne",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "leftoverAmount",
        internalType: "uint128",
        type: "uint128",
      },
      {
        name: "rateMinRAY",
        internalType: "uint128",
        type: "uint128",
      },
    ],
    name: "swapExactInputSingleDiff",
    outputs: [
      {
        name: "",
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
    type: "function",
    inputs: [],
    name: "weth",
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
        indexed: false,
      },
      {
        name: "tickSpacing",
        internalType: "int24",
        type: "int24",
        indexed: false,
      },
      {
        name: "hooks",
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
    name: "SetPoolKeyStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidPoolKeyException",
  },
] as const;

export const iUniswapV4GatewayAbi = [
  {
    type: "function",
    inputs: [],
    name: "permit2",
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
        name: "poolKey",
        internalType: "struct PoolKey",
        type: "tuple",
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
            name: "tickSpacing",
            internalType: "int24",
            type: "int24",
          },
          {
            name: "hooks",
            internalType: "address",
            type: "address",
          },
        ],
      },
      {
        name: "zeroForOne",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "amountIn",
        internalType: "uint128",
        type: "uint128",
      },
      {
        name: "amountOutMinimum",
        internalType: "uint128",
        type: "uint128",
      },
      {
        name: "hookData",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    name: "swapExactInputSingle",
    outputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "universalRouter",
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
    name: "weth",
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
    type: "error",
    inputs: [],
    name: "UnexpectedETHTransferException",
  },
] as const;
