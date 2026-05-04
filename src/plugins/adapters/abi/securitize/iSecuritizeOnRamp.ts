export const iSecuritizeOnRampAbi = [
  {
    type: "function",
    name: "calculateDsTokenAmount",
    inputs: [
      { name: "_liquidityAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "dsTokenAmount", type: "uint256", internalType: "uint256" },
      { name: "rate", type: "uint256", internalType: "uint256" },
      { name: "fee", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dsToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "liquidityToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "navProvider",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      { name: "_liquidityAmount", type: "uint256", internalType: "uint256" },
      { name: "_minOutAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
