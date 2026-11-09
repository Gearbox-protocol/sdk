export const iTreehouseFastlaneAbi = [
  {
    type: "function",
    name: "TASSET",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UNDERLYING",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemAndFinalize",
    inputs: [
      {
        name: "_shares",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
