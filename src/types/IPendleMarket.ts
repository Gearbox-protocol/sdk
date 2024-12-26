//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPendleMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPendleMarketAbi = [
  {
    type: "function",
    inputs: [],
    name: "expiry",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "secondsAgos", internalType: "uint32[]", type: "uint32[]" },
    ],
    name: "observe",
    outputs: [{ name: "", internalType: "uint216[]", type: "uint216[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "readTokens",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
] as const

