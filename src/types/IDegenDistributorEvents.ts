//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenDistributorEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenDistributorEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
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
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
  },
] as const

