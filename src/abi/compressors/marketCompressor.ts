export const marketCompressorAbi = [
  {
    type: "constructor",
    inputs: [
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
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInterestRateModelState",
    inputs: [
      { name: "interestRateModel", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLossPolicyState",
    inputs: [{ name: "lossPolicy", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
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
    ],
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
              { name: "quotaKeeper", type: "address", internalType: "address" },
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
            name: "quotaKeeper",
            type: "tuple",
            internalType: "struct QuotaKeeperState",
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
            name: "priceOracle",
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
                name: "priceFeedMap",
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
                name: "priceFeedTree",
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
                    name: "forbiddenTokensMask",
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
                name: "accountFactory",
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
              { name: "quotaKeeper", type: "address", internalType: "address" },
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
            name: "quotaKeeper",
            type: "tuple",
            internalType: "struct QuotaKeeperState",
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
            name: "priceOracle",
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
                name: "priceFeedMap",
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
                name: "priceFeedTree",
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
                    name: "forbiddenTokensMask",
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
                name: "accountFactory",
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
              { name: "quotaKeeper", type: "address", internalType: "address" },
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
            name: "quotaKeeper",
            type: "tuple",
            internalType: "struct QuotaKeeperState",
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
            name: "priceOracle",
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
                name: "priceFeedMap",
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
                name: "priceFeedTree",
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
                    name: "forbiddenTokensMask",
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
                name: "accountFactory",
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
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolState",
    inputs: [{ name: "pool", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "result",
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
          { name: "quotaKeeper", type: "address", internalType: "address" },
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
          { name: "totalBorrowed", type: "uint256", internalType: "uint256" },
          { name: "totalDebtLimit", type: "uint256", internalType: "uint256" },
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
              { name: "borrowed", type: "uint256", internalType: "uint256" },
              { name: "limit", type: "uint256", internalType: "uint256" },
              { name: "available", type: "uint256", internalType: "uint256" },
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
          { name: "quotaRevenue", type: "uint256", internalType: "uint256" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getQuotaKeeperState",
    inputs: [{ name: "quotaKeeper", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct QuotaKeeperState",
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
              { name: "totalQuoted", type: "uint96", internalType: "uint96" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRateKeeperState",
    inputs: [{ name: "rateKeeper", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "result",
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
