//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IControllerTimelockV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iControllerTimelockV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "CancelTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "ExecuteTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "executor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "signature",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      { name: "eta", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "QueueTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetVetoAdmin",
  },
] as const

