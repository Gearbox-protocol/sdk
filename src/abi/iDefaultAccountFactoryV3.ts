export const iDefaultAccountFactoryV3Abi = [
  {
    type: "function",
    name: "addCreditManager",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "delay",
    inputs: [],
    outputs: [{ name: "", type: "uint40", internalType: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rescue",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "returnCreditAccount",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "takeCreditAccount",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AddCreditManager",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "masterCreditAccount",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DeployCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Rescue",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "data", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReturnCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TakeCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
