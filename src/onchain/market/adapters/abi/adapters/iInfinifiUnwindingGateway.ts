export const iInfinifiUnwindingGatewayAdapterAbi = [
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
    name: "getAllowedLockedTokens",
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
        name: "lockedToken",
        internalType: "address",
        type: "address",
      },
    ],
    name: "lockedTokenToUnwindingEpoch",
    outputs: [
      {
        name: "",
        internalType: "uint32",
        type: "uint32",
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
        name: "lockedTokens",
        internalType: "struct LockedTokenStatus[]",
        type: "tuple[]",
        components: [
          {
            name: "lockedToken",
            internalType: "address",
            type: "address",
          },
          {
            name: "unwindingEpochs",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "allowed",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    name: "setLockedTokenBatchStatus",
    outputs: [],
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
        name: "unwindingEpochs",
        internalType: "uint32",
        type: "uint32",
      },
    ],
    name: "startUnwinding",
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
        name: "lockedToken",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "unwindingEpochs",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      {
        name: "allowed",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "SetLockedTokenStatus",
  },
  {
    type: "error",
    inputs: [],
    name: "IncorrectStakedPhantomTokenException",
  },
  {
    type: "error",
    inputs: [],
    name: "LockedTokenNotAllowedException",
  },
  {
    type: "error",
    inputs: [],
    name: "LockedTokenUnwindingEpochsMismatchException",
  },
] as const;

export const iInfinifiUnwindingGatewayAbi = [
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
        name: "user",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getPendingAssets",
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
        name: "user",
        internalType: "address",
        type: "address",
      },
    ],
    name: "getUserUnwindingData",
    outputs: [
      {
        name: "",
        internalType: "struct UserUnwindingData",
        type: "tuple",
        components: [
          {
            name: "shares",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "unwindingEpochs",
            internalType: "uint32",
            type: "uint32",
          },
          {
            name: "unwindingTimestamp",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "unclaimedAssets",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "isWithdrawn",
            internalType: "bool",
            type: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "iUSD",
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
    name: "lockingController",
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
        name: "shares",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "unwindingEpochs",
        internalType: "uint32",
        type: "uint32",
      },
    ],
    name: "startUnwinding",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unwindingModule",
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
        name: "unwindingTimestamp",
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
    name: "InsufficientPendingAssetsException",
  },
  {
    type: "error",
    inputs: [],
    name: "InsufficientSharesException",
  },
  {
    type: "error",
    inputs: [],
    name: "MoreThanOneUnwindingPerBlockException",
  },
  {
    type: "error",
    inputs: [],
    name: "UnwindingNotClaimableException",
  },
  {
    type: "error",
    inputs: [],
    name: "UserAlreadyUnwindingException",
  },
  {
    type: "error",
    inputs: [],
    name: "UserNotUnwindingException",
  },
] as const;
