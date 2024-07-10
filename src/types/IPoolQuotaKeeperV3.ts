//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolQuotaKeeperV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolQuotaKeeperV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
    ],
    name: "accrueQuotaInterest",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
    ],
    name: "addCreditManager",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addQuotaToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "cumulativeIndex",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "gauge",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getQuota",
    outputs: [
      { name: "quota", internalType: "uint96", type: "uint96" },
      { name: "cumulativeIndexLU", internalType: "uint192", type: "uint192" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getQuotaAndOutstandingInterest",
    outputs: [
      { name: "quoted", internalType: "uint96", type: "uint96" },
      { name: "outstandingInterest", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "getQuotaRate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenQuotaParams",
    outputs: [
      { name: "rate", internalType: "uint16", type: "uint16" },
      { name: "cumulativeIndexLU", internalType: "uint192", type: "uint192" },
      { name: "quotaIncreaseFee", internalType: "uint16", type: "uint16" },
      { name: "totalQuoted", internalType: "uint96", type: "uint96" },
      { name: "limit", internalType: "uint96", type: "uint96" },
      { name: "isActive", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isQuotedToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRateUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotedTokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
      { name: "setLimitsToZero", internalType: "bool", type: "bool" },
    ],
    name: "removeQuotas",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_gauge", internalType: "address", type: "address" }],
    name: "setGauge",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "limit", internalType: "uint96", type: "uint96" },
    ],
    name: "setTokenLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "fee", internalType: "uint16", type: "uint16" },
    ],
    name: "setTokenQuotaIncreaseFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "requestedChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
      { name: "maxQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [
      {
        name: "caQuotaInterestChange",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "fees", internalType: "uint128", type: "uint128" },
      { name: "enableToken", internalType: "bool", type: "bool" },
      { name: "disableToken", internalType: "bool", type: "bool" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateRates",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
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
    ],
    name: "AddQuotaToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newGauge",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetGauge",
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
      { name: "fee", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "SetQuotaIncreaseFee",
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
      { name: "limit", internalType: "uint96", type: "uint96", indexed: false },
    ],
    name: "SetTokenLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "quotaChange",
        internalType: "int96",
        type: "int96",
        indexed: false,
      },
    ],
    name: "UpdateQuota",
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
      { name: "rate", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "UpdateTokenQuotaRate",
  },
] as const

