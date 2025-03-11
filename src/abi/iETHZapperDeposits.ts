/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETHZapperDeposits
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iethZapperDepositsAbi = [
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "deposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
] as const;
