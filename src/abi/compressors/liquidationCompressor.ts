export const liquidationCompressorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", type: "address", internalType: "address" },
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
    name: "compressorTypeToCompressor",
    inputs: [
      { name: "", type: "bytes32", internalType: "bytes32" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
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
          {
            name: "requiredUnderlyingAmount",
            type: "uint256",
            internalType: "uint256",
          },
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
          { name: "kycProtocol", type: "string", internalType: "string" },
          { name: "kycToken", type: "address", internalType: "address" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "liquidatableTypeToCompressorType",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "liquidatableTypeToSpecificCompressorVersion",
    inputs: [
      { name: "", type: "bytes32", internalType: "bytes32" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLiquidatableTypeToCompressorType",
    inputs: [
      { name: "liquidatableType", type: "bytes32", internalType: "bytes32" },
      { name: "compressorType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLiquidatableVersionToSpecificCompressorVersion",
    inputs: [
      { name: "liquidatableType", type: "bytes32", internalType: "bytes32" },
      { name: "liquidatableVersion", type: "uint256", internalType: "uint256" },
      { name: "compressorVersion", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setSubcompressor",
    inputs: [
      { name: "subcompressor", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
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
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
