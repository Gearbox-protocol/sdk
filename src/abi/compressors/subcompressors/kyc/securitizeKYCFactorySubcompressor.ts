export const securitizeRWAFactorySubcompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCompressedType",
    inputs: [],
    outputs: [
      { name: "", type: "bytes32", internalType: "bytes32" },
      { name: "", type: "bytes32", internalType: "bytes32" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getCreditAccountData",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "factory", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFactoryData",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getInvestorData",
    inputs: [
      { name: "investor", type: "address", internalType: "address" },
      { name: "factory", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
