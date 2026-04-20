export const iDSRegistryServiceAbi = [
  {
    type: "function",
    name: "addWallet",
    inputs: [
      { name: "wallet", type: "address", internalType: "address" },
      { name: "investorId", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getInvestor",
    inputs: [{ name: "wallet", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isInvestor",
    inputs: [{ name: "investorId", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isWallet",
    inputs: [{ name: "wallet", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerInvestor",
    inputs: [
      { name: "investorId", type: "string", internalType: "string" },
      { name: "collisionHash", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
