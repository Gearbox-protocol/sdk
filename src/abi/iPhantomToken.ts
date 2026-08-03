export const iPhantomTokenAbi = [
  {
    type: "function",
    inputs: [],
    name: "getPhantomTokenInfo",
    outputs: [
      { name: "target", internalType: "address", type: "address" },
      { name: "depositedToken", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
] as const;
