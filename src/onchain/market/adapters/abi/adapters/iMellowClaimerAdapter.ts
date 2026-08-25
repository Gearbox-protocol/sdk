export const iMellowClaimerAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "allowedMultiVaults",
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
        name: "token",
        internalType: "address",
        type: "address",
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "depositPhantomToken",
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
        name: "multiVault",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getMultiVaultSubvaultIndices",
    outputs: [
      {
        name: "subvaultIndices",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "withdrawalIndices",
        internalType: "uint256[][]",
        type: "uint256[][]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "multiVault",
        internalType: "address",
        type: "address",
      },
      {
        name: "user",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getUserSubvaultIndices",
    outputs: [
      {
        name: "subvaultIndices",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "withdrawalIndices",
        internalType: "uint256[][]",
        type: "uint256[][]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "multiVault",
        internalType: "address",
        type: "address",
      },
      {
        name: "subvaultIndices",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "indices",
        internalType: "uint256[][]",
        type: "uint256[][]",
      },
    ],
    name: "multiAccept",
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
        name: "multiVault",
        internalType: "address",
        type: "address",
      },
      {
        name: "subvaultIndices",
        internalType: "uint256[]",
        type: "uint256[]",
      },
      {
        name: "indices",
        internalType: "uint256[][]",
        type: "uint256[][]",
      },
      {
        name: "",
        internalType: "address",
        type: "address",
      },
      {
        name: "maxAssets",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "multiAcceptAndClaim",
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
    inputs: [
      {
        name: "multivaults",
        internalType: "struct MellowMultiVaultStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "multiVault",
            internalType: "address",
            type: "address",
          },
          {
            name: "stakedPhantomToken",
            internalType: "address",
            type: "address",
          },
          {
            name: "allowed",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    name: "setMultiVaultStatusBatch",
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
    type: "function",
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "withdrawPhantomToken",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "multiVault",
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
    name: "SetMultiVaultStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "IncorrectStakedPhantomTokenException",
  },
  {
    type: "error",
    inputs: [],
    name: "InsufficientClaimedException",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidMultiVaultException",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidStakedPhantomTokenException",
  },
  {
    type: "error",
    inputs: [],
    name: "MultiVaultNotAllowedException",
  },
] as const;
