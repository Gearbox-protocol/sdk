/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IOffchainOracle
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iOffchainOracleAbi = [
  {
    type: "function",
    inputs: [
      { name: "srcToken", internalType: "address", type: "address" },
      { name: "dstToken", internalType: "address", type: "address" },
      { name: "useWrappers", internalType: "bool", type: "bool" },
    ],
    name: "getRate",
    outputs: [
      { name: "weightedRate", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "srcToken", internalType: "address", type: "address" },
      { name: "useSrcWrappers", internalType: "bool", type: "bool" },
    ],
    name: "getRateToEth",
    outputs: [
      { name: "weightedRate", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;
