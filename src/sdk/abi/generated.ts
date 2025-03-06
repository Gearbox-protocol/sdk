/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2VaultAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerV2VaultAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "poolStatus",
    outputs: [{ name: "", internalType: "enum PoolStatus", type: "uint8" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "PoolNotSupportedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CamelotV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const camelotV3AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexV1BaseRewardPoolAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexV1BaseRewardPoolAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_baseRewardPool", internalType: "address", type: "address" },
      { name: "_stakedPhantomToken", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "curveLPTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardTokensMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "stake",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "stakeDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "stakedTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "stakingTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawAndUnwrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiffAndUnwrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexV1BoosterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexV1BoosterAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_booster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
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
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateStakedPhantomTokensMap",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pid", internalType: "uint256", type: "uint256", indexed: true },
      {
        name: "phantomToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPidToPhantomToken",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter2Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter2AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter3Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter3AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[3]", type: "uint256[3]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter4Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter4AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[4]", type: "uint256[4]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterDeposit
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterDepositAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curveDeposit", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_nCoins", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterStETH
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterStEthAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      {
        name: "_curveStETHPoolGateway",
        internalType: "address",
        type: "address",
      },
      { name: "_lp_token", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterStableNG
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterStableNgAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC4626Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc4626AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
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
    name: "assetMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "redeemDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "sharesMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

export const uniswapV2AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV3AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactOutput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VelodromeV2RouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const velodromeV2RouterAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WstETHV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wstEthv1AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_wstETH", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETHTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrapDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "wrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "wrapDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "wstETHTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const yearnV2AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenMask",
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "yTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

export const iMellowVaultAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "amounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minLpAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositOneAsset",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minLpAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositOneAssetDiff",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rateMinRAY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isUnderlyingAllowed",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setUnderlyingStatusBatch",
    inputs: [
      {
        name: "underlyings",
        type: "tuple[]",
        internalType: "struct MellowUnderlyingStatus[]",
        components: [
          {
            name: "underlying",
            type: "address",
            internalType: "address",
          },
          {
            name: "allowed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SetUnderlyingStatus",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newStatus",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IncorrectArrayLengthException",
    inputs: [],
  },
  {
    type: "error",
    name: "UnderlyingNotAllowedException",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "UnderlyingNotFoundException",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;

export const iErc4626AdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "enum AdapterType" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
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
    name: "asset",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "assetMask",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositDiff",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "shares", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "shares", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemDiff",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sharesMask",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "tokensToEnable", type: "uint256", internalType: "uint256" },
      { name: "tokensToDisable", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export const iPendleRouterAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllowedPairs",
    inputs: [],
    outputs: [
      {
        name: "pairs",
        type: "tuple[]",
        internalType: "struct PendlePairStatus[]",
        components: [
          {
            name: "market",
            type: "address",
            internalType: "address",
          },
          {
            name: "inputToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PendleStatus",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isPairAllowed",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "inputToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "pendleToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "status",
        type: "uint8",
        internalType: "enum PendleStatus",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ptToMarket",
    inputs: [
      {
        name: "pt",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemDiffPyToToken",
    inputs: [
      {
        name: "yt",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverPt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenDiffOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minRateRAY",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemPyToToken",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "yt",
        type: "address",
        internalType: "address",
      },
      {
        name: "netPyIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minTokenOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenRedeemSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPairStatusBatch",
    inputs: [
      {
        name: "pairs",
        type: "tuple[]",
        internalType: "struct PendlePairStatus[]",
        components: [
          {
            name: "market",
            type: "address",
            internalType: "address",
          },
          {
            name: "inputToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PendleStatus",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiffPtForToken",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverPt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "diffOutput",
        type: "tuple",
        internalType: "struct TokenDiffOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minRateRAY",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiffTokenForPt",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "minRateRAY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "guessPtOut",
        type: "tuple",
        internalType: "struct ApproxParams",
        components: [
          {
            name: "guessMin",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessMax",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessOffchain",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxIteration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "diffInput",
        type: "tuple",
        internalType: "struct TokenDiffInput",
        components: [
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "leftoverTokenIn",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapExactPtForToken",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "exactPtIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minTokenOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenRedeemSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
      {
        name: "limit",
        type: "tuple",
        internalType: "struct LimitOrderData",
        components: [
          {
            name: "limitRouter",
            type: "address",
            internalType: "address",
          },
          {
            name: "epsSkipMarket",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "normalFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "optData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapExactTokenForPt",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "minPtOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "guessPtOut",
        type: "tuple",
        internalType: "struct ApproxParams",
        components: [
          {
            name: "guessMin",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessMax",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessOffchain",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxIteration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "input",
        type: "tuple",
        internalType: "struct TokenInput",
        components: [
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "netTokenIn",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenMintSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
      {
        name: "limit",
        type: "tuple",
        internalType: "struct LimitOrderData",
        components: [
          {
            name: "limitRouter",
            type: "address",
            internalType: "address",
          },
          {
            name: "epsSkipMarket",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "normalFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "optData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SetPairStatus",
    inputs: [
      {
        name: "market",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "inputToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pendleToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "uint8",
        indexed: false,
        internalType: "enum PendleStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "PairNotAllowedException",
    inputs: [],
  },
  {
    type: "error",
    name: "RedemptionNotAllowedException",
    inputs: [],
  },
] as const;

export const iDaiUsdsAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dai",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "daiMask",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "daiToUsds",
    inputs: [
      {
        name: "usr",
        type: "address",
        internalType: "address",
      },
      {
        name: "wad",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "daiToUsdsDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usds",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdsMask",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdsToDai",
    inputs: [
      {
        name: "usr",
        type: "address",
        internalType: "address",
      },
      {
        name: "wad",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "usdsToDaiDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export const iStakingRewardsAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReward",
    inputs: [],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rewardsToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardsTokenMask",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stake",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakedPhantomToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakedPhantomTokenMask",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakingToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakingTokenMask",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;
