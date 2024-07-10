//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILPPriceFeedEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ilpPriceFeedEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "lowerBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "upperBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetBounds",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetUpdateBoundsAllowed",
  },
] as const

