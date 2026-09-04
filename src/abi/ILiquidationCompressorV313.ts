//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LiquidationCompressorV313
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLiquidationCompressorV313Abi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLiquidationData",
    inputs: [
      { name: "liquidator", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
      {
        name: "priceUpdates",
        type: "tuple[]",
        internalType: "struct PriceUpdate[]",
        components: [
          { name: "priceFeed", type: "address", internalType: "address" },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct LiquidationData",
        components: [
          { name: "requiredToken", type: "address", internalType: "address" },
          { name: "requiredAmount", type: "uint256", internalType: "uint256" },
          {
            name: "expectedOutputs",
            type: "tuple[]",
            internalType: "struct LiquidationOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "amount", type: "uint256", internalType: "uint256" },
              { name: "delayed", type: "bool", internalType: "bool" },
              {
                name: "redeemerAddress",
                type: "address",
                internalType: "address",
              },
              { name: "claimableAt", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "liquidationCall",
            type: "tuple",
            internalType: "struct MultiCall",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "isLiquidatorEligible", type: "bool", internalType: "bool" },
          { name: "isCreditAccountFrozen", type: "bool", internalType: "bool" },
          { name: "kycProtocol", type: "string", internalType: "string" },
          { name: "kycToken", type: "address", internalType: "address" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRWALiquidators",
    inputs: [
      { name: "marketConfigurator", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct RWALiquidatorInfo[]",
        components: [
          { name: "gateway", type: "address", internalType: "address" },
          {
            name: "liquidatorAddress",
            type: "address",
            internalType: "address",
          },
          { name: "contractType", type: "bytes32", internalType: "bytes32" },
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
