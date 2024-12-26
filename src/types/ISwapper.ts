//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ISwapper
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iSwapperAbi = [
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
    name: "needsComponentUpdate",
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
] as const

