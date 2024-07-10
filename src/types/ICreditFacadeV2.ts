//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2Abi = [
  {
    type: "function",
    inputs: [
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "state", internalType: "bool", type: "bool" },
    ],
    name: "approveAccountTransfer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "blacklistHelper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "calcCreditAccountHealthFactor",
    outputs: [{ name: "hf", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "calcTotalValue",
    outputs: [
      { name: "total", internalType: "uint256", type: "uint256" },
      { name: "twv", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
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
    name: "creditManager",
    outputs: [
      { name: "", internalType: "contract ICreditManagerV2", type: "address" },
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
    inputs: [{ name: "borrower", internalType: "address", type: "address" }],
    name: "hasOpenedCreditAccount",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isBlacklistableUnderlying",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "limits",
    outputs: [
      { name: "minBorrowedAmount", internalType: "uint128", type: "uint128" },
      { name: "maxBorrowedAmount", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
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
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
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
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
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
    name: "liquidateExpiredCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
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
    name: "liquidateExpiredCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "lossParams",
    outputs: [
      {
        name: "currentCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "maxCumulativeLoss", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
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
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "leverageFactor", internalType: "uint16", type: "uint16" },
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "openCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
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
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "openCreditAccountMulticall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "params",
    outputs: [
      {
        name: "maxBorrowedAmountPerBlock",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "isIncreaseDebtForbidden", internalType: "bool", type: "bool" },
      { name: "expirationDate", internalType: "uint40", type: "uint40" },
      {
        name: "emergencyLiquidationDiscount",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebt",
    outputs: [
      { name: "currentTotalDebt", internalType: "uint128", type: "uint128" },
      { name: "totalDebtLimit", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "transferAccountOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "transfersAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "blacklistHelper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BlacklistHelperSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "DecreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "IncreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurLossOnLiquidation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
      { name: "to", internalType: "address", type: "address", indexed: true },
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
        name: "borrower",
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
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateExpiredCreditAccount",
  },
  { type: "event", anonymous: false, inputs: [], name: "MultiCallFinished" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "MultiCallStarted",
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
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "referralCode",
        internalType: "uint16",
        type: "uint16",
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
        name: "borrower",
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
    ],
    name: "TokenDisabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    ],
    name: "TokenEnabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TransferAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "state", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TransferAccountAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "UnderlyingSentToBlacklistHelper",
  },
  { type: "error", inputs: [], name: "AccountTransferNotAllowedException" },
  {
    type: "error",
    inputs: [],
    name: "ActionProhibitedWithForbiddenTokensException",
  },
  { type: "error", inputs: [], name: "AdaptersOrCreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "BalanceLessThanMinimumDesiredException",
  },
  { type: "error", inputs: [], name: "BorrowAmountOutOfLimitsException" },
  { type: "error", inputs: [], name: "BorrowedBlockLimitException" },
  { type: "error", inputs: [], name: "CantLiquidateNonExpiredException" },
  {
    type: "error",
    inputs: [],
    name: "CantLiquidateWithSuchHealthFactorException",
  },
  {
    type: "error",
    inputs: [],
    name: "CantTransferLiquidatableAccountException",
  },
  { type: "error", inputs: [], name: "CreditConfiguratorOnlyException" },
  { type: "error", inputs: [], name: "CreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "ExpectedBalancesAlreadySetException" },
  { type: "error", inputs: [], name: "ForbiddenDuringClosureException" },
  { type: "error", inputs: [], name: "HasNoOpenedAccountException" },
  { type: "error", inputs: [], name: "IncorrectCallDataException" },
  {
    type: "error",
    inputs: [],
    name: "IncreaseAndDecreaseForbiddenInOneCallException",
  },
  { type: "error", inputs: [], name: "IncreaseDebtForbiddenException" },
  { type: "error", inputs: [], name: "LiquiditySanityCheckException" },
  {
    type: "error",
    inputs: [],
    name: "NotAllowedForBlacklistedAddressException",
  },
  { type: "error", inputs: [], name: "NotAllowedInWhitelistedMode" },
  { type: "error", inputs: [], name: "NotAllowedWhenNotExpirableException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  {
    type: "error",
    inputs: [],
    name: "OpenAccountNotAllowedAfterExpirationException",
  },
  { type: "error", inputs: [], name: "ReentrancyLockException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "UnknownMethodException" },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressOrUserAlreadyHasAccountException",
  },
] as const

