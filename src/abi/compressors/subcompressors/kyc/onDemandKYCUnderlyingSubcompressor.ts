export const onDemandRWAUnderlyingSubcompressorAbi = [
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
    name: "getUnderlyingData",
    inputs: [{ name: "underlying", type: "address", internalType: "address" }],
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
