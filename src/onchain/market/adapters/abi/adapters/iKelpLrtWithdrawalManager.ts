export const iKelpLrtWithdrawalManagerAdapterAbi = [
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
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "completeWithdrawal",
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
    inputs: [],
    name: "getAllowedTokensOut",
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
    name: "getPhantomTokensForAllowedTokensOut",
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
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "initiateWithdrawal",
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
    ],
    name: "initiateWithdrawalDiff",
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
        name: "tokensOut",
        internalType: "struct TokenOutStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "tokenOut",
            internalType: "address",
            type: "address",
          },
          {
            name: "phantomToken",
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
    name: "setTokensOutBatchStatus",
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
    type: "error",
    inputs: [],
    name: "IncorrectStakedPhantomTokenException",
  },
  {
    type: "error",
    inputs: [],
    name: "TokenNotAllowedException",
  },
] as const;

export const iKelpLrtWithdrawalManagerGatewayAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
      },
    ],
    name: "accountToWithdrawer",
    outputs: [
      {
        name: "",
        internalType: "address payable",
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
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "completeWithdrawal",
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
      {
        name: "asset",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getClaimableAssetAmount",
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
        name: "account",
        internalType: "address",
        type: "address",
      },
      {
        name: "asset",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getPendingAndClaimableAssetAmounts",
    outputs: [
      {
        name: "pendingAssets",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "claimableAssets",
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
        name: "account",
        internalType: "address",
        type: "address",
      },
      {
        name: "asset",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getPendingAssetAmount",
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
        name: "asset",
        internalType: "address",
        type: "address",
      },
      {
        name: "rsETHUnstaked",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "referralId",
        internalType: "string",
        type: "string",
      },
    ],
    name: "initiateWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "withdrawalManager",
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
