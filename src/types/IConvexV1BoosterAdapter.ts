//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexV1BoosterAdapter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BoosterAdapterAbi = [
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
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
] as const

