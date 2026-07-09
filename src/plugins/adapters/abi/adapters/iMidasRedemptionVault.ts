export const iMidasRedemptionVaultAdapterAbi = [
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
    name: "gateway",
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
    inputs: [
      {
        name: "phantomToken",
        internalType: "address",
        type: "address",
      },
    ],
    name: "phantomTokenToOutputToken",
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
        name: "tokenOut",
        internalType: "address",
        type: "address",
      },
      {
        name: "amountMTokenIn",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minReceiveAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "redeemInstant",
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
        name: "tokenOut",
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
    name: "redeemInstantDiff",
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
        name: "tokenOut",
        internalType: "address",
        type: "address",
      },
      {
        name: "amountMTokenIn",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "redeemRequest",
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
        name: "configs",
        internalType:
          "struct IMidasRedemptionVaultAdapter.MidasAllowedTokenStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "token",
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
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "phantomToken",
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
    name: "IncorrectStakedPhantomTokenException",
  },
  {
    type: "error",
    inputs: [],
    name: "PhantomTokenTokenOutMismatchException",
  },
  {
    type: "error",
    inputs: [],
    name: "TokenNotAllowedException",
  },
] as const;

export const iMidasRedemptionVaultGatewayAbi = [
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
    name: "getCurrentRequestTokenOut",
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
    name: "midasRedemptionVault",
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
        name: "user",
        internalType: "address",
        type: "address",
      },
    ],
    name: "pendingRedemptions",
    outputs: [
      {
        name: "isActive",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "isManuallyCleared",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "requestId",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "timestamp",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "remainder",
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
        name: "user",
        internalType: "address",
        type: "address",
      },
      {
        name: "tokenOut",
        internalType: "address",
        type: "address",
      },
    ],
    name: "pendingTokenOutAmount",
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
        name: "tokenOut",
        internalType: "address",
        type: "address",
      },
      {
        name: "amountMTokenIn",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minReceiveAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "redeemInstant",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "tokenOut",
        internalType: "address",
        type: "address",
      },
      {
        name: "amountMTokenIn",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [],
    name: "AmountExceedsAvailableException",
  },
  {
    type: "error",
    inputs: [],
    name: "AmountIsLessThanRequiredException",
  },
  {
    type: "error",
    inputs: [],
    name: "HasPendingRedemptionException",
  },
  {
    type: "error",
    inputs: [],
    name: "InvalidRequestException",
  },
  {
    type: "error",
    inputs: [],
    name: "NoPendingRedemptionException",
  },
  {
    type: "error",
    inputs: [],
    name: "RedemptionNotFulfilledException",
  },
  {
    type: "error",
    inputs: [],
    name: "RequestNotCancelledOrManuallyClearedException",
  },
  {
    type: "error",
    inputs: [],
    name: "ZeroAmountException",
  },
] as const;
