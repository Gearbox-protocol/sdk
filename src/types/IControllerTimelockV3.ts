//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IControllerTimelockV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iControllerTimelockV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "cancelTransaction",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "executeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    name: "forbidBoundsUpdate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "queuedTransactions",
    outputs: [
      { name: "queued", internalType: "bool", type: "bool" },
      { name: "executor", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "eta", internalType: "uint40", type: "uint40" },
      { name: "signature", internalType: "string", type: "string" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "sanityCheckValue", internalType: "uint256", type: "uint256" },
      { name: "sanityCheckCallData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "rampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "rampLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "debtLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "expirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "lowerBound", internalType: "uint256", type: "uint256" },
    ],
    name: "setLPPriceFeedLimiter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "maxDebt", internalType: "uint128", type: "uint128" },
    ],
    name: "setMaxDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "multiplier", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxDebtPerBlockMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "rate", internalType: "uint16", type: "uint16" },
    ],
    name: "setMaxQuotaRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "minDebt", internalType: "uint128", type: "uint128" },
    ],
    name: "setMinDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "rate", internalType: "uint16", type: "uint16" },
    ],
    name: "setMinQuotaRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "priceOracle", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    name: "setReservePriceFeedStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
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
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaIncreaseFee", internalType: "uint16", type: "uint16" },
    ],
    name: "setTokenQuotaIncreaseFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "setVetoAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "newFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
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
    type: "function",
    inputs: [],
    name: "vetoAdmin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "CancelTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "ExecuteTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "executor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "signature",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      { name: "eta", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "QueueTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetVetoAdmin",
  },
] as const

