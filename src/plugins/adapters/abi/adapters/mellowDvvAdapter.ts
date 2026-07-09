export const mellowDvvAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_creditManager",
        internalType: "address",
        type: "address",
      },
      {
        name: "_vault",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
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
    name: "asset",
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
        name: "assets",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    name: "deposit",
    outputs: [
      {
        name: "",
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
    name: "depositDiff",
    outputs: [
      {
        name: "",
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
        name: "shares",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [
      {
        name: "",
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
        name: "shares",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    name: "redeem",
    outputs: [
      {
        name: "",
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
    name: "redeemDiff",
    outputs: [
      {
        name: "",
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
    name: "vault",
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
  {
    type: "function",
    inputs: [
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    name: "AddressIsNotContractException",
  },
  {
    type: "error",
    inputs: [],
    name: "CallerNotCreditFacadeException",
  },
  {
    type: "error",
    inputs: [],
    name: "NotImplementedException",
  },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressException",
  },
] as const;
