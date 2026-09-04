export const iSecuritizeLiquidatorV311Abi = [
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
    name: "liquidatePendingRedemption",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "redemptionGateway", type: "address", internalType: "address" },
      {
        name: "priceUpdates",
        type: "tuple[]",
        internalType: "struct PriceUpdate[]",
        components: [
          { name: "priceFeed", type: "address", internalType: "address" },
          { name: "data", type: "bytes", internalType: "bytes" },
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
  {
    type: "error",
    name: "AccountHasSufficientLiquidityException",
    inputs: [],
  },
  { type: "error", name: "NotValidGatewayException", inputs: [] },
  { type: "error", name: "StableCoinIsNotConvertibleException", inputs: [] },
  { type: "error", name: "UnknownCreditAccountException", inputs: [] },
] as const;
