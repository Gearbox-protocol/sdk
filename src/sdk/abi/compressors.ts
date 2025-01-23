/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditAccountCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditAccountCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "countCreditAccounts",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "countCreditAccounts",
    inputs: [
      {
        name: "cmFilter",
        type: "tuple",
        internalType: "struct MarketFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          { name: "pools", type: "address[]", internalType: "address[]" },
          { name: "underlying", type: "address", internalType: "address" },
        ],
      },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccountData",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct CreditAccountData",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "creditManager", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "debt", type: "uint256", internalType: "uint256" },
          { name: "accruedInterest", type: "uint256", internalType: "uint256" },
          { name: "accruedFees", type: "uint256", internalType: "uint256" },
          { name: "totalDebtUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValueUSD", type: "uint256", internalType: "uint256" },
          { name: "twvUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValue", type: "uint256", internalType: "uint256" },
          { name: "healthFactor", type: "uint16", internalType: "uint16" },
          { name: "success", type: "bool", internalType: "bool" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "mask", type: "uint256", internalType: "uint256" },
              { name: "balance", type: "uint256", internalType: "uint256" },
              { name: "quota", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [
      {
        name: "cmFilter",
        type: "tuple",
        internalType: "struct MarketFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          { name: "pools", type: "address[]", internalType: "address[]" },
          { name: "underlying", type: "address", internalType: "address" },
        ],
      },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
      { name: "offset", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct CreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "creditManager", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "debt", type: "uint256", internalType: "uint256" },
          { name: "accruedInterest", type: "uint256", internalType: "uint256" },
          { name: "accruedFees", type: "uint256", internalType: "uint256" },
          { name: "totalDebtUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValueUSD", type: "uint256", internalType: "uint256" },
          { name: "twvUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValue", type: "uint256", internalType: "uint256" },
          { name: "healthFactor", type: "uint16", internalType: "uint16" },
          { name: "success", type: "bool", internalType: "bool" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "mask", type: "uint256", internalType: "uint256" },
              { name: "balance", type: "uint256", internalType: "uint256" },
              { name: "quota", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
      { name: "offset", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct CreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "creditManager", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "debt", type: "uint256", internalType: "uint256" },
          { name: "accruedInterest", type: "uint256", internalType: "uint256" },
          { name: "accruedFees", type: "uint256", internalType: "uint256" },
          { name: "totalDebtUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValueUSD", type: "uint256", internalType: "uint256" },
          { name: "twvUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValue", type: "uint256", internalType: "uint256" },
          { name: "healthFactor", type: "uint16", internalType: "uint16" },
          { name: "success", type: "bool", internalType: "bool" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "mask", type: "uint256", internalType: "uint256" },
              { name: "balance", type: "uint256", internalType: "uint256" },
              { name: "quota", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
      { name: "offset", type: "uint256", internalType: "uint256" },
      { name: "limit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct CreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "creditManager", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "debt", type: "uint256", internalType: "uint256" },
          { name: "accruedInterest", type: "uint256", internalType: "uint256" },
          { name: "accruedFees", type: "uint256", internalType: "uint256" },
          { name: "totalDebtUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValueUSD", type: "uint256", internalType: "uint256" },
          { name: "twvUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValue", type: "uint256", internalType: "uint256" },
          { name: "healthFactor", type: "uint16", internalType: "uint16" },
          { name: "success", type: "bool", internalType: "bool" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "mask", type: "uint256", internalType: "uint256" },
              { name: "balance", type: "uint256", internalType: "uint256" },
              { name: "quota", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditAccounts",
    inputs: [
      {
        name: "cmFilter",
        type: "tuple",
        internalType: "struct MarketFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          { name: "pools", type: "address[]", internalType: "address[]" },
          { name: "underlying", type: "address", internalType: "address" },
        ],
      },
      {
        name: "caFilter",
        type: "tuple",
        internalType: "struct CreditAccountFilter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "includeZeroDebt", type: "bool", internalType: "bool" },
          { name: "minHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "maxHealthFactor", type: "uint16", internalType: "uint16" },
          { name: "reverting", type: "bool", internalType: "bool" },
        ],
      },
      { name: "offset", type: "uint256", internalType: "uint256" },
      { name: "limit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple[]",
        internalType: "struct CreditAccountData[]",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "creditManager", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "debt", type: "uint256", internalType: "uint256" },
          { name: "accruedInterest", type: "uint256", internalType: "uint256" },
          { name: "accruedFees", type: "uint256", internalType: "uint256" },
          { name: "totalDebtUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValueUSD", type: "uint256", internalType: "uint256" },
          { name: "twvUSD", type: "uint256", internalType: "uint256" },
          { name: "totalValue", type: "uint256", internalType: "uint256" },
          { name: "healthFactor", type: "uint16", internalType: "uint16" },
          { name: "success", type: "bool", internalType: "bool" },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenInfo[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "mask", type: "uint256", internalType: "uint256" },
              { name: "balance", type: "uint256", internalType: "uint256" },
              { name: "quota", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", type: "uint256", internalType: "uint256" },
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMarketCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMarketCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketData",
    inputs: [
      { name: "pool", type: "address", internalType: "address" },
      { name: "configurator", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct MarketData",
        components: [
          { name: "acl", type: "address", internalType: "address" },
          {
            name: "contractsRegister",
            type: "address",
            internalType: "address",
          },
          { name: "treasury", type: "address", internalType: "address" },
          {
            name: "pool",
            type: "tuple",
            internalType: "struct PoolState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
              { name: "totalSupply", type: "uint256", internalType: "uint256" },
              {
                name: "poolQuotaKeeper",
                type: "address",
                internalType: "address",
              },
              {
                name: "interestRateModel",
                type: "address",
                internalType: "address",
              },
              { name: "underlying", type: "address", internalType: "address" },
              {
                name: "availableLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestIndex",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestRate",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "dieselRate", type: "uint256", internalType: "uint256" },
              { name: "supplyRate", type: "uint256", internalType: "uint256" },
              { name: "withdrawFee", type: "uint256", internalType: "uint256" },
              {
                name: "totalBorrowed",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDebtLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "creditManagerDebtParams",
                type: "tuple[]",
                internalType: "struct CreditManagerDebtParams[]",
                components: [
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "borrowed",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "limit", type: "uint256", internalType: "uint256" },
                  {
                    name: "available",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "baseInterestIndexLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidityLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "quotaRevenue",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "lastBaseInterestUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              {
                name: "lastQuotaRevenueUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              { name: "isPaused", type: "bool", internalType: "bool" },
            ],
          },
          {
            name: "poolQuotaKeeper",
            type: "tuple",
            internalType: "struct PoolQuotaKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "rateKeeper", type: "address", internalType: "address" },
              {
                name: "quotas",
                type: "tuple[]",
                internalType: "struct QuotaTokenParams[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                  {
                    name: "cumulativeIndexLU",
                    type: "uint192",
                    internalType: "uint192",
                  },
                  {
                    name: "quotaIncreaseFee",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "totalQuoted",
                    type: "uint96",
                    internalType: "uint96",
                  },
                  { name: "limit", type: "uint96", internalType: "uint96" },
                  { name: "isActive", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManagers",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "lastQuotaRateUpdate",
                type: "uint40",
                internalType: "uint40",
              },
            ],
          },
          {
            name: "interestRateModel",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "rateKeeper",
            type: "tuple",
            internalType: "struct RateKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "rates",
                type: "tuple[]",
                internalType: "struct Rate[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                ],
              },
            ],
          },
          {
            name: "priceOracleData",
            type: "tuple",
            internalType: "struct PriceOracleState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "priceFeedMapping",
                type: "tuple[]",
                internalType: "struct PriceFeedMapEntry[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "reserve", type: "bool", internalType: "bool" },
                  {
                    name: "priceFeed",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "stalenessPeriod",
                    type: "uint32",
                    internalType: "uint32",
                  },
                ],
              },
              {
                name: "priceFeedStructure",
                type: "tuple[]",
                internalType: "struct PriceFeedTreeNode[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "description",
                    type: "string",
                    internalType: "string",
                  },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                  { name: "skipCheck", type: "bool", internalType: "bool" },
                  { name: "updatable", type: "bool", internalType: "bool" },
                  {
                    name: "underlyingFeeds",
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "underlyingStalenessPeriods",
                    type: "uint32[]",
                    internalType: "uint32[]",
                  },
                  {
                    name: "answer",
                    type: "tuple",
                    internalType: "struct PriceFeedAnswer",
                    components: [
                      { name: "price", type: "int256", internalType: "int256" },
                      {
                        name: "updatedAt",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      { name: "success", type: "bool", internalType: "bool" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "lossPolicy",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenData[]",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
            ],
          },
          {
            name: "creditManagers",
            type: "tuple[]",
            internalType: "struct CreditSuiteData[]",
            components: [
              {
                name: "creditFacade",
                type: "tuple",
                internalType: "struct CreditFacadeState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "degenNFT",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "botList", type: "address", internalType: "address" },
                  { name: "expirable", type: "bool", internalType: "bool" },
                  {
                    name: "expirationDate",
                    type: "uint40",
                    internalType: "uint40",
                  },
                  {
                    name: "maxDebtPerBlockMultiplier",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  { name: "minDebt", type: "uint256", internalType: "uint256" },
                  { name: "maxDebt", type: "uint256", internalType: "uint256" },
                  {
                    name: "forbiddenTokenMask",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "isPaused", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManager",
                type: "tuple",
                internalType: "struct CreditManagerState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  { name: "name", type: "string", internalType: "string" },
                  {
                    name: "accountFactory",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "underlying",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "pool", type: "address", internalType: "address" },
                  {
                    name: "creditFacade",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "creditConfigurator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maxEnabledTokens",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  {
                    name: "collateralTokens",
                    type: "tuple[]",
                    internalType: "struct CollateralToken[]",
                    components: [
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "liquidationThreshold",
                        type: "uint16",
                        internalType: "uint16",
                      },
                    ],
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
                    name: "liquidationDiscount",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "feeLiquidationExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "liquidationDiscountExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                ],
              },
              {
                name: "creditConfigurator",
                type: "tuple",
                internalType: "struct BaseState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                ],
              },
              {
                name: "adapters",
                type: "tuple[]",
                internalType: "struct AdapterState[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "targetContract",
                    type: "address",
                    internalType: "address",
                  },
                ],
              },
            ],
          },
          { name: "configurator", type: "address", internalType: "address" },
          {
            name: "pausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "unpausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "emergencyLiquidators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "zappers",
            type: "tuple[]",
            internalType: "struct ZapperState[]",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "tokenIn",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
              {
                name: "tokenOut",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketData",
    inputs: [{ name: "pool", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct MarketData",
        components: [
          { name: "acl", type: "address", internalType: "address" },
          {
            name: "contractsRegister",
            type: "address",
            internalType: "address",
          },
          { name: "treasury", type: "address", internalType: "address" },
          {
            name: "pool",
            type: "tuple",
            internalType: "struct PoolState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
              { name: "totalSupply", type: "uint256", internalType: "uint256" },
              {
                name: "poolQuotaKeeper",
                type: "address",
                internalType: "address",
              },
              {
                name: "interestRateModel",
                type: "address",
                internalType: "address",
              },
              { name: "underlying", type: "address", internalType: "address" },
              {
                name: "availableLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestIndex",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestRate",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "dieselRate", type: "uint256", internalType: "uint256" },
              { name: "supplyRate", type: "uint256", internalType: "uint256" },
              { name: "withdrawFee", type: "uint256", internalType: "uint256" },
              {
                name: "totalBorrowed",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDebtLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "creditManagerDebtParams",
                type: "tuple[]",
                internalType: "struct CreditManagerDebtParams[]",
                components: [
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "borrowed",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "limit", type: "uint256", internalType: "uint256" },
                  {
                    name: "available",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "baseInterestIndexLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidityLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "quotaRevenue",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "lastBaseInterestUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              {
                name: "lastQuotaRevenueUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              { name: "isPaused", type: "bool", internalType: "bool" },
            ],
          },
          {
            name: "poolQuotaKeeper",
            type: "tuple",
            internalType: "struct PoolQuotaKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "rateKeeper", type: "address", internalType: "address" },
              {
                name: "quotas",
                type: "tuple[]",
                internalType: "struct QuotaTokenParams[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                  {
                    name: "cumulativeIndexLU",
                    type: "uint192",
                    internalType: "uint192",
                  },
                  {
                    name: "quotaIncreaseFee",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "totalQuoted",
                    type: "uint96",
                    internalType: "uint96",
                  },
                  { name: "limit", type: "uint96", internalType: "uint96" },
                  { name: "isActive", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManagers",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "lastQuotaRateUpdate",
                type: "uint40",
                internalType: "uint40",
              },
            ],
          },
          {
            name: "interestRateModel",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "rateKeeper",
            type: "tuple",
            internalType: "struct RateKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "rates",
                type: "tuple[]",
                internalType: "struct Rate[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                ],
              },
            ],
          },
          {
            name: "priceOracleData",
            type: "tuple",
            internalType: "struct PriceOracleState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "priceFeedMapping",
                type: "tuple[]",
                internalType: "struct PriceFeedMapEntry[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "reserve", type: "bool", internalType: "bool" },
                  {
                    name: "priceFeed",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "stalenessPeriod",
                    type: "uint32",
                    internalType: "uint32",
                  },
                ],
              },
              {
                name: "priceFeedStructure",
                type: "tuple[]",
                internalType: "struct PriceFeedTreeNode[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "description",
                    type: "string",
                    internalType: "string",
                  },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                  { name: "skipCheck", type: "bool", internalType: "bool" },
                  { name: "updatable", type: "bool", internalType: "bool" },
                  {
                    name: "underlyingFeeds",
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "underlyingStalenessPeriods",
                    type: "uint32[]",
                    internalType: "uint32[]",
                  },
                  {
                    name: "answer",
                    type: "tuple",
                    internalType: "struct PriceFeedAnswer",
                    components: [
                      { name: "price", type: "int256", internalType: "int256" },
                      {
                        name: "updatedAt",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      { name: "success", type: "bool", internalType: "bool" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "lossPolicy",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenData[]",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
            ],
          },
          {
            name: "creditManagers",
            type: "tuple[]",
            internalType: "struct CreditSuiteData[]",
            components: [
              {
                name: "creditFacade",
                type: "tuple",
                internalType: "struct CreditFacadeState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "degenNFT",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "botList", type: "address", internalType: "address" },
                  { name: "expirable", type: "bool", internalType: "bool" },
                  {
                    name: "expirationDate",
                    type: "uint40",
                    internalType: "uint40",
                  },
                  {
                    name: "maxDebtPerBlockMultiplier",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  { name: "minDebt", type: "uint256", internalType: "uint256" },
                  { name: "maxDebt", type: "uint256", internalType: "uint256" },
                  {
                    name: "forbiddenTokenMask",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "isPaused", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManager",
                type: "tuple",
                internalType: "struct CreditManagerState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  { name: "name", type: "string", internalType: "string" },
                  {
                    name: "accountFactory",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "underlying",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "pool", type: "address", internalType: "address" },
                  {
                    name: "creditFacade",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "creditConfigurator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maxEnabledTokens",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  {
                    name: "collateralTokens",
                    type: "tuple[]",
                    internalType: "struct CollateralToken[]",
                    components: [
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "liquidationThreshold",
                        type: "uint16",
                        internalType: "uint16",
                      },
                    ],
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
                    name: "liquidationDiscount",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "feeLiquidationExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "liquidationDiscountExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                ],
              },
              {
                name: "creditConfigurator",
                type: "tuple",
                internalType: "struct BaseState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                ],
              },
              {
                name: "adapters",
                type: "tuple[]",
                internalType: "struct AdapterState[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "targetContract",
                    type: "address",
                    internalType: "address",
                  },
                ],
              },
            ],
          },
          { name: "configurator", type: "address", internalType: "address" },
          {
            name: "pausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "unpausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "emergencyLiquidators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "zappers",
            type: "tuple[]",
            internalType: "struct ZapperState[]",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "tokenIn",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
              {
                name: "tokenOut",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarkets",
    inputs: [
      {
        name: "filter",
        type: "tuple",
        internalType: "struct MarketFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          { name: "pools", type: "address[]", internalType: "address[]" },
          { name: "underlying", type: "address", internalType: "address" },
        ],
      },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        internalType: "struct MarketData[]",
        components: [
          { name: "acl", type: "address", internalType: "address" },
          {
            name: "contractsRegister",
            type: "address",
            internalType: "address",
          },
          { name: "treasury", type: "address", internalType: "address" },
          {
            name: "pool",
            type: "tuple",
            internalType: "struct PoolState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
              { name: "totalSupply", type: "uint256", internalType: "uint256" },
              {
                name: "poolQuotaKeeper",
                type: "address",
                internalType: "address",
              },
              {
                name: "interestRateModel",
                type: "address",
                internalType: "address",
              },
              { name: "underlying", type: "address", internalType: "address" },
              {
                name: "availableLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidity",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestIndex",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "baseInterestRate",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "dieselRate", type: "uint256", internalType: "uint256" },
              { name: "supplyRate", type: "uint256", internalType: "uint256" },
              { name: "withdrawFee", type: "uint256", internalType: "uint256" },
              {
                name: "totalBorrowed",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDebtLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "creditManagerDebtParams",
                type: "tuple[]",
                internalType: "struct CreditManagerDebtParams[]",
                components: [
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "borrowed",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "limit", type: "uint256", internalType: "uint256" },
                  {
                    name: "available",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "baseInterestIndexLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "expectedLiquidityLU",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "quotaRevenue",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "lastBaseInterestUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              {
                name: "lastQuotaRevenueUpdate",
                type: "uint40",
                internalType: "uint40",
              },
              { name: "isPaused", type: "bool", internalType: "bool" },
            ],
          },
          {
            name: "poolQuotaKeeper",
            type: "tuple",
            internalType: "struct PoolQuotaKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              { name: "rateKeeper", type: "address", internalType: "address" },
              {
                name: "quotas",
                type: "tuple[]",
                internalType: "struct QuotaTokenParams[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                  {
                    name: "cumulativeIndexLU",
                    type: "uint192",
                    internalType: "uint192",
                  },
                  {
                    name: "quotaIncreaseFee",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "totalQuoted",
                    type: "uint96",
                    internalType: "uint96",
                  },
                  { name: "limit", type: "uint96", internalType: "uint96" },
                  { name: "isActive", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManagers",
                type: "address[]",
                internalType: "address[]",
              },
              {
                name: "lastQuotaRateUpdate",
                type: "uint40",
                internalType: "uint40",
              },
            ],
          },
          {
            name: "interestRateModel",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "rateKeeper",
            type: "tuple",
            internalType: "struct RateKeeperState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "rates",
                type: "tuple[]",
                internalType: "struct Rate[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "rate", type: "uint16", internalType: "uint16" },
                ],
              },
            ],
          },
          {
            name: "priceOracleData",
            type: "tuple",
            internalType: "struct PriceOracleState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "priceFeedMapping",
                type: "tuple[]",
                internalType: "struct PriceFeedMapEntry[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "reserve", type: "bool", internalType: "bool" },
                  {
                    name: "priceFeed",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "stalenessPeriod",
                    type: "uint32",
                    internalType: "uint32",
                  },
                ],
              },
              {
                name: "priceFeedStructure",
                type: "tuple[]",
                internalType: "struct PriceFeedTreeNode[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "description",
                    type: "string",
                    internalType: "string",
                  },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                  { name: "skipCheck", type: "bool", internalType: "bool" },
                  { name: "updatable", type: "bool", internalType: "bool" },
                  {
                    name: "underlyingFeeds",
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "underlyingStalenessPeriods",
                    type: "uint32[]",
                    internalType: "uint32[]",
                  },
                  {
                    name: "answer",
                    type: "tuple",
                    internalType: "struct PriceFeedAnswer",
                    components: [
                      { name: "price", type: "int256", internalType: "int256" },
                      {
                        name: "updatedAt",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      { name: "success", type: "bool", internalType: "bool" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "lossPolicy",
            type: "tuple",
            internalType: "struct BaseState",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct TokenData[]",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "symbol", type: "string", internalType: "string" },
              { name: "name", type: "string", internalType: "string" },
              { name: "decimals", type: "uint8", internalType: "uint8" },
            ],
          },
          {
            name: "creditManagers",
            type: "tuple[]",
            internalType: "struct CreditSuiteData[]",
            components: [
              {
                name: "creditFacade",
                type: "tuple",
                internalType: "struct CreditFacadeState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "degenNFT",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "botList", type: "address", internalType: "address" },
                  { name: "expirable", type: "bool", internalType: "bool" },
                  {
                    name: "expirationDate",
                    type: "uint40",
                    internalType: "uint40",
                  },
                  {
                    name: "maxDebtPerBlockMultiplier",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  { name: "minDebt", type: "uint256", internalType: "uint256" },
                  { name: "maxDebt", type: "uint256", internalType: "uint256" },
                  {
                    name: "forbiddenTokenMask",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  { name: "isPaused", type: "bool", internalType: "bool" },
                ],
              },
              {
                name: "creditManager",
                type: "tuple",
                internalType: "struct CreditManagerState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  { name: "name", type: "string", internalType: "string" },
                  {
                    name: "accountFactory",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "underlying",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "pool", type: "address", internalType: "address" },
                  {
                    name: "creditFacade",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "creditConfigurator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maxEnabledTokens",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  {
                    name: "collateralTokens",
                    type: "tuple[]",
                    internalType: "struct CollateralToken[]",
                    components: [
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "liquidationThreshold",
                        type: "uint16",
                        internalType: "uint16",
                      },
                    ],
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
                    name: "liquidationDiscount",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "feeLiquidationExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                  {
                    name: "liquidationDiscountExpired",
                    type: "uint16",
                    internalType: "uint16",
                  },
                ],
              },
              {
                name: "creditConfigurator",
                type: "tuple",
                internalType: "struct BaseState",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                ],
              },
              {
                name: "adapters",
                type: "tuple[]",
                internalType: "struct AdapterState[]",
                components: [
                  {
                    name: "baseParams",
                    type: "tuple",
                    internalType: "struct BaseParams",
                    components: [
                      {
                        name: "addr",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "version",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "contractType",
                        type: "bytes32",
                        internalType: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        type: "bytes",
                        internalType: "bytes",
                      },
                    ],
                  },
                  {
                    name: "targetContract",
                    type: "address",
                    internalType: "address",
                  },
                ],
              },
            ],
          },
          { name: "configurator", type: "address", internalType: "address" },
          {
            name: "pausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "unpausableAdmins",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "emergencyLiquidators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "zappers",
            type: "tuple[]",
            internalType: "struct ZapperState[]",
            components: [
              {
                name: "baseParams",
                type: "tuple",
                internalType: "struct BaseParams",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "version", type: "uint256", internalType: "uint256" },
                  {
                    name: "contractType",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "tokenIn",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
              {
                name: "tokenOut",
                type: "tuple",
                internalType: "struct TokenData",
                components: [
                  { name: "addr", type: "address", internalType: "address" },
                  { name: "symbol", type: "string", internalType: "string" },
                  { name: "name", type: "string", internalType: "string" },
                  { name: "decimals", type: "uint8", internalType: "uint8" },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUpdatablePriceFeeds",
    inputs: [
      {
        name: "filter",
        type: "tuple",
        internalType: "struct MarketFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          { name: "pools", type: "address[]", internalType: "address[]" },
          { name: "underlying", type: "address", internalType: "address" },
        ],
      },
    ],
    outputs: [
      {
        name: "updatablePriceFeeds",
        type: "tuple[]",
        internalType: "struct BaseParams[]",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "version", type: "uint256", internalType: "uint256" },
          { name: "contractType", type: "bytes32", internalType: "bytes32" },
          { name: "serializedParams", type: "bytes", internalType: "bytes" },
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceFeedCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceFeedCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceFeeds",
    inputs: [
      { name: "priceOracle", type: "address", internalType: "address" },
      { name: "tokens", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "priceFeedMap",
        type: "tuple[]",
        internalType: "struct PriceFeedMapEntry[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "reserve", type: "bool", internalType: "bool" },
          { name: "priceFeed", type: "address", internalType: "address" },
          { name: "stalenessPeriod", type: "uint32", internalType: "uint32" },
        ],
      },
      {
        name: "priceFeedTree",
        type: "tuple[]",
        internalType: "struct PriceFeedTreeNode[]",
        components: [
          {
            name: "baseParams",
            type: "tuple",
            internalType: "struct BaseParams",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "version", type: "uint256", internalType: "uint256" },
              {
                name: "contractType",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "serializedParams",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          { name: "description", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
          { name: "skipCheck", type: "bool", internalType: "bool" },
          { name: "updatable", type: "bool", internalType: "bool" },
          {
            name: "underlyingFeeds",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            type: "uint32[]",
            internalType: "uint32[]",
          },
          {
            name: "answer",
            type: "tuple",
            internalType: "struct PriceFeedAnswer",
            components: [
              { name: "price", type: "int256", internalType: "int256" },
              { name: "updatedAt", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceFeeds",
    inputs: [{ name: "priceOracle", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "priceFeedMap",
        type: "tuple[]",
        internalType: "struct PriceFeedMapEntry[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "reserve", type: "bool", internalType: "bool" },
          { name: "priceFeed", type: "address", internalType: "address" },
          { name: "stalenessPeriod", type: "uint32", internalType: "uint32" },
        ],
      },
      {
        name: "priceFeedTree",
        type: "tuple[]",
        internalType: "struct PriceFeedTreeNode[]",
        components: [
          {
            name: "baseParams",
            type: "tuple",
            internalType: "struct BaseParams",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "version", type: "uint256", internalType: "uint256" },
              {
                name: "contractType",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "serializedParams",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          { name: "description", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
          { name: "skipCheck", type: "bool", internalType: "bool" },
          { name: "updatable", type: "bool", internalType: "bool" },
          {
            name: "underlyingFeeds",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            type: "uint32[]",
            internalType: "uint32[]",
          },
          {
            name: "answer",
            type: "tuple",
            internalType: "struct PriceFeedAnswer",
            components: [
              { name: "price", type: "int256", internalType: "int256" },
              { name: "updatedAt", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "loadPriceFeedTree",
    inputs: [
      { name: "priceFeeds", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "priceFeedTree",
        type: "tuple[]",
        internalType: "struct PriceFeedTreeNode[]",
        components: [
          {
            name: "baseParams",
            type: "tuple",
            internalType: "struct BaseParams",
            components: [
              { name: "addr", type: "address", internalType: "address" },
              { name: "version", type: "uint256", internalType: "uint256" },
              {
                name: "contractType",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "serializedParams",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          { name: "description", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
          { name: "skipCheck", type: "bool", internalType: "bool" },
          { name: "updatable", type: "bool", internalType: "bool" },
          {
            name: "underlyingFeeds",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            type: "uint32[]",
            internalType: "uint32[]",
          },
          {
            name: "answer",
            type: "tuple",
            internalType: "struct PriceFeedAnswer",
            components: [
              { name: "price", type: "int256", internalType: "int256" },
              { name: "updatedAt", type: "uint256", internalType: "uint256" },
              { name: "success", type: "bool", internalType: "bool" },
            ],
          },
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
  {
    type: "event",
    name: "SetSerializer",
    inputs: [
      {
        name: "contractType",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "serializer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITokenCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iTokenCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenInfo",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct TokenData",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "name", type: "string", internalType: "string" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRewardsCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRewardCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRewards",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "rewards",
        type: "tuple[]",
        internalType: "struct RewardInfo[]",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "rewardToken", type: "address", internalType: "address" },
          {
            name: "stakedPhantomToken",
            type: "address",
            internalType: "address",
          },
          { name: "adapter", type: "address", internalType: "address" },
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
