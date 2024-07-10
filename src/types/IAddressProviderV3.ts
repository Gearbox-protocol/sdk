//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "addresses",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddressOrRevert",
    outputs: [{ name: "result", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "address", type: "address" },
      { name: "saveVersion", internalType: "bool", type: "bool" },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
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

