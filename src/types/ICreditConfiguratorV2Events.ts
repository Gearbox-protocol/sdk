//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV2Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV2EventsAbi = [
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
] as const

