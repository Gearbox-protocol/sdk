//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVotingContractV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVotingContractV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "unvote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

