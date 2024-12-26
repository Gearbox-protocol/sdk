//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PendleSwapper
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pendleSwapperAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_router", internalType: "address", type: "address" },
      { name: "_pendleRouterStatic", internalType: "address", type: "address" },
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
    inputs: [],
    name: "routerStatic",
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
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "enum SwapOperation", type: "uint8" }],
    name: "UnsupportedSwapOperation",
  },
] as const

