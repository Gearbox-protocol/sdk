//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPendleRouterAdapterEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPendleRouterAdapterEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "market",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "inputToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "pendleToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "allowed",
        internalType: "enum PendleStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPairStatus",
  },
] as const

