export const iMidasGatewayAdapterV311Abi = [
  {
    type: "function",
    name: "allowedInputTokens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowedOutputTokens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowedPhantomTokens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositInstant",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountToken",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minReceiveAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositInstantDiff",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rateMinRAY",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositPhantomToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "gateway",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isInputTokenAllowed",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isOutputTokenAllowed",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outputTokenToPhantomToken",
    inputs: [
      {
        name: "outputToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "phantomTokenToOutputToken",
    inputs: [
      {
        name: "phantomToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemInstant",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMTokenIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minReceiveAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemInstantDiff",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rateMinRAY",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemRequest",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMTokenIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "extraData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemRequest",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMTokenIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemRequestDiff",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemRequestDiff",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "extraData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "referrerId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "serialize",
    inputs: [],
    outputs: [
      {
        name: "serializedData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setInputTokenAllowedStatusBatch",
    inputs: [
      {
        name: "tokens",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "allowed",
        type: "bool[]",
        internalType: "bool[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setOutputTokenAllowedStatusBatch",
    inputs: [
      {
        name: "configs",
        type: "tuple[]",
        internalType: "struct IMidasGatewayAdapter.MidasAllowedTokenStatus[]",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "phantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "allowed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferRedeemer",
    inputs: [
      {
        name: "redeemer",
        type: "address",
        internalType: "address",
      },
      {
        name: "newAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFromRedeemer",
    inputs: [
      {
        name: "redeemer",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawPhantomToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "useSafePrices",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "SetInputTokenAllowedStatus",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetOutputTokenAllowedStatus",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "phantomToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IncorrectArrayLengthException",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectStakedPhantomTokenException",
    inputs: [],
  },
  {
    type: "error",
    name: "PhantomTokenTokenOutMismatchException",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenNotAllowedException",
    inputs: [],
  },
] as const;

export const iMidasGatewayV311Abi = [
  {
    type: "function",
    name: "accessControl",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositInstant",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountToken",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minReceiveAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "referrerId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingAndClaimableTokenOutAmounts",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "pendingAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "claimableAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingRedeemers",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "redeemers",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemInstant",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMTokenIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minReceiveAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redemptionLogger",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestRedeem",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountMTokenIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "extraData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferMaster",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferRedeemer",
    inputs: [
      {
        name: "redeemer",
        type: "address",
        internalType: "address",
      },
      {
        name: "newAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFromRedeemer",
    inputs: [
      {
        name: "redeemer",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "AccessControlNotSetException",
    inputs: [],
  },
  {
    type: "error",
    name: "CreditAccountNotEligibleException",
    inputs: [],
  },
  {
    type: "error",
    name: "IncompatibleIssuanceAndRedemptionVaultsException",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientBalanceException",
    inputs: [],
  },
  {
    type: "error",
    name: "MaxPendingRedeemersPerAccountException",
    inputs: [],
  },
  {
    type: "error",
    name: "NewAccountNotGreenlistedException",
    inputs: [],
  },
  {
    type: "error",
    name: "RedeemerNotOwnedByAccountException",
    inputs: [],
  },
  {
    type: "error",
    name: "RedeemerTransferNotAllowedException",
    inputs: [],
  },
] as const;
