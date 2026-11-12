export const iVariableDebtTokenAbi = [
  {
    name: "borrowAllowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "fromUser" },
      { type: "address", name: "toUser" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;
