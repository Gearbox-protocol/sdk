//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV2Abi = [
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
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "allowContract",
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
    name: "allowedContracts",
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
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "forbidContract",
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
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "removeEmergencyLiquidator",
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
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationPremium", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationPremiumExpired",
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
    inputs: [{ name: "_mode", internalType: "bool", type: "bool" }],
    name: "setIncreaseDebtForbidden",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint128", type: "uint128" }],
    name: "setLimitPerBlock",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_minBorrowedAmount", internalType: "uint128", type: "uint128" },
      { name: "_maxBorrowedAmount", internalType: "uint128", type: "uint128" },
    ],
    name: "setLimits",
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
      { name: "maxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
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
      { name: "_creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "upgradeCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditFacade", internalType: "address", type: "address" },
      { name: "migrateParams", internalType: "bool", type: "bool" },
    ],
    name: "upgradeCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "upgradePriceOracle",
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
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AdapterForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "AddedToUpgradeable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
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
    name: "ContractAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ContractForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newCreditConfigurator",
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
        name: "newCreditFacade",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CreditFacadeUpgraded",
  },
  { type: "event", anonymous: false, inputs: [], name: "CumulativeLossReset" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "ExpirationDateUpdated",
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
    name: "FeesUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "", internalType: "bool", type: "bool", indexed: false }],
    name: "IncreaseDebtForbiddenModeChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "LimitPerBlockUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LimitsUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: false },
    ],
    name: "MaxEnabledTokensUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "NewEmergencyLiquidationDiscount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewMaxCumulativeLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPriceOracle",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "PriceOracleUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "RemovedFromUpgradeable",
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
    name: "TokenAllowed",
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
    name: "TokenForbidden",
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
        name: "liquidityThreshold",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "TokenLiquidationThresholdUpdated",
  },
  { type: "error", inputs: [], name: "AdapterUsedTwiceException" },
  { type: "error", inputs: [], name: "ContractIsNotAnAllowedAdapterException" },
  {
    type: "error",
    inputs: [],
    name: "CreditManagerOrFacadeUsedAsTargetContractsException",
  },
  { type: "error", inputs: [], name: "IncompatibleContractException" },
  { type: "error", inputs: [], name: "IncorrectExpirationDateException" },
  { type: "error", inputs: [], name: "IncorrectFeesException" },
  { type: "error", inputs: [], name: "IncorrectLimitsException" },
  { type: "error", inputs: [], name: "IncorrectLiquidationThresholdException" },
  { type: "error", inputs: [], name: "SetLTForUnderlyingException" },
] as const

