//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV3EventsAbi = [
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DecreaseDebt",
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
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncreaseDebt",
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
] as const

