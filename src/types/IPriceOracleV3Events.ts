//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV3EventsAbi = [
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
      { name: "trusted", internalType: "bool", type: "bool", indexed: false },
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
      { name: "active", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeedStatus",
  },
] as const

