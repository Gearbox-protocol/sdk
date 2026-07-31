export const iMidasLiquidatorV311Abi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTransferAllowed",
    inputs: [
      { name: "redeemerOwner", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "liquidateWithRedeemerTransfers",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "gateway", type: "address", internalType: "address" },
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "lossPolicyData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferableRedeemerOwner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", name: "NotValidGatewayException", inputs: [] },
] as const;
