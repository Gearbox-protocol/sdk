//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRouterStatic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRouterStaticAbi = [
  {
    type: "function",
    inputs: [
      { name: "YT", internalType: "address", type: "address" },
      { name: "netPYToRedeem", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "redeemPyToTokenStatic",
    outputs: [
      { name: "netTokenOut", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "exactPtIn", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "swapExactPtForTokenStatic",
    outputs: [
      { name: "netTokenOut", internalType: "uint256", type: "uint256" },
      { name: "netSyToRedeem", internalType: "uint256", type: "uint256" },
      { name: "netSyFee", internalType: "uint256", type: "uint256" },
      { name: "priceImpact", internalType: "uint256", type: "uint256" },
      { name: "exchangeRateAfter", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amountTokenIn", internalType: "uint256", type: "uint256" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokenForPtStaticAndGenerateApproxParams",
    outputs: [
      { name: "netPtOut", internalType: "uint256", type: "uint256" },
      { name: "netSyMinted", internalType: "uint256", type: "uint256" },
      { name: "netSyFee", internalType: "uint256", type: "uint256" },
      { name: "priceImpact", internalType: "uint256", type: "uint256" },
      { name: "exchangeRateAfter", internalType: "uint256", type: "uint256" },
      {
        name: "approxParams",
        internalType: "struct ApproxParams",
        type: "tuple",
        components: [
          { name: "guessMin", internalType: "uint256", type: "uint256" },
          { name: "guessMax", internalType: "uint256", type: "uint256" },
          { name: "guessOffchain", internalType: "uint256", type: "uint256" },
          { name: "maxIteration", internalType: "uint256", type: "uint256" },
          { name: "eps", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const

