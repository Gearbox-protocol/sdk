//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV2Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV2EventsAbi = [
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
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ExecuteOrder",
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
    name: "NewConfigurator",
  },
] as const

