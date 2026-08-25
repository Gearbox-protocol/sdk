export const iUpshiftVaultAdapterAbi = [
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
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "claim",
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
    name: "depositDiff",
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
    name: "redeemDiff",
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
        name: "shares",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "requestRedeem",
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
    name: "requestRedeemDiff",
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
    name: "stakedPhantomToken",
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
    type: "error",
    inputs: [],
    name: "IncorrectStakedPhantomTokenException",
  },
] as const;

export const iUpshiftVaultGatewayAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
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
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
      },
    ],
    name: "pendingAssetsOf",
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
        name: "shares",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "requestRedeem",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "upshiftVault",
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
