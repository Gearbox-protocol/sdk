export const iRWAFactoryAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [{ name: "investor", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestor",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokens",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWallet",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCreditAccount",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isFrozen",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "serialize",
    inputs: [],
    outputs: [{ name: "serializedData", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "CallerIsNotInvestorException",
    inputs: [
      { name: "caller", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "FrozenCreditAccountException",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "UnknownCreditAccountException",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
] as const;
