//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGaugeV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGaugeV3EventsAbi = [
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
] as const

