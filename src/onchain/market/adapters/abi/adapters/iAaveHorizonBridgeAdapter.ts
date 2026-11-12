export const iAaveHorizonBridgeAdapterAbi = [
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
    name: "bridge",
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
    name: "isATokenAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "address",
        name: "token",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
  {
    name: "isDebtTokenAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "address",
        name: "token",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
  {
    name: "allowedATokens",
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
    name: "allowedDebtTokens",
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
    name: "openPosition",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "aToken",
      },
      {
        type: "address",
        name: "debtToken",
      },
      {
        type: "uint256",
        name: "aTokenAmount",
      },
      {
        type: "uint256",
        name: "borrowAmount",
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
    name: "openPositionDiff",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "aToken",
      },
      {
        type: "address",
        name: "debtToken",
      },
      {
        type: "uint256",
        name: "leftoverAmount",
      },
      {
        type: "uint256",
        name: "borrowAmount",
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
    name: "closePosition",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "aToken",
      },
      {
        type: "address",
        name: "debtToken",
      },
      {
        type: "uint256",
        name: "repayAmount",
      },
      {
        type: "uint256",
        name: "aTokenAmount",
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
    name: "setATokenStatusBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple[]",
        name: "tokens",
        components: [
          {
            type: "address",
            name: "token",
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
    name: "setDebtTokenStatusBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple[]",
        name: "tokens",
        components: [
          {
            type: "address",
            name: "token",
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
    name: "SetATokenStatus",
    type: "event",
    inputs: [
      {
        type: "address",
        name: "token",
        indexed: true,
      },
      {
        type: "bool",
        name: "allowed",
      },
    ],
  },
  {
    name: "SetDebtTokenStatus",
    type: "event",
    inputs: [
      {
        type: "address",
        name: "token",
        indexed: true,
      },
      {
        type: "bool",
        name: "allowed",
      },
    ],
  },
] as const;
