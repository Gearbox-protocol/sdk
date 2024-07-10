//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV3AdapterEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV3AdapterEventsAbi = [
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
      { name: "fee", internalType: "uint24", type: "uint24", indexed: true },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
] as const

