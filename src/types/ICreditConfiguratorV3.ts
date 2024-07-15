//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    name: "addCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "addEmergencyLiquidator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "allowAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "allowToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "allowedAdapters",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditFacade",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "emergencyLiquidators",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "forbidBorrowing",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "forbidToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "makeTokenQuoted",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
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
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "removeEmergencyLiquidator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "resetCumulativeLoss",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newVersion", internalType: "uint256", type: "uint256" }],
    name: "setBotList",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newCreditFacade", internalType: "address", type: "address" },
      { name: "migrateParams", internalType: "bool", type: "bool" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newExpirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationPremium", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationPremiumExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    name: "setLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
    ],
    name: "setMaxCumulativeLoss",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newMaxDebt", internalType: "uint128", type: "uint128" }],
    name: "setMaxDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxDebtLimitPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setMaxDebtPerBlockMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newMaxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newMinDebt", internalType: "uint128", type: "uint128" }],
    name: "setMinDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newVersion", internalType: "uint256", type: "uint256" }],
    name: "setPriceOracle",
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
      {
        name: "newCreditConfigurator",
        internalType: "address",
        type: "address",
      },
    ],
    name: "upgradeCreditConfigurator",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCollateralToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddEmergencyLiquidator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AllowAdapter",
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
    name: "AllowToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CreditConfiguratorUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ForbidAdapter",
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
    name: "ForbidToken",
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
    name: "QuoteToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemoveEmergencyLiquidator",
  },
  { type: "event", anonymous: false, inputs: [], name: "ResetCumulativeLoss" },
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
        name: "liquidationThresholdInitial",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "timestampRampStart",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
      {
        name: "timestampRampEnd",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
    ],
    name: "ScheduleTokenLiquidationThresholdRamp",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetBorrowingLimits",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "botList",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetBotList",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditFacade",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetCreditFacade",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "expirationDate",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
    ],
    name: "SetExpirationDate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
        indexed: false,
      },
    ],
    name: "SetMaxCumulativeLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxDebtPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetMaxDebtPerBlockMultiplier",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxEnabledTokens",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetMaxEnabledTokens",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "priceOracle",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPriceOracle",
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
        name: "liquidationThreshold",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "SetTokenLiquidationThreshold",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "feeInterest",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "feeLiquidation",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationPremium",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationPremiumExpired",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "UpdateFees",
  },
] as const

