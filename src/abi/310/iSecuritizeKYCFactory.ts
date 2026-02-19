export const iSecuritizeKYCFactoryAbi = [
  {
    type: "function",
    name: "addRegistrar",
    inputs: [{ name: "registrar", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "degenNFT",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [{ name: "investor", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestor",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegisteredTokens",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegistrar",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWallet",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isActiveCreditAccount",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCreditAccount",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isFrozen",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isInactiveCreditAccount",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "multicall",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "tokensToRegister",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "openCreditAccount",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "tokensToRegister",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "wallet", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "precomputeWalletAddress",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      { name: "investor", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setFrozenStatus",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "frozen", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setInvestor",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "investor", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CreateWallet",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "wallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "investor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetFrozenStatus",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "frozen", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetInvestor",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "oldInvestor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newInvestor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetRegistrar",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "registrar",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CallerIsNotInstanceOwnerException",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "CallerIsNotInvestorException",
    inputs: [
      { name: "caller", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "FrozenCreditAccountException",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "InvalidCreditManagerException",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "InvalidUnderlyingTokenException",
    inputs: [{ name: "underlying", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "RegistrarNotSetForTokenException",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "UnknownCreditAccountException",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "WalletCallExecutionFailedException",
    inputs: [
      { name: "index", type: "uint256", internalType: "uint256" },
      { name: "reason", type: "bytes", internalType: "bytes" },
    ],
  },
  { type: "error", name: "ZeroAddressException", inputs: [] },
] as const;
