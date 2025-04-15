/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IInterestRateModel
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iInterestRateModelAbi = [
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
    ],
    name: "calcBorrowRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
