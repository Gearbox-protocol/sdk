export const AURA_BOOSTER_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "input",
        type: "address",
      },
    ],
    name: "getRewardMultipliers",
    outputs: [
      {
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
