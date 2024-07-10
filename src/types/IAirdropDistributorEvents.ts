//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAirdropDistributorEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAirdropDistributorEventsAbi = [
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
      { name: "historic", internalType: "bool", type: "bool", indexed: true },
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
        name: "campaignId",
        internalType: "uint8",
        type: "uint8",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TokenAllocated",
  },
] as const

