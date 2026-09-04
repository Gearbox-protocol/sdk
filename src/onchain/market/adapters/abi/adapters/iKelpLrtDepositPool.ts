export const iKelpLrtDepositPoolAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "allowedAssets",
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
        name: "asset",
        internalType: "address",
        type: "address",
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minRSETHAmountExpected",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "depositAsset",
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
        name: "asset",
        internalType: "address",
        type: "address",
      },
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minRateRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "depositAssetDiff",
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
    name: "referralId",
    outputs: [
      {
        name: "",
        internalType: "string",
        type: "string",
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
        name: "assets",
        internalType: "address[]",
        type: "address[]",
      },
      {
        name: "allowed",
        internalType: "bool[]",
        type: "bool[]",
      },
    ],
    name: "setAssetStatusBatch",
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
        name: "asset",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "allowed",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "SetAssetStatus",
  },
  {
    type: "error",
    inputs: [
      {
        name: "asset",
        internalType: "address",
        type: "address",
      },
    ],
    name: "AssetNotAllowedException",
  },
  {
    type: "error",
    inputs: [],
    name: "IncorrectArrayLengthException",
  },
] as const;

export const iKelpLrtDepositPoolGatewayAbi = [
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
        name: "asset",
        internalType: "address",
        type: "address",
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minRSETHAmountExpected",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "depositAsset",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "depositPool",
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
    name: "rsETH",
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
    inputs: [],
    name: "weth",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;
