export const iCreditConfigureActionsAbi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    name: "addCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct DeployParams",
        type: "tuple",
        components: [
          { name: "postfix", internalType: "bytes32", type: "bytes32" },
          { name: "salt", internalType: "bytes32", type: "bytes32" },
          { name: "constructorParams", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "allowAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "allowToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "configureAdapterFor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "forbidToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "rampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "rampLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newExpirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationPremium", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationPremiumExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxDebtLimitPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setMaxDebtPerBlockMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "upgradeCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct CreditFacadeParams",
        type: "tuple",
        components: [
          { name: "degenNFT", internalType: "address", type: "address" },
          { name: "expirable", internalType: "bool", type: "bool" },
          { name: "migrateBotList", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "upgradeCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
