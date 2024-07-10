//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IZapperRegister
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iZapperRegisterAbi = [
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "zappers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "AddZapper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "RemoveZapper",
  },
] as const

