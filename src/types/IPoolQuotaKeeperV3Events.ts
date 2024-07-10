//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolQuotaKeeperV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolQuotaKeeperV3EventsAbi = [
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
] as const

