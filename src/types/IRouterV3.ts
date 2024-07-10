//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRouterV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRouterV3Abi = [
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
        name: "",
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
      { name: "iterations", internalType: "uint256", type: "uint256" },
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
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "tokenTypes",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
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
] as const

