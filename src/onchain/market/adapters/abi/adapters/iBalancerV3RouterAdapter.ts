export const iBalancerV3RouterAdapterAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "exactAmountsIn",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "minBptAmountOut",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    name: "addLiquidityUnbalanced",
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
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "leftoverAmounts",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "minRatesRAY",
        internalType: "uint256[]",
        type: "uint256[]",
      },
    ],
    name: "addLiquidityUnbalancedDiff",
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
    inputs: [],
    name: "getAllowedPools",
    outputs: [
      {
        name: "pools",
        internalType: "struct BalancerV3PoolStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "pool",
            internalType: "address",
            type: "address",
          },
          {
            name: "status",
            internalType: "enum PoolStatus",
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
        name: "pool",
        internalType: "address",
        type: "address",
      },
    ],
    name: "poolStatus",
    outputs: [
      {
        name: "",
        internalType: "enum PoolStatus",
        type: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "tokenOut",
        internalType: "contract IERC20",
        type: "address",
      },
      {
        name: "minRateRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "removeLiquiditySingleTokenDiff",
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
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "exactBptAmountIn",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "tokenOut",
        internalType: "contract IERC20",
        type: "address",
      },
      {
        name: "minAmountOut",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    name: "removeLiquiditySingleTokenExactIn",
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
        name: "statuses",
        internalType: "struct BalancerV3PoolStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "pool",
            internalType: "address",
            type: "address",
          },
          {
            name: "status",
            internalType: "enum PoolStatus",
            type: "uint8",
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
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "tokenIn",
        internalType: "contract IERC20",
        type: "address",
      },
      {
        name: "tokenOut",
        internalType: "contract IERC20",
        type: "address",
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
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "swapSingleTokenDiffIn",
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
        name: "pool",
        internalType: "address",
        type: "address",
      },
      {
        name: "tokenIn",
        internalType: "contract IERC20",
        type: "address",
      },
      {
        name: "tokenOut",
        internalType: "contract IERC20",
        type: "address",
      },
      {
        name: "exactAmountIn",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minAmountOut",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "deadline",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "wethIsEth",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "userData",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    name: "swapSingleTokenExactIn",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "pool",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "status",
        internalType: "enum PoolStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPoolStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidLengthException",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidPoolException",
  },
] as const;
