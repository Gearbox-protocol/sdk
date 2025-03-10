export const iRouterV300Abi = [
  {
    type: "function",
    name: "componentAddressById",
    inputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "findAllSwaps",
    inputs: [
      {
        name: "swapTask",
        type: "tuple",
        internalType: "struct SwapTask",
        components: [
          {
            name: "swapOperation",
            type: "uint8",
            internalType: "enum SwapOperation",
          },
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "connectors", type: "address[]", internalType: "address[]" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "slippage", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct RouterResult[]",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findBestClosePath",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      {
        name: "expectedBalances",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "connectors", type: "address[]", internalType: "address[]" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "pathOptions",
        type: "tuple[]",
        internalType: "struct PathOption[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "option", type: "uint8", internalType: "uint8" },
          { name: "totalOptions", type: "uint8", internalType: "uint8" },
        ],
      },
      { name: "iterations", type: "uint256", internalType: "uint256" },
      { name: "force", type: "bool", internalType: "bool" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findOneTokenDiffPath",
    inputs: [
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "expectedBalance", type: "uint256", internalType: "uint256" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "connectors", type: "address[]", internalType: "address[]" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findOneTokenPath",
    inputs: [
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "connectors", type: "address[]", internalType: "address[]" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findOpenStrategyPath",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      {
        name: "balances",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "target", type: "address", internalType: "address" },
      { name: "connectors", type: "address[]", internalType: "address[]" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "futureRouter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRouterConfigurator",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxComponentId",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenTypes",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ResolverUpdate",
    inputs: [
      { name: "ttIn", type: "uint8", indexed: true, internalType: "uint8" },
      { name: "ttOut", type: "uint8", indexed: true, internalType: "uint8" },
      { name: "rc", type: "uint8", indexed: true, internalType: "uint8" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RouterComponentUpdate",
    inputs: [
      { name: "", type: "uint8", indexed: true, internalType: "uint8" },
      { name: "", type: "address", indexed: true, internalType: "address" },
      {
        name: "version",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetFutureRouter",
    inputs: [
      { name: "", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenTypeUpdate",
    inputs: [
      {
        name: "tokenAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "tt", type: "uint8", indexed: true, internalType: "uint8" },
    ],
    anonymous: false,
  },
] as const;

export const iSwapperV300Abi = [
  {
    type: "function",
    name: "getBestDirectPairSwap",
    inputs: [
      {
        name: "swapTask",
        type: "tuple",
        internalType: "struct SwapTask",
        components: [
          {
            name: "swapOperation",
            type: "uint8",
            internalType: "enum SwapOperation",
          },
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "connectors", type: "address[]", internalType: "address[]" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "adapter", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "quote",
        type: "tuple",
        internalType: "struct SwapQuote",
        components: [
          {
            name: "multiCall",
            type: "tuple",
            internalType: "struct MultiCall",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "found", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getComponentId",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "needsComponentUpdate",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
] as const;
