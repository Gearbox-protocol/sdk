export const iBaseOnRampAbi = [
  {
    inputs: [],
    name: "InsufficientERC20BalanceError",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidEIP712SignatureError",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestorNotRegisteredError",
    type: "error",
  },
  {
    inputs: [],
    name: "InvestorSubscriptionDisabledError",
    type: "error",
  },
  {
    inputs: [],
    name: "MinSubscriptionAmountError",
    type: "error",
  },
  {
    inputs: [],
    name: "NonPositiveAmountError",
    type: "error",
  },
  {
    inputs: [],
    name: "NonZeroAddressError",
    type: "error",
  },
  {
    inputs: [],
    name: "NonZeroNavRateError",
    type: "error",
  },
  {
    inputs: [],
    name: "SameValueError",
    type: "error",
  },
  {
    inputs: [],
    name: "SignatureDeadlineExpiredError",
    type: "error",
  },
  {
    inputs: [],
    name: "SlippageControlError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldProvider",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newProvider",
        type: "address",
      },
    ],
    name: "AssetProviderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "chainId",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "bridge",
        type: "address",
      },
    ],
    name: "BridgeParamsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "newValue",
        type: "bool",
      },
    ],
    name: "InvestorSubscriptionUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldValue",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newValue",
        type: "uint256",
      },
    ],
    name: "MinSubscriptionAmountUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldProvider",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newProvider",
        type: "address",
      },
    ],
    name: "NavProviderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dsTokenValue",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidityValue",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newWalletTo",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "liquidityToken",
        type: "address",
      },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "newValue",
        type: "bool",
      },
    ],
    name: "TwoStepTransferUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dsToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_liquidity",
        type: "address",
      },
      {
        internalType: "address",
        name: "_navProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "_feeManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_custodianWallet",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_investorSubscription",
        type: "bool",
      },
    ],
    name: "toggleInvestorSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_twoStepTransfer",
        type: "bool",
      },
    ],
    name: "toggleTwoStepTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_assetProvider",
        type: "address",
      },
    ],
    name: "updateAssetProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_chainId",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "_bridge",
        type: "address",
      },
    ],
    name: "updateBridgeParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_minSubscriptionAmount",
        type: "uint256",
      },
    ],
    name: "updateMinSubscriptionAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_navProvider",
        type: "address",
      },
    ],
    name: "updateNavProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
