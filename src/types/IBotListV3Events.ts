//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBotListV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBotListV3EventsAbi = [
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
    ],
    name: "EraseBot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      { name: "forbidden", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetBotForbiddenStatus",
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
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotSpecialPermissions",
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
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetCreditManagerApprovedStatus",
  },
] as const

