//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PartialLiquidationBotV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const partialLiquidationBotV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
      { name: "minHealthFactor_", internalType: "uint16", type: "uint16" },
      { name: "maxHealthFactor_", internalType: "uint16", type: "uint16" },
      { name: "premiumScaleFactor_", internalType: "uint16", type: "uint16" },
      { name: "feeScaleFactor_", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "feeScaleFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "seizedAmount", internalType: "uint256", type: "uint256" },
      { name: "maxRepaidAmount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct IPartialLiquidationBotV3.PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExactCollateral",
    outputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "minSeizedAmount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct IPartialLiquidationBotV3.PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExactDebt",
    outputs: [
      { name: "seizedAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxHealthFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "minHealthFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "premiumScaleFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "repaidDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "seizedCollateral",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "LiquidatePartial",
  },
  { type: "error", inputs: [], name: "CreditAccountNotLiquidatableException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "LiquidatedLessThanNeededException" },
  { type: "error", inputs: [], name: "LiquidatedMoreThanNeededException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "RepaidMoreThanAllowedException" },
  { type: "error", inputs: [], name: "SeizedLessThanRequiredException" },
  { type: "error", inputs: [], name: "UnderlyingNotLiquidatableException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const

