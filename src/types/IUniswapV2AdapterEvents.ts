//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV2AdapterEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV2AdapterEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPairStatus",
  },
] as const

