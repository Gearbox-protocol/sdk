export const iStateSerializerAbi = [
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
] as const;
