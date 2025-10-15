// ABI definitions for Credit Factory structs

export const deployParamsAbi = {
  name: "DeployParams",
  type: "tuple",
  components: [
    {
      name: "postfix",
      type: "bytes32",
      internalType: "bytes32",
    },
    {
      name: "salt",
      type: "bytes32",
      internalType: "bytes32",
    },
    {
      name: "constructorParams",
      type: "bytes",
      internalType: "bytes",
    },
  ],
} as const;

export const creditManagerParamsAbi = {
  name: "CreditManagerParams",
  type: "tuple",
  components: [
    {
      name: "maxEnabledTokens",
      type: "uint8",
      internalType: "uint8",
    },
    {
      name: "feeInterest",
      type: "uint16",
      internalType: "uint16",
    },
    {
      name: "feeLiquidation",
      type: "uint16",
      internalType: "uint16",
    },
    {
      name: "liquidationPremium",
      type: "uint16",
      internalType: "uint16",
    },
    {
      name: "feeLiquidationExpired",
      type: "uint16",
      internalType: "uint16",
    },
    {
      name: "liquidationPremiumExpired",
      type: "uint16",
      internalType: "uint16",
    },
    {
      name: "minDebt",
      type: "uint128",
      internalType: "uint128",
    },
    {
      name: "maxDebt",
      type: "uint128",
      internalType: "uint128",
    },
    {
      name: "name",
      type: "string",
      internalType: "string",
    },
    {
      name: "accountFactoryParams",
      type: "tuple",
      internalType: "struct DeployParams",
      components: deployParamsAbi.components,
    },
  ],
} as const;

export const creditFacadeParamsAbi = {
  name: "CreditFacadeParams",
  type: "tuple",
  components: [
    {
      name: "degenNFT",
      type: "address",
      internalType: "address",
    },
    {
      name: "expirable",
      type: "bool",
      internalType: "bool",
    },
    {
      name: "migrateBotList",
      type: "bool",
      internalType: "bool",
    },
  ],
} as const;

// export const creditSuiteParamsAbi = {
//   name: "CreditSuiteParams",
//   type: "tuple",
//   components: [creditManagerParamsAbi, creditFacadeParamsAbi],
// } as const;
