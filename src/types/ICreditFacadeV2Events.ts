//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2EventsAbi = [
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
] as const

