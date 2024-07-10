//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWETHGateway
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwethGatewayAbi = [
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "addLiquidityETH",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address payable", type: "address" },
    ],
    name: "removeLiquidityETH",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrapWETH",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

