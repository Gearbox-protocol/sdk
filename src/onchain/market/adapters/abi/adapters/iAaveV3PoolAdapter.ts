export const iAaveV3PoolAdapterAbi = [
  {
    name: "contractType",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "bytes32",
      },
    ],
  },
  {
    name: "creditManager",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },
  {
    name: "targetContract",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },
  {
    name: "version",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    name: "serialize",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "bytes",
        name: "serializedData",
      },
    ],
  },
  {
    name: "pool",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },
  {
    name: "referralCode",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "uint16",
      },
    ],
  },
  {
    name: "isAssetAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
  {
    name: "allowedAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address[]",
      },
    ],
  },
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
      },
      {
        type: "uint16",
      },
    ],
    outputs: [
      {
        type: "bool",
        name: "useSafePrices",
      },
    ],
  },
  {
    name: "supplyDiff",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "leftoverAmount",
      },
    ],
    outputs: [
      {
        type: "bool",
        name: "useSafePrices",
      },
    ],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
      },
    ],
    outputs: [
      {
        type: "bool",
        name: "useSafePrices",
      },
    ],
  },
  {
    name: "withdrawDiff",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "leftoverAmount",
      },
    ],
    outputs: [
      {
        type: "bool",
        name: "useSafePrices",
      },
    ],
  },
  {
    name: "setAssetStatusBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple[]",
        name: "assets",
        components: [
          {
            type: "address",
            name: "asset",
          },
          {
            type: "bool",
            name: "allowed",
          },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: "SetAssetStatus",
    type: "event",
    inputs: [
      {
        type: "address",
        name: "asset",
        indexed: true,
      },
      {
        type: "bool",
        name: "allowed",
      },
    ],
  },
] as const;
