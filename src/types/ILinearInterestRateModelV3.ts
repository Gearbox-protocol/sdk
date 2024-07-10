//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILinearInterestRateModelV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLinearInterestRateModelV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
    ],
    name: "availableToBorrow",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
      { name: "checkOptimalBorrowing", internalType: "bool", type: "bool" },
    ],
    name: "calcBorrowRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getModelParameters",
    outputs: [
      { name: "U_1", internalType: "uint16", type: "uint16" },
      { name: "U_2", internalType: "uint16", type: "uint16" },
      { name: "R_base", internalType: "uint16", type: "uint16" },
      { name: "R_slope1", internalType: "uint16", type: "uint16" },
      { name: "R_slope2", internalType: "uint16", type: "uint16" },
      { name: "R_slope3", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isBorrowingMoreU2Forbidden",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const

