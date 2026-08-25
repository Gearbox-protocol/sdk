export const iBalancerV3WrapperAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "balancerPoolToken",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "burnDiff",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [
      {
        name: "",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "mintDiff",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [
      {
        name: "serializedData",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
] as const;
