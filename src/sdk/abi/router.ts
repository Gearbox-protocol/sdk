/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AaveV2Wrapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const aaveV2WrapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "convertToSwappable",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getSwappable",
    outputs: [
      { name: "swappableToken", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getWrap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AuraDepositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auraDepositorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_auraBooster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "crv",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cvx",
    outputs: [
      { name: "", internalType: "contract IConvexToken", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositDiffAllTokens",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterConvexAdapters",
    outputs: [
      { name: "result", internalType: "address[]", type: "address[]" },
      { name: "boosterAdapter", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "l2Coordinator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "BoosterAdapterNotFound" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AuraPathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auraPathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyAura2Balancer",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyAura2Normal",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyAura2StakedAura",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyStakedAura2Aura",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "auraDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "auraWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "balancer2AnyAura",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2AnyAura",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AuraWithdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auraWithdrawerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_auraBooster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "crv",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cvx",
    outputs: [
      { name: "", internalType: "contract IConvexToken", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterConvexAdapters",
    outputs: [
      { name: "result", internalType: "address[]", type: "address[]" },
      { name: "boosterAdapter", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "l2Coordinator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "ttOut", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "BoosterAdapterNotFound" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerLPDepositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerLpDepositorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
      { name: "_queries", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "poolIds", internalType: "bytes32[]", type: "bytes32[]" }],
    name: "addPools",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositDiffAllTokens",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositToken2Balancer",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getSupportedPoolIds",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "queries",
    outputs: [
      { name: "", internalType: "contract IBalancerQueries", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "vault",
    outputs: [
      { name: "", internalType: "contract IBalancerV2Vault", type: "address" },
    ],
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
    ],
    name: "AddPoolID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerLPPathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerLpPathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "balancer2balancerToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "balancer2normalToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2balancerToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerLPWithdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerLpWithdrawerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
      { name: "_queries", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "poolIds", internalType: "bytes32[]", type: "bytes32[]" }],
    name: "addPools",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getSupportedPoolIds",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "queries",
    outputs: [
      { name: "", internalType: "contract IBalancerQueries", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "vault",
    outputs: [
      { name: "", internalType: "contract IBalancerV2Vault", type: "address" },
    ],
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
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "ttOut", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawBalancer2Token",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
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
    ],
    name: "AddPoolID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerSwapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerSwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolIds", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "balancerVault", internalType: "address", type: "address" },
    ],
    name: "addPools",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getSupportedPoolIds",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "tokenSupported",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "poolId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "AddPoolID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BatchLiquidationEstimator
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const batchLiquidationEstimatorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct RouterLiqParams[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "expectedBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          {
            name: "pathOptions",
            internalType: "struct PathOption[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "option", internalType: "uint8", type: "uint8" },
              { name: "totalOptions", internalType: "uint8", type: "uint8" },
            ],
          },
          { name: "iterations", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "estimateBatch",
    outputs: [
      {
        name: "results",
        internalType: "struct LiquidationResult[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "pathFound", internalType: "bool", type: "bool" },
          { name: "executed", internalType: "bool", type: "bool" },
          { name: "profit", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CamelotV3Swapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const camelotV3SwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "router", internalType: "address", type: "address" },
      { name: "quoter", internalType: "address", type: "address" },
    ],
    name: "addQuoter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "routerToQuoter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "QuoterNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ClosePathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const closePathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "auraWithdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerLPWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "convexWithdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveLPWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "erc4626Withdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
      { name: "cycles", internalType: "uint256", type: "uint256" },
    ],
    name: "findBestClosePath",
    outputs: [
      {
        name: "result",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "findClosePath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "overrideAggregator",
    outputs: [
      {
        name: "",
        internalType: "contract OverrideAggregator",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract SwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    inputs: [],
    name: "yearnWithdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompoundV2Wrapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const compoundV2WrapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "convertToSwappable",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getSwappable",
    outputs: [
      { name: "swappableToken", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getWrap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexDepositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexDepositorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_convexBooster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "crv",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cvx",
    outputs: [
      { name: "", internalType: "contract IConvexToken", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositDiffAllTokens",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterConvexAdapters",
    outputs: [
      { name: "result", internalType: "address[]", type: "address[]" },
      { name: "boosterAdapter", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "l2Coordinator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "BoosterAdapterNotFound" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexPathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexPathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyConvex2Curve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyConvex2Normal",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyConvex2StakedConvex",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "anyStakedConvex2Convex",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "convexDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "convexWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curve2AnyConvex",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2AnyConvex",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexWithdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexWithdrawerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_convexBooster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "crv",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cvx",
    outputs: [
      { name: "", internalType: "contract IConvexToken", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterConvexAdapters",
    outputs: [
      { name: "result", internalType: "address[]", type: "address[]" },
      { name: "boosterAdapter", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "l2Coordinator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingTokenType",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "ttOut", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "BoosterAdapterNotFound" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveLPDepositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveLpDepositorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositCurve2MetaCurve",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositDiffAllTokens",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "depositNormalToken2AnyCurve",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterCurveLPAdapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapter", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getDepositCall",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "CoinIdNotFoundException",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveLPPathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveLpPathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curve2curveToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curve2normalToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2CurveToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveLPWithdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveLpWithdrawerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterCurveLPAdapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlyings",
    outputs: [
      { name: "tokensIn", internalType: "address[]", type: "address[]" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapter", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isAll", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getWithdrawCall",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "ttOut", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawCurve2Curve",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawCurve2Normal",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "CoinIdNotFoundException",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveSwapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveSwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct CurvePool[]",
        type: "tuple[]",
        components: [
          { name: "curvePool", internalType: "address", type: "address" },
          { name: "metapoolBase", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "addPools",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "tokenToCoin",
    outputs: [{ name: "", internalType: "int128", type: "int128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "tokenToUnderlyingCoin",
    outputs: [{ name: "", internalType: "int128", type: "int128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
    ],
    name: "AddPool",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC4626Depositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc4626DepositorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "vault", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "estimateDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterERC4626Adapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlying",
    outputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC4626PathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc4626PathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "ERC4626OnCurveToCurve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "ERC4626OnCurveToNormal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "ERC4626OnNormalToNormal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "ERC4626ToCurve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "ERC4626ToNormal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curveToERC4626",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curveToERC4626OnCurve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "erc4626Depositor",
    outputs: [
      { name: "", internalType: "contract IDepositor", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "erc4626Withdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normalToERC4626",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normalToERC4626OnCurve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "vaultUnderlying", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normalToERC4626OnNormal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC4626Withdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc4626WithdrawerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "vault", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "estimateRedeem",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterERC4626Adapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlying",
    outputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "lpToken", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICamelotV3Quoter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCamelotV3QuoterAbi = [
  {
    type: "function",
    inputs: [
      { name: "path", internalType: "bytes", type: "bytes" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
    ],
    name: "quoteExactInput",
    outputs: [{ name: "amountOut", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
    ],
    name: "quoteExactInputSingle",
    outputs: [{ name: "amountOut", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "path", internalType: "bytes", type: "bytes" },
      { name: "amountOut", internalType: "uint256", type: "uint256" },
    ],
    name: "quoteExactOutput",
    outputs: [{ name: "amountIn", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
    ],
    name: "quoteExactOutputSingle",
    outputs: [{ name: "amountIn", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LidoSwapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lidoSwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OverrideAggregator
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const overrideAggregatorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "overrider", internalType: "uint8", type: "uint8" },
      { name: "overrideTokenIn", internalType: "bool", type: "bool" },
      { name: "overrideTokenOut", internalType: "bool", type: "bool" },
    ],
    name: "addTokenOverride",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getInputForOverrideTokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isOverrideTokenIn",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isOverrideTokenOut",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    name: "overriderAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "overriders",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processAllTokenInOverrides",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNoPath", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processOverrideTokenIn",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNoPath", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processOverrideTokenOut",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "tokenToOverrider",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RouterV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const routerV3Abi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    name: "componentAddressById",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "creditManager",
        internalType: "contract ICreditManagerV3",
        type: "address",
      },
      {
        name: "balances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "createOpenStrategyPathTask",
    outputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
      { name: "force", internalType: "bool", type: "bool" },
    ],
    name: "createStrategyPathTask",
    outputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findAllSwaps",
    outputs: [
      {
        name: "result",
        internalType: "struct RouterResult[]",
        type: "tuple[]",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "expectedBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
      { name: "loops", internalType: "uint256", type: "uint256" },
      { name: "force", internalType: "bool", type: "bool" },
    ],
    name: "findBestClosePath",
    outputs: [
      {
        name: "result",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "expectedBalance", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "balances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "futureRouter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "creditManager",
        internalType: "contract ICreditManagerV3",
        type: "address",
      },
    ],
    name: "getAdapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "ttOut", internalType: "uint8", type: "uint8" },
    ],
    name: "getResolver",
    outputs: [
      { name: "", internalType: "contract IPathResolver", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "isOverrideRequired",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isRouterConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_prevRouter", internalType: "address", type: "address" }],
    name: "migrateRouterComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint8", type: "uint8" },
      { name: "", internalType: "uint8", type: "uint8" },
    ],
    name: "resolvers",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_futureRouter", internalType: "address", type: "address" },
    ],
    name: "setFutureRouter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "componentAddress", internalType: "address", type: "address" },
    ],
    name: "setPathComponent",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "componentAddresses",
        internalType: "address[]",
        type: "address[]",
      },
    ],
    name: "setPathComponentBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "tokenTypeToResolvers",
        internalType: "struct TokenTypeToResolver[]",
        type: "tuple[]",
        components: [
          { name: "tokenType0", internalType: "uint8", type: "uint8" },
          { name: "tokenType1", internalType: "uint8", type: "uint8" },
          { name: "resolver", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "setResolversBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "tokensToTokenTypes",
        internalType: "struct TokenToTokenType[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "tokenType", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    name: "setTokenTypesBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "tokenTypes",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8", indexed: true },
      { name: "ttOut", internalType: "uint8", type: "uint8", indexed: true },
      { name: "rc", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "ResolverUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: true },
      { name: "", internalType: "address", type: "address", indexed: true },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RouterComponentUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "SetFutureRouter",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tokenAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "tt", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "TokenTypeUpdate",
  },
  { type: "error", inputs: [], name: "NoSpaceForSlippageCallException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnsupportedRouterComponent",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SUSDEOverrider
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const susdeOverriderAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_sUSDe", internalType: "address", type: "address" },
      { name: "_sDAI", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveSwapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getInputForOverrideTokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getOutputForOverrideTokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNoPath", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processOverrideTokenIn",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNoPath", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processOverrideTokenOut",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "sDAI",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "sUSDe",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
  { type: "error", inputs: [], name: "UnsupportedOverrideDirection" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SwapAggregator
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const swapAggregatorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "balancerSwapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "camelotV3Swapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveSwapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findAllSwaps",
    outputs: [
      {
        name: "tasks",
        internalType: "struct StrategyPathTask[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "spt",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findBestSingleSwapQuote",
    outputs: [
      {
        name: "",
        internalType: "struct SwapQuote[]",
        type: "tuple[]",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNoPath", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findBestSwapAndWrap",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "tokenIndex", internalType: "uint256", type: "uint256" },
      { name: "target", internalType: "address", type: "address" },
      { name: "maxLen", internalType: "uint256", type: "uint256" },
    ],
    name: "findSwapQuote",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "pathLen", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "spt",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "maxLen", internalType: "uint256", type: "uint256" },
    ],
    name: "findSwapQuote",
    outputs: [
      {
        name: "",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "connectors",
        internalType: "struct ConnectorBalance[2]",
        type: "tuple[2]",
        components: [
          { name: "connectorIndex", internalType: "uint256", type: "uint256" },
          {
            name: "connectorCumulativeDiff",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "connectorLeftoverBalance",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
      { name: "singleSwap", internalType: "bool", type: "bool" },
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "getComplexSwap",
    outputs: [
      {
        name: "connectorTokenInQuote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      {
        name: "connectorToConnectorQuote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
      {
        name: "connectorTokenOutQuote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "getSwapper",
    outputs: [{ name: "swapper", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lidoSwapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
    ],
    name: "swapAndWrapAll",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "uniV2Swapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "uniV3Swapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "velodromeSwapper",
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
    name: "wrapAggregator",
    outputs: [
      { name: "", internalType: "contract IWrapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wstethSwapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV2Swapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV2SwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV3Swapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV3SwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "router", internalType: "address", type: "address" },
      { name: "quoter", internalType: "address", type: "address" },
      { name: "isVelodrome", internalType: "bool", type: "bool" },
    ],
    name: "addRouterData",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "isVelodrome", internalType: "bool", type: "bool" },
    ],
    name: "fees",
    outputs: [{ name: "", internalType: "uint24", type: "uint24" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "routerData",
    outputs: [
      { name: "quoter", internalType: "address", type: "address" },
      { name: "isVelodrome", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "QuoterNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  { type: "error", inputs: [], name: "UnknownFeeIndex" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VelodromeV2Swapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const velodromeV2SwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "factory", internalType: "address", type: "address" }],
    name: "addFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrapAggregator
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wrapAggregatorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "aaveV2Wrapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "compoundV2Wrapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "getAllWrappers",
    outputs: [
      { name: "wrappers", internalType: "address[]", type: "address[]" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "tokenIn", internalType: "address", type: "address" },
    ],
    name: "getSwappable",
    outputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "getWrapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
    ],
    name: "processAllWraps",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      { name: "revertOnNotFound", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "processWrap",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    inputs: [],
    name: "wstethWrapper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WstETHSwapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wstEthSwapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "getBestDirectPairSwap",
    outputs: [
      {
        name: "quote",
        internalType: "struct SwapQuote",
        type: "tuple",
        components: [
          {
            name: "multiCall",
            internalType: "struct MultiCall",
            type: "tuple",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "found", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnDepositor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const yearnDepositorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "deposit",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "yVault", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "estimateDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterYearnAdapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlying",
    outputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnPathResolver
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const yearnPathResolverAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "curve2YearnOnCurveToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curveDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositorOptions", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "contract IWithdrawerOptions",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "bestTask",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2YearnOnCurveToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "normal2YearnOnNormalToken",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "swapAggregator",
    outputs: [
      { name: "", internalType: "contract ISwapAggregator", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateComponents",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
    inputs: [],
    name: "yearnDepositor",
    outputs: [
      { name: "", internalType: "contract IDepositor", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "yearnOnCurveToken2Curve",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "yearnOnCurveToken2Normal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "yearnOnNormalToken2Normal",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "yearnWithdrawer",
    outputs: [
      { name: "", internalType: "contract IWithdrawer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "DifferentTargetComparisonException" },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnWithdrawer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const yearnWithdrawerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "yVault", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "estimateWithdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "adapters", internalType: "address[]", type: "address[]" },
    ],
    name: "filterYearnAdapters",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "getComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOut", internalType: "address", type: "address" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "getUnderlying",
    outputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "needsComponentUpdate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
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
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "lpToken", internalType: "address", type: "address" },
      { name: "isDiff", internalType: "bool", type: "bool" },
      {
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdraw",
    outputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
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
        name: "task",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    name: "withdrawDiffAllTokens",
    outputs: [
      {
        name: "",
        internalType: "struct StrategyPathTask",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          {
            name: "balances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "leftoverBalances",
            internalType: "struct Balance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "target", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "adapters", internalType: "address[]", type: "address[]" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "force", internalType: "bool", type: "bool" },
          { name: "targetType", internalType: "uint8", type: "uint8" },
          {
            name: "foundAdapters",
            internalType: "struct TokenAdapters[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              {
                name: "depositAdapter",
                internalType: "address",
                type: "address",
              },
              {
                name: "withdrawAdapter",
                internalType: "address",
                type: "address",
              },
            ],
          },
          {
            name: "initTargetBalance",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "calls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;
