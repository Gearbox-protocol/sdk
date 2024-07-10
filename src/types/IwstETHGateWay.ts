//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IwstETHGateWay
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthGateWayAbi = [
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "removeLiquidity",
    outputs: [{ name: "amountGet", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "NonRegisterPoolException" },
] as const

