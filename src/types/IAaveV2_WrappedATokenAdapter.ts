//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAaveV2_WrappedATokenAdapter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAaveV2WrappedATokenAdapterAbi = [
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
    name: "aToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "aTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
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
      { name: "leftoverAssets", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverAssets", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiffUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "depositUnderlying",
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
    name: "tokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "waTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
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
      { name: "leftoverShares", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverShares", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiffUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "withdrawUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const

