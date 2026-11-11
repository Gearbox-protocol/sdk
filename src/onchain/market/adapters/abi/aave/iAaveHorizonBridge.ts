export const iAaveHorizonBridgeAbi = [
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
    name: "rwaATokenManager",
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
    outputs: [],
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
    outputs: [],
  },
  {
    name: "CreditAccountOwnerIsCreditAccountException",
    type: "error",
    inputs: [],
  },
] as const;
