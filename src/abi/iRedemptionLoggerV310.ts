/**
 * ABI of `IRedemptionLogger` from `@gearbox-protocol/integrations-v3`,
 * copied from the forge artifact `out/IRedemptionLogger.sol/IRedemptionLogger.json`
 */
export const iRedemptionLoggerV310Abi = [
  {
    type: "function",
    name: "allowedGateways",
    inputs: [{ name: "gateway", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
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
    name: "logRedemption",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "redeemer", type: "address", internalType: "address" },
      { name: "extraData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redemptionLogs",
    inputs: [{ name: "redeemer", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IRedemptionLogger.RedemptionLog",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setGatewayAllowed",
    inputs: [
      { name: "gateway", type: "address", internalType: "address" },
      { name: "allowed", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "RedemptionLogged",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "redeemer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "GatewayNotAllowedException",
    inputs: [],
  },
] as const;
