/**
 * Minimal ABI shared by RWA delayed-withdrawal gateways (Midas, Securitize).
 * Only holds `transferMaster`, which is the gateway's dedicated liquidator.
 */
export const iRWAGatewayAbi = [
  {
    type: "function",
    inputs: [],
    name: "transferMaster",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;
