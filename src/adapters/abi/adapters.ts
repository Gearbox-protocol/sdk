/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "kind", internalType: "enum SwapKind", type: "uint8" },
      {
        name: "swaps",
        internalType: "struct BatchSwapStep[]",
        type: "tuple[]",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "assetInIndex", internalType: "uint256", type: "uint256" },
          { name: "assetOutIndex", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "assets", internalType: "contract IAsset[]", type: "address[]" },
      {
        name: "",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limits", internalType: "int256[]", type: "int256[]" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "batchSwap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address payable", type: "address" },
      {
        name: "request",
        internalType: "struct ExitPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "minAmountsOut",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "exitPool",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetOut", internalType: "contract IAsset", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "minAmountOut", internalType: "uint256", type: "uint256" },
    ],
    name: "exitPoolSingleAsset",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetOut", internalType: "contract IAsset", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exitPoolSingleAssetDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      {
        name: "request",
        internalType: "struct JoinPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "maxAmountsIn",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "joinPool",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetIn", internalType: "contract IAsset", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "minAmountOut", internalType: "uint256", type: "uint256" },
    ],
    name: "joinPoolSingleAsset",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetIn", internalType: "contract IAsset", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "joinPoolSingleAssetDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "poolStatus",
    outputs: [{ name: "", internalType: "enum PoolStatus", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "newStatus", internalType: "enum PoolStatus", type: "uint8" },
    ],
    name: "setPoolStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "singleSwap",
        internalType: "struct SingleSwap",
        type: "tuple",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "kind", internalType: "enum SwapKind", type: "uint8" },
          { name: "assetIn", internalType: "contract IAsset", type: "address" },
          {
            name: "assetOut",
            internalType: "contract IAsset",
            type: "address",
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limit", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "singleSwapDiff",
        internalType: "struct SingleSwapDiff",
        type: "tuple",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "assetIn", internalType: "contract IAsset", type: "address" },
          {
            name: "assetOut",
            internalType: "contract IAsset",
            type: "address",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "limitRateRAY", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
        name: "poolId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newStatus",
        internalType: "enum PoolStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "PoolNotSupportedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV3RouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV3RouterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAllowedPools",
    outputs: [{ name: "pools", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "pools", internalType: "address[]", type: "address[]" },
      { name: "statuses", internalType: "bool[]", type: "bool[]" },
    ],
    name: "setPoolStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "contract IERC20", type: "address" },
      { name: "tokenOut", internalType: "contract IERC20", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapSingleTokenDiffIn",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "contract IERC20", type: "address" },
      { name: "tokenOut", internalType: "contract IERC20", type: "address" },
      { name: "exactAmountIn", internalType: "uint256", type: "uint256" },
      { name: "minAmountOut", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "wethIsEth", internalType: "bool", type: "bool" },
      { name: "userData", internalType: "bytes", type: "bytes" },
    ],
    name: "swapSingleTokenExactIn",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "InvalidLengthException" },
  { type: "error", inputs: [], name: "InvalidPoolException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV3RouterAdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV3RouterAdapterEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV3RouterAdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV3RouterAdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "InvalidLengthException" },
  { type: "error", inputs: [], name: "InvalidPoolException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICamelotV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCamelotV3AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3AdapterTypes.ExactDiffInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactDiffInput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType:
          "struct ICamelotV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactDiffInputSingle",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType:
          "struct ICamelotV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactDiffInputSingleSupportingFeeOnTransferTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactInput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactInputSingleSupportingFeeOnTransferTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactOutputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactOutput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactOutputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactOutputSingle",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct CamelotV3PoolStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
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
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexV1BaseRewardPoolAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BaseRewardPoolAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveLPtoken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward4",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getReward",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "stake",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "stakeDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "stakedPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawAndUnwrap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiffAndUnwrap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawPhantomToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexV1BoosterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BoosterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "depositDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToConvexToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToCurveToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateSupportedPids",
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
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pid", internalType: "uint256", type: "uint256", indexed: true },
    ],
    name: "AddSupportedPid",
  },
  { type: "error", inputs: [], name: "UnsupportedPidException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1AdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_2AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_2AssetsAdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_3AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_3AssetsAdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[3]", type: "uint256[3]" },
    ],
    name: "remove_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_4AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_4AssetsAdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[4]", type: "uint256[4]" },
    ],
    name: "remove_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_StableNGAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1StableNgAdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "remove_liquidity",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDaiUsdsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDaiUsdsAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "dai",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "daiToUsds",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "daiToUsdsDiff",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "usds",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "usdsToDai",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "usdsToDaiDiff",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC4626Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc4626AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "asset",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "redeemDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IEqualizerRouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iEqualizerRouterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
      { name: "stable", internalType: "bool", type: "bool" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct EqualizerPoolStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "allowed", internalType: "bool", type: "bool" },
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
        ],
      },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "amountOutMin", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
        ],
      },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "stable", internalType: "bool", type: "bool", indexed: false },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILidoV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLidoV1AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "submit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "submitDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMellowVaultAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMellowVaultAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "allowedUnderlyings",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "minLpAmount", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "minLpAmount", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "depositOneAsset",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "depositOneAssetDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "underlyings",
        internalType: "struct MellowUnderlyingStatus[]",
        type: "tuple[]",
        components: [
          { name: "underlying", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "setUnderlyingStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "newStatus", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetUnderlyingStatus",
  },
  { type: "error", inputs: [], name: "IncorrectArrayLengthException" },
  {
    type: "error",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "UnderlyingNotAllowedException",
  },
  {
    type: "error",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "UnderlyingNotFoundException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMellowVaultAdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMellowVaultAdapterEventsAbi = [
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
      { name: "newStatus", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetUnderlyingStatus",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMellowVaultAdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMellowVaultAdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "IncorrectArrayLengthException" },
  {
    type: "error",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "UnderlyingNotAllowedException",
  },
  {
    type: "error",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "UnderlyingNotFoundException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPendleRouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPendleRouterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAllowedPairs",
    outputs: [
      {
        name: "pairs",
        internalType: "struct PendlePairStatus[]",
        type: "tuple[]",
        components: [
          { name: "market", internalType: "address", type: "address" },
          { name: "inputToken", internalType: "address", type: "address" },
          { name: "pendleToken", internalType: "address", type: "address" },
          { name: "status", internalType: "enum PendleStatus", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "inputToken", internalType: "address", type: "address" },
      { name: "pendleToken", internalType: "address", type: "address" },
    ],
    name: "isPairAllowed",
    outputs: [
      { name: "status", internalType: "enum PendleStatus", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pt", internalType: "address", type: "address" }],
    name: "ptToMarket",
    outputs: [{ name: "market", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "yt", internalType: "address", type: "address" },
      { name: "leftoverPt", internalType: "uint256", type: "uint256" },
      {
        name: "output",
        internalType: "struct TokenDiffOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minRateRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "redeemDiffPyToToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "yt", internalType: "address", type: "address" },
      { name: "netPyIn", internalType: "uint256", type: "uint256" },
      {
        name: "output",
        internalType: "struct TokenOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minTokenOut", internalType: "uint256", type: "uint256" },
          { name: "tokenRedeemSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
    name: "redeemPyToToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pairs",
        internalType: "struct PendlePairStatus[]",
        type: "tuple[]",
        components: [
          { name: "market", internalType: "address", type: "address" },
          { name: "inputToken", internalType: "address", type: "address" },
          { name: "pendleToken", internalType: "address", type: "address" },
          { name: "status", internalType: "enum PendleStatus", type: "uint8" },
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
      { name: "market", internalType: "address", type: "address" },
      { name: "leftoverPt", internalType: "uint256", type: "uint256" },
      {
        name: "diffOutput",
        internalType: "struct TokenDiffOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minRateRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "swapDiffPtForToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
      {
        name: "guessPtOut",
        internalType: "struct ApproxParams",
        type: "tuple",
        components: [
          { name: "guessMin", internalType: "uint256", type: "uint256" },
          { name: "guessMax", internalType: "uint256", type: "uint256" },
          { name: "guessOffchain", internalType: "uint256", type: "uint256" },
          { name: "maxIteration", internalType: "uint256", type: "uint256" },
          { name: "eps", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "diffInput",
        internalType: "struct TokenDiffInput",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "leftoverTokenIn", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "swapDiffTokenForPt",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "market", internalType: "address", type: "address" },
      { name: "exactPtIn", internalType: "uint256", type: "uint256" },
      {
        name: "output",
        internalType: "struct TokenOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minTokenOut", internalType: "uint256", type: "uint256" },
          { name: "tokenRedeemSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      {
        name: "limit",
        internalType: "struct LimitOrderData",
        type: "tuple",
        components: [
          { name: "limitRouter", internalType: "address", type: "address" },
          { name: "epsSkipMarket", internalType: "uint256", type: "uint256" },
          {
            name: "normalFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "optData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "swapExactPtForToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "market", internalType: "address", type: "address" },
      { name: "minPtOut", internalType: "uint256", type: "uint256" },
      {
        name: "guessPtOut",
        internalType: "struct ApproxParams",
        type: "tuple",
        components: [
          { name: "guessMin", internalType: "uint256", type: "uint256" },
          { name: "guessMax", internalType: "uint256", type: "uint256" },
          { name: "guessOffchain", internalType: "uint256", type: "uint256" },
          { name: "maxIteration", internalType: "uint256", type: "uint256" },
          { name: "eps", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "input",
        internalType: "struct TokenInput",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "netTokenIn", internalType: "uint256", type: "uint256" },
          { name: "tokenMintSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      {
        name: "limit",
        internalType: "struct LimitOrderData",
        type: "tuple",
        components: [
          { name: "limitRouter", internalType: "address", type: "address" },
          { name: "epsSkipMarket", internalType: "uint256", type: "uint256" },
          {
            name: "normalFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "optData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "swapExactTokenForPt",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
        name: "market",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "inputToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "pendleToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "allowed",
        internalType: "enum PendleStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPairStatus",
  },
  { type: "error", inputs: [], name: "PairNotAllowedException" },
  { type: "error", inputs: [], name: "RedemptionNotAllowedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPendleRouterAdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPendleRouterAdapterEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "market",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "inputToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "pendleToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "allowed",
        internalType: "enum PendleStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPairStatus",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPendleRouterAdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPendleRouterAdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "PairNotAllowedException" },
  { type: "error", inputs: [], name: "RedemptionNotAllowedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IStakingRewardsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iStakingRewardsAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getReward",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardsToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "stake",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "stakeDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "stakedPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawPhantomToken",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV2AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
    ],
    name: "isPairAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
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
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "amountOutMin", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      { name: "amountInMax", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapTokensForExactTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPairStatus",
  },
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV3AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactDiffInput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactDiffInputSingle",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactInput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
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
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactOutput",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactOutputSingle",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
      { name: "fee", internalType: "uint24", type: "uint24" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
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
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "allowed", internalType: "bool", type: "bool" },
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
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "fee", internalType: "uint24", type: "uint24", indexed: true },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVelodromeV2RouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVelodromeV2RouterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
      { name: "stable", internalType: "bool", type: "bool" },
      { name: "factory", internalType: "address", type: "address" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
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
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
        ],
      },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "amountOutMin", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
        ],
      },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "stable", internalType: "bool", type: "bool", indexed: false },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IYearnV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iYearnV2AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "maxLoss", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IwstETHV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthv1AdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "unwrap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrapDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
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
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "wrap",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "wrapDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
