/**
 * Minimal bot interface: the permissions a bot needs to operate on a credit
 * account, which the SDK reads when the caller does not specify them.
 **/
export const iBotAbi = [
  {
    type: "function",
    name: "requiredPermissions",
    inputs: [],
    outputs: [{ name: "", type: "uint192", internalType: "uint192" }],
    stateMutability: "view",
  },
] as const;
