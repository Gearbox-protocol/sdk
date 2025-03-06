/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "ver", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "ver", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddressOrRevert",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAllEntries",
    outputs: [
      {
        name: "",
        internalType: "struct AddressProviderEntry[]",
        type: "tuple[]",
        components: [
          { name: "key", internalType: "bytes32", type: "bytes32" },
          { name: "ver", internalType: "uint256", type: "uint256" },
          { name: "value", internalType: "address", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getKeys",
    outputs: [{ name: "", internalType: "bytes32[]", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "majorVersion", internalType: "uint256", type: "uint256" },
    ],
    name: "getLatestMinorVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
    ],
    name: "getLatestPatchVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getLatestVersion",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "getVersions",
    outputs: [{ name: "", internalType: "uint256[]", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "address", type: "address" },
      { name: "saveVersion", internalType: "bool", type: "bool" },
    ],
    name: "setAddress",
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
      { name: "key", internalType: "bytes32", type: "bytes32", indexed: true },
      { name: "ver", internalType: "uint256", type: "uint256", indexed: true },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetAddress",
  },
  {
    type: "error",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "ver", internalType: "uint256", type: "uint256" },
    ],
    name: "AddressNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotOwnerException",
  },
  {
    type: "error",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "ver", internalType: "uint256", type: "uint256" },
    ],
    name: "InvalidVersionException",
  },
  {
    type: "error",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "VersionNotFoundException",
  },
  {
    type: "error",
    inputs: [{ name: "key", internalType: "bytes32", type: "bytes32" }],
    name: "ZeroAddressException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBotListV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBotListV310Abi = [
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "activeBots",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "bot", internalType: "address", type: "address" }],
    name: "botForbiddenStatus",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "botPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "eraseAllBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "bot", internalType: "address", type: "address" }],
    name: "forbidBot",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBotStatus",
    outputs: [
      { name: "permissions", internalType: "uint192", type: "uint192" },
      { name: "forbidden", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [
      { name: "activeBotsRemaining", internalType: "uint256", type: "uint256" },
    ],
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
      { name: "bot", internalType: "address", type: "address", indexed: true },
    ],
    name: "ForbidBot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotPermissions",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
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
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    inputs: [],
    name: "makeAllTokensQuoted",
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
      { name: "newMinDebt", internalType: "uint128", type: "uint128" },
      { name: "newMaxDebt", internalType: "uint128", type: "uint128" },
    ],
    name: "setDebtLimits",
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
      { name: "newLossPolicy", internalType: "address", type: "address" },
    ],
    name: "setLossPolicy",
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
      { name: "newPriceOracle", internalType: "address", type: "address" },
    ],
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
        name: "lossPolicy",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetLossPolicy",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeMulticallV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeMulticallV310Abi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "addCollateralWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "compareBalances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "decreaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "increaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "updates",
        internalType: "struct PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "onDemandPriceUpdates",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "collateralHints", internalType: "uint256[]", type: "uint256[]" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
    ],
    name: "setFullCheckParams",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "balanceDeltas",
        internalType: "struct BalanceDelta[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "amount", internalType: "int256", type: "int256" },
        ],
      },
    ],
    name: "storeExpectedBalances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "botList",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "botMulticall",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    name: "debtLimits",
    outputs: [
      { name: "minDebt", internalType: "uint128", type: "uint128" },
      { name: "maxDebt", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "degenNFT",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirationDate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "forbiddenTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "lossPolicyData", internalType: "bytes", type: "bytes" },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lossPolicy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxDebtPerBlockMultiplier",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxQuotaMultiplier",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "multicall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "onBehalfOf", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "openCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "minSeizedAmount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "partiallyLiquidateCreditAccount",
    outputs: [
      { name: "seizedAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeedStore",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newMinDebt", internalType: "uint128", type: "uint128" },
      { name: "newMaxDebt", internalType: "uint128", type: "uint128" },
      {
        name: "newMaxDebtPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setDebtLimits",
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
      { name: "newLossPolicy", internalType: "address", type: "address" },
    ],
    name: "setLossPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      {
        name: "allowance",
        internalType: "enum AllowanceAction",
        type: "uint8",
      },
    ],
    name: "setTokenAllowance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "unpause",
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
    name: "weth",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AddCollateral",
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
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CloseCreditAccount",
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
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Execute",
  },
  { type: "event", anonymous: false, inputs: [], name: "FinishMultiCall" },
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
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
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
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
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
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "repaidDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "seizedCollateral",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "PartiallyLiquidateCreditAccount",
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
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "StartMultiCall",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "WithdrawCollateral",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "WithdrawPhantomToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "accountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "adapterToContract",
    outputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "payer", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "task", internalType: "enum CollateralCalcTask", type: "uint8" },
    ],
    name: "calcDebtAndCollateral",
    outputs: [
      {
        name: "cdd",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "collateralTokenByMask",
    outputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "collateralTokensCount",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "contractToAdapter",
    outputs: [{ name: "adapter", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "creditAccountInfo",
    outputs: [
      { name: "debt", internalType: "uint256", type: "uint256" },
      {
        name: "cumulativeIndexLastUpdate",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "cumulativeQuotaInterest",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "quotaFees", internalType: "uint128", type: "uint128" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "flags", internalType: "uint16", type: "uint16" },
      { name: "lastDebtUpdate", internalType: "uint64", type: "uint64" },
      { name: "borrower", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "offset", internalType: "uint256", type: "uint256" },
      { name: "limit", internalType: "uint256", type: "uint256" },
    ],
    name: "creditAccounts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccounts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccountsLen",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditConfigurator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "enabledTokensMaskOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "callData", internalType: "bytes", type: "bytes" },
    ],
    name: "externalCall",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fees",
    outputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationDiscount", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "flagsOf",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "collateralHints", internalType: "uint256[]", type: "uint256[]" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
      { name: "useSafePrices", internalType: "bool", type: "bool" },
    ],
    name: "fullCollateralCheck",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getActiveCreditAccountOrRevert",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBorrowerOrRevert",
    outputs: [{ name: "borrower", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "getTokenByMask",
    outputs: [{ name: "token", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenMaskOrRevert",
    outputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
    ],
    name: "isLiquidatable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "collateralDebtData",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
          },
        ],
      },
      { name: "to", internalType: "address", type: "address" },
      { name: "isExpired", internalType: "bool", type: "bool" },
    ],
    name: "liquidateCreditAccount",
    outputs: [
      { name: "remainingFunds", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "liquidationThresholds",
    outputs: [{ name: "lt", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "ltParams",
    outputs: [
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "action", internalType: "enum ManageDebtAction", type: "uint8" },
    ],
    name: "manageDebt",
    outputs: [
      { name: "newDebt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxEnabledTokens",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "onBehalfOf", internalType: "address", type: "address" }],
    name: "openCreditAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
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
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotedTokensMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "setActiveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "setCollateralTokenData",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "adapter", internalType: "address", type: "address" },
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "setContractAllowance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "setCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationDiscount", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationDiscountExpired",
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
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "flag", internalType: "uint16", type: "uint16" },
      { name: "value", internalType: "bool", type: "bool" },
    ],
    name: "setFlagFor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "priceOracle", internalType: "address", type: "address" }],
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
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
      { name: "maxQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetCreditConfigurator",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGaugeV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGaugeV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "addQuotaToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMaxRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMinRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochFrozen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochLastUpdate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokens", internalType: "address[]", type: "address[]" }],
    name: "getRates",
    outputs: [{ name: "", internalType: "uint16[]", type: "uint16[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAdded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "quotaRateParams",
    outputs: [
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
      { name: "totalVotesLpSide", internalType: "uint96", type: "uint96" },
      { name: "totalVotesCaSide", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "status", internalType: "bool", type: "bool" }],
    name: "setFrozenEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "unvote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "userTokenVotes",
    outputs: [
      { name: "votesLpSide", internalType: "uint96", type: "uint96" },
      { name: "votesCaSide", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "view",
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
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "voter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
      {
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "AddQuotaToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "status", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetFrozenEpoch",
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
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "SetQuotaTokenParams",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Unvote",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "epochNow",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "UpdateEpoch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Vote",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILossPolicyV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLossPolicyV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "accessMode",
    outputs: [
      { name: "", internalType: "enum ILossPolicy.AccessMode", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "checksEnabled",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "caller", internalType: "address", type: "address" },
      {
        name: "params",
        internalType: "struct ILossPolicy.Params",
        type: "tuple",
        components: [
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "isLiquidatableWithLoss",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "mode",
        internalType: "enum ILossPolicy.AccessMode",
        type: "uint8",
      },
    ],
    name: "setAccessMode",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "enabled", internalType: "bool", type: "bool" }],
    name: "setChecksEnabled",
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
        name: "mode",
        internalType: "enum ILossPolicy.AccessMode",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetAccessMode",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "enabled", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetChecksEnabled",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMarketConfiguratorV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMarketConfiguratorV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "peripheryContract", internalType: "address", type: "address" },
    ],
    name: "addPeripheryContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
    ],
    name: "addToken",
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
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "factory", internalType: "address", type: "address" },
      { name: "suite", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
    ],
    name: "authorizeFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "bytecodeRepository",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configureCreditSuite",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configureInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configureLossPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configurePool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configurePriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configureRateKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
      { name: "pool", internalType: "address", type: "address" },
      { name: "encdodedParams", internalType: "bytes", type: "bytes" },
    ],
    name: "createCreditSuite",
    outputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
      { name: "underlying", internalType: "address", type: "address" },
      { name: "name", internalType: "string", type: "string" },
      { name: "symbol", internalType: "string", type: "string" },
      {
        name: "interestRateModelParams",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "rateKeeperParams",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "lossPolicyParams",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "underlyingPriceFeed", internalType: "address", type: "address" },
    ],
    name: "createMarket",
    outputs: [{ name: "pool", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "curatorName",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "emergencyAdmin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigureCreditSuite",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigureInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigureLossPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigurePool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigurePriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "emergencyConfigureRateKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "emergencyRevokeRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "getAuthorizedFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "getCreditFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "factory", internalType: "address", type: "address" },
      { name: "suite", internalType: "address", type: "address" },
    ],
    name: "getFactoryTargets",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "getMarketFactories",
    outputs: [
      {
        name: "",
        internalType: "struct MarketFactories",
        type: "tuple",
        components: [
          { name: "poolFactory", internalType: "address", type: "address" },
          {
            name: "priceOracleFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "interestRateModelFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "rateKeeperFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "lossPolicyFactory",
            internalType: "address",
            type: "address",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "domain", internalType: "bytes32", type: "bytes32" }],
    name: "getPeripheryContracts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "domain", internalType: "bytes32", type: "bytes32" },
      { name: "peripheryContract", internalType: "address", type: "address" },
    ],
    name: "isPeripheryContract",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "marketMinorVersion", internalType: "uint256", type: "uint256" },
      {
        name: "creditSuiteMinorVersion",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "underlying", internalType: "address", type: "address" },
      { name: "name", internalType: "string", type: "string" },
      { name: "symbol", internalType: "string", type: "string" },
      { name: "encodedParams", internalType: "bytes", type: "bytes" },
    ],
    name: "previewCreateCreditSuite",
    outputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
      { name: "pool", internalType: "address", type: "address" },
      { name: "encodedParams", internalType: "bytes", type: "bytes" },
    ],
    name: "previewCreateCreditSuite",
    outputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "minorVersion", internalType: "uint256", type: "uint256" },
      { name: "underlying", internalType: "address", type: "address" },
      { name: "name", internalType: "string", type: "string" },
      { name: "symbol", internalType: "string", type: "string" },
    ],
    name: "previewCreateMarket",
    outputs: [{ name: "pool", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "peripheryContract", internalType: "address", type: "address" },
    ],
    name: "removePeripheryContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newEmergencyAdmin", internalType: "address", type: "address" },
    ],
    name: "setEmergencyAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "shutdownCreditSuite",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "shutdownMarket",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "factory", internalType: "address", type: "address" },
      { name: "suite", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
    ],
    name: "unauthorizeFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      {
        name: "params",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "updateInterestRateModel",
    outputs: [{ name: "irm", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      {
        name: "params",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "updateLossPolicy",
    outputs: [{ name: "lossPolicy", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "updatePriceOracle",
    outputs: [
      { name: "priceOracle", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      {
        name: "params",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "updateRateKeeper",
    outputs: [{ name: "rateKeeper", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "upgradeCreditFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "upgradeInterestRateModelFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "upgradeLossPolicyFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "upgradePoolFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "upgradePriceOracleFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "upgradeRateKeeperFactory",
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
        name: "domain",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "peripheryContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddPeripheryContract",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "suite",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AuthorizeFactory",
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
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigureCreditSuite",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigureInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigureLossPolicy",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigurePool",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigurePriceOracle",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "ConfigureRateKeeper",
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
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "CreateCreditSuite",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "priceOracle",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "interestRateModel",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "rateKeeper",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "lossPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "factories",
        internalType: "struct MarketFactories",
        type: "tuple",
        components: [
          { name: "poolFactory", internalType: "address", type: "address" },
          {
            name: "priceOracleFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "interestRateModelFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "rateKeeperFactory",
            internalType: "address",
            type: "address",
          },
          {
            name: "lossPolicyFactory",
            internalType: "address",
            type: "address",
          },
        ],
        indexed: false,
      },
    ],
    name: "CreateMarket",
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
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigureCreditSuite",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigureInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigureLossPolicy",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigurePool",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigurePriceOracle",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "EmergencyConfigureRateKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "EmergencyRevokeRole",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "callData",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "ExecuteHook",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GrantRole",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "domain",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "peripheryContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemovePeripheryContract",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RevokeRole",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newEmergencyAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetEmergencyAdmin",
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
    name: "ShutdownCreditSuite",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
    ],
    name: "ShutdownMarket",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "suite",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "UnauthorizeFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "interestRateModel",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpdateInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "lossPolicy",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpdateLossPolicy",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "priceOracle",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpdatePriceOracle",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "rateKeeper",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpdateRateKeeper",
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
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradeCreditFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradeInterestRateModelFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradeLossPolicyFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradePoolFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradePriceOracleFactory",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "UpgradeRateKeeperFactory",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotAdminException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotEmergencyAdminException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotSelfException",
  },
  {
    type: "error",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "CreditSuiteNotRegisteredException",
  },
  {
    type: "error",
    inputs: [{ name: "version", internalType: "uint256", type: "uint256" }],
    name: "IncorrectMinorVersionException",
  },
  {
    type: "error",
    inputs: [
      { name: "peripheryContract", internalType: "address", type: "address" },
    ],
    name: "IncorrectPeripheryContractException",
  },
  {
    type: "error",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "MarketNotRegisteredException",
  },
  {
    type: "error",
    inputs: [
      { name: "factory", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
    ],
    name: "UnauthorizedFactoryException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolQuotaKeeperV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolQuotaKeeperV310Abi = [
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
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "asset",
    outputs: [
      { name: "assetTokenAddress", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "availableLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestIndexLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowable",
    outputs: [{ name: "borrowable", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidityLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "interestRateModel",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastBaseInterestUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRevenueUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "lendCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "maxDeposit",
    outputs: [{ name: "maxAssets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "maxMint",
    outputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxRedeem",
    outputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ name: "maxAssets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "mintWithReferral",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewMint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    name: "repayCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newPoolQuotaKeeper", internalType: "address", type: "address" },
    ],
    name: "setPoolQuotaKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newQuotaRevenue", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotaRevenue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint256", type: "uint256" }],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newWithdrawFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "supplyRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalAssets",
    outputs: [
      { name: "totalManagedAssets", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "quotaRevenueDelta", internalType: "int256", type: "int256" },
    ],
    name: "updateQuotaRevenue",
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
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
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
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
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
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposit",
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
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
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
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
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
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdraw",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "convert",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertFromUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getReservePrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getSafePrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedParams",
    outputs: [
      {
        name: "",
        internalType: "struct PriceFeedParams",
        type: "tuple",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
          { name: "skipCheck", internalType: "bool", type: "bool" },
          { name: "tokenDecimals", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "reservePriceFeedParams",
    outputs: [
      {
        name: "",
        internalType: "struct PriceFeedParams",
        type: "tuple",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
          { name: "skipCheck", internalType: "bool", type: "bool" },
          { name: "tokenDecimals", internalType: "uint8", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "reservePriceFeeds",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "safeConvertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
    ],
    name: "setPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
    ],
    name: "setReservePriceFeed",
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
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPriceFeed",
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
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeed",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITumblerV310
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iTumblerV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokens", internalType: "address[]", type: "address[]" }],
    name: "getRates",
    outputs: [{ name: "", internalType: "uint16[]", type: "uint16[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAdded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "rate", internalType: "uint16", type: "uint16" },
    ],
    name: "setRate",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddToken",
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
    name: "SetRate",
  },
] as const;
