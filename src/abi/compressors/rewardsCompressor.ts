export const rewardsCompressorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider_", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRewards",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "rewards",
        type: "tuple[]",
        internalType: "struct RewardInfo[]",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "rewardToken", type: "address", internalType: "address" },
          {
            name: "stakedPhantomToken",
            type: "address",
            internalType: "address",
          },
          { name: "adapter", type: "address", internalType: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
