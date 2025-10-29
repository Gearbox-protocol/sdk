export const ITreasurySplitterAbi = [
  {
    type: "function",
    name: "distribute",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
