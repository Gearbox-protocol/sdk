/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iZapperAbi = [
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;
