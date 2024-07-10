//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstoneDefaultsLib
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneDefaultsLibAbi = [
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampFromTooLongFuture",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampIsTooOld",
  },
] as const

