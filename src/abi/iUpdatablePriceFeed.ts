export const iUpdatablePriceFeedAbi = [
  {
    type: "function",
    name: "updatable",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updatePrice",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
