export const iAaveV3PoolAbi = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
      {
        type: "uint16",
        name: "referralCode",
      },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
        name: "to",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    name: "borrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "uint256",
        name: "interestRateMode",
      },
      {
        type: "uint16",
        name: "referralCode",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
    ],
    outputs: [],
  },
  {
    name: "repay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "uint256",
        name: "interestRateMode",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    name: "getReserveAToken",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
    ],
    outputs: [
      {
        type: "address",
      },
    ],
  },
  {
    name: "ADDRESSES_PROVIDER",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "asset" }],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "tuple",
            name: "configuration",
            components: [{ type: "uint256", name: "data" }],
          },
          { type: "uint128", name: "liquidityIndex" },
          { type: "uint128", name: "currentLiquidityRate" },
          { type: "uint128", name: "variableBorrowIndex" },
          { type: "uint128", name: "currentVariableBorrowRate" },
          { type: "uint128", name: "currentStableBorrowRate" },
          { type: "uint40", name: "lastUpdateTimestamp" },
          { type: "uint16", name: "id" },
          { type: "address", name: "aTokenAddress" },
          { type: "address", name: "stableDebtTokenAddress" },
          { type: "address", name: "variableDebtTokenAddress" },
          { type: "address", name: "interestRateStrategyAddress" },
          { type: "uint128", name: "accruedToTreasury" },
          { type: "uint128", name: "unbacked" },
          { type: "uint128", name: "isolationModeTotalDebt" },
        ],
      },
    ],
  },
  {
    name: "getUserAccountData",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "user" }],
    outputs: [
      { type: "uint256", name: "totalCollateralBase" },
      { type: "uint256", name: "totalDebtBase" },
      { type: "uint256", name: "availableBorrowsBase" },
      { type: "uint256", name: "currentLiquidationThreshold" },
      { type: "uint256", name: "ltv" },
      { type: "uint256", name: "healthFactor" },
    ],
  },
  {
    name: "getUserEMode",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "user" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getEModeCategoryCollateralConfig",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint8", name: "id" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint16", name: "ltv" },
          { type: "uint16", name: "liquidationThreshold" },
          { type: "uint16", name: "liquidationBonus" },
        ],
      },
    ],
  },
  {
    name: "getEModeCategoryCollateralBitmap",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint8", name: "id" }],
    outputs: [{ type: "uint128" }],
  },
] as const;
