export const iMidasIssuanceVaultAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "allowedTokens",
    outputs: [
      {
        name: "",
        internalType: "address[]",
        type: "address[]",
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
        name: "tokenIn",
        internalType: "address",
        type: "address",
      },
      {
        name: "amountToken",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minReceiveAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
    name: "depositInstant",
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
        name: "tokenIn",
        internalType: "address",
        type: "address",
      },
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "depositInstantDiff",
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
        name: "token",
        internalType: "address",
        type: "address",
      },
    ],
    name: "isTokenAllowed",
    outputs: [
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mToken",
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
    name: "referrerId",
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
    inputs: [
      {
        name: "tokens",
        internalType: "address[]",
        type: "address[]",
      },
      {
        name: "allowed",
        internalType: "bool[]",
        type: "bool[]",
      },
    ],
    name: "setTokenAllowedStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
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
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "allowed",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "SetTokenAllowedStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "IncorrectArrayLengthException",
  },
  {
    type: "error",
    inputs: [],
    name: "TokenNotAllowedException",
  },
] as const;
