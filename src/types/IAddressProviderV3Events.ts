//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "SetAddress",
  },
] as const

