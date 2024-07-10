//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV3EventsAbi = [
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

