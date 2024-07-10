//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SignUpRepositoryEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const signUpRepositoryEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      { name: "text", internalType: "string", type: "string", indexed: false },
      {
        name: "messageHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "NewSignatureAdded",
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
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "Signature",
  },
] as const
