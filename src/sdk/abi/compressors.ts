/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddMarketConfigurator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemoveMarketConfigurator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetAddress",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3_1
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3_1Abi = [
  {
    type: "function",
    inputs: [
      { name: "_marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "addMarketConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "string", type: "string" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "addresses",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "string", type: "string" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddressOrRevert",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddressOrRevert",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAllSavedContracts",
    outputs: [
      {
        name: "",
        internalType: "struct ContractValue[]",
        type: "tuple[]",
        components: [
          { name: "key", internalType: "string", type: "string" },
          { name: "value", internalType: "address", type: "address" },
          { name: "version", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_key", internalType: "bytes32", type: "bytes32" }],
    name: "getLatestAddressOrRevert",
    outputs: [{ name: "result", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "string", type: "string" }],
    name: "getLatestAddressOrRevert",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "riskCurator", internalType: "address", type: "address" }],
    name: "isMarketConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "marketConfiguratorByCreditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "marketConfiguratorByPool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "marketConfigurators",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "registerCreditManager",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "registerPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "removeMarketConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "string", type: "string" },
      { name: "addr", internalType: "address", type: "address" },
      { name: "saveVersion", internalType: "bool", type: "bool" },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "addr", internalType: "address", type: "address" },
      { name: "saveVersion", internalType: "bool", type: "bool" },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddMarketConfigurator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemoveMarketConfigurator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetAddress",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditAccountCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditAccountCompressorAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "countCreditAccounts",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "cmFilter",
        internalType: "struct MarketFilter",
        type: "tuple",
        components: [
          { name: "curators", internalType: "address[]", type: "address[]" },
          { name: "pools", internalType: "address[]", type: "address[]" },
          { name: "underlying", internalType: "address", type: "address" },
        ],
      },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "countCreditAccounts",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getCreditAccountData",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData",
        type: "tuple",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "owner", internalType: "address", type: "address" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "debt", internalType: "uint256", type: "uint256" },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "healthFactor", internalType: "uint16", type: "uint16" },
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "tokens",
            internalType: "struct TokenInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "mask", internalType: "uint256", type: "uint256" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "cmFilter",
        internalType: "struct MarketFilter",
        type: "tuple",
        components: [
          { name: "curators", internalType: "address[]", type: "address[]" },
          { name: "pools", internalType: "address[]", type: "address[]" },
          { name: "underlying", internalType: "address", type: "address" },
        ],
      },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
      { name: "offset", internalType: "uint256", type: "uint256" },
    ],
    name: "getCreditAccounts",
    outputs: [
      {
        name: "data",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "owner", internalType: "address", type: "address" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "debt", internalType: "uint256", type: "uint256" },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "healthFactor", internalType: "uint16", type: "uint16" },
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "tokens",
            internalType: "struct TokenInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "mask", internalType: "uint256", type: "uint256" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
      { name: "offset", internalType: "uint256", type: "uint256" },
    ],
    name: "getCreditAccounts",
    outputs: [
      {
        name: "data",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "owner", internalType: "address", type: "address" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "debt", internalType: "uint256", type: "uint256" },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "healthFactor", internalType: "uint16", type: "uint16" },
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "tokens",
            internalType: "struct TokenInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "mask", internalType: "uint256", type: "uint256" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
      { name: "offset", internalType: "uint256", type: "uint256" },
      { name: "limit", internalType: "uint256", type: "uint256" },
    ],
    name: "getCreditAccounts",
    outputs: [
      {
        name: "data",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "owner", internalType: "address", type: "address" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "debt", internalType: "uint256", type: "uint256" },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "healthFactor", internalType: "uint16", type: "uint16" },
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "tokens",
            internalType: "struct TokenInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "mask", internalType: "uint256", type: "uint256" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "cmFilter",
        internalType: "struct MarketFilter",
        type: "tuple",
        components: [
          { name: "curators", internalType: "address[]", type: "address[]" },
          { name: "pools", internalType: "address[]", type: "address[]" },
          { name: "underlying", internalType: "address", type: "address" },
        ],
      },
      {
        name: "caFilter",
        internalType: "struct CreditAccountFilter",
        type: "tuple",
        components: [
          { name: "owner", internalType: "address", type: "address" },
          { name: "includeZeroDebt", internalType: "bool", type: "bool" },
          { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "maxHealthFactor", internalType: "uint16", type: "uint16" },
          { name: "reverting", internalType: "bool", type: "bool" },
        ],
      },
      { name: "offset", internalType: "uint256", type: "uint256" },
      { name: "limit", internalType: "uint256", type: "uint256" },
    ],
    name: "getCreditAccounts",
    outputs: [
      {
        name: "data",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "owner", internalType: "address", type: "address" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "debt", internalType: "uint256", type: "uint256" },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "healthFactor", internalType: "uint16", type: "uint16" },
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "tokens",
            internalType: "struct TokenInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "mask", internalType: "uint256", type: "uint256" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      { name: "nextOffset", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMarketCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMarketCompressorAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "getMarketData",
    outputs: [
      {
        name: "result",
        internalType: "struct MarketData",
        type: "tuple",
        components: [
          {
            name: "baseParams",
            internalType: "struct BaseParams",
            type: "tuple",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "version", internalType: "uint256", type: "uint256" },
              {
                name: "contractType",
                internalType: "bytes32",
                type: "bytes32",
              },
              {
                name: "serializedParams",
                internalType: "bytes",
                type: "bytes",
              },
            ],
          },
          { name: "owner", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "pool",
            internalType: "struct PoolState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "symbol", internalType: "string", type: "string" },
              { name: "name", internalType: "string", type: "string" },
              { name: "decimals", internalType: "uint8", type: "uint8" },
              { name: "totalSupply", internalType: "uint256", type: "uint256" },
              {
                name: "poolQuotaKeeper",
                internalType: "address",
                type: "address",
              },
              {
                name: "interestRateModel",
                internalType: "address",
                type: "address",
              },
              { name: "treasury", internalType: "address", type: "address" },
              { name: "controller", internalType: "address", type: "address" },
              { name: "underlying", internalType: "address", type: "address" },
              {
                name: "availableLiquidity",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "expectedLiquidity",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "baseInterestIndex",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "baseInterestRate",
                internalType: "uint256",
                type: "uint256",
              },
              { name: "dieselRate", internalType: "uint256", type: "uint256" },
              {
                name: "totalBorrowed",
                internalType: "uint256",
                type: "uint256",
              },
              { name: "totalAssets", internalType: "uint256", type: "uint256" },
              { name: "supplyRate", internalType: "uint256", type: "uint256" },
              { name: "withdrawFee", internalType: "uint256", type: "uint256" },
              {
                name: "totalDebtLimit",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "creditManagerDebtParams",
                internalType: "struct CreditManagerDebtParams[]",
                type: "tuple[]",
                components: [
                  {
                    name: "creditManager",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "borrowed",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "limit", internalType: "uint256", type: "uint256" },
                ],
              },
              {
                name: "baseInterestIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "expectedLiquidityLU",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "quotaRevenue",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "lastBaseInterestUpdate",
                internalType: "uint40",
                type: "uint40",
              },
              {
                name: "lastQuotaRevenueUpdate",
                internalType: "uint40",
                type: "uint40",
              },
              { name: "isPaused", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "poolQuotaKeeper",
            internalType: "struct PoolQuotaKeeperState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "rateKeeper", internalType: "address", type: "address" },
              {
                name: "quotas",
                internalType: "struct QuotaTokenParams[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "rate", internalType: "uint16", type: "uint16" },
                  {
                    name: "cumulativeIndexLU",
                    internalType: "uint192",
                    type: "uint192",
                  },
                  {
                    name: "quotaIncreaseFee",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "totalQuoted",
                    internalType: "uint96",
                    type: "uint96",
                  },
                  { name: "limit", internalType: "uint96", type: "uint96" },
                  { name: "isActive", internalType: "bool", type: "bool" },
                ],
              },
              {
                name: "creditManagers",
                internalType: "address[]",
                type: "address[]",
              },
              {
                name: "lastQuotaRateUpdate",
                internalType: "uint40",
                type: "uint40",
              },
            ],
          },
          {
            name: "interestRateModel",
            internalType: "struct BaseState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "rateKeeper",
            internalType: "struct RateKeeperState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              {
                name: "rates",
                internalType: "struct Rate[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "rate", internalType: "uint16", type: "uint16" },
                ],
              },
            ],
          },
          {
            name: "priceOracleData",
            internalType: "struct PriceOracleState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              {
                name: "priceFeedMapping",
                internalType: "struct PriceFeedMapEntry[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "reserve", internalType: "bool", type: "bool" },
                  {
                    name: "priceFeed",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "stalenessPeriod",
                    internalType: "uint32",
                    type: "uint32",
                  },
                ],
              },
              {
                name: "priceFeedStructure",
                internalType: "struct PriceFeedTreeNode[]",
                type: "tuple[]",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  { name: "decimals", internalType: "uint8", type: "uint8" },
                  { name: "skipCheck", internalType: "bool", type: "bool" },
                  { name: "updatable", internalType: "bool", type: "bool" },
                  {
                    name: "underlyingFeeds",
                    internalType: "address[]",
                    type: "address[]",
                  },
                  {
                    name: "underlyingStalenessPeriods",
                    internalType: "uint32[]",
                    type: "uint32[]",
                  },
                  {
                    name: "answer",
                    internalType: "struct PriceFeedAnswer",
                    type: "tuple",
                    components: [
                      { name: "price", internalType: "int256", type: "int256" },
                      {
                        name: "updatedAt",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      { name: "success", internalType: "bool", type: "bool" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "tokens",
            internalType: "struct TokenData[]",
            type: "tuple[]",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "symbol", internalType: "string", type: "string" },
              { name: "name", internalType: "string", type: "string" },
              { name: "decimals", internalType: "uint8", type: "uint8" },
            ],
          },
          {
            name: "creditManagers",
            internalType: "struct CreditManagerData[]",
            type: "tuple[]",
            components: [
              {
                name: "creditFacade",
                internalType: "struct CreditFacadeState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  {
                    name: "maxQuotaMultiplier",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "creditManager",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "treasury",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "expirable", internalType: "bool", type: "bool" },
                  {
                    name: "degenNFT",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "expirationDate",
                    internalType: "uint40",
                    type: "uint40",
                  },
                  {
                    name: "maxDebtPerBlockMultiplier",
                    internalType: "uint8",
                    type: "uint8",
                  },
                  { name: "botList", internalType: "address", type: "address" },
                  { name: "minDebt", internalType: "uint256", type: "uint256" },
                  { name: "maxDebt", internalType: "uint256", type: "uint256" },
                  {
                    name: "forbiddenTokenMask",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lossLiquidator",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "isPaused", internalType: "bool", type: "bool" },
                ],
              },
              {
                name: "creditManager",
                internalType: "struct CreditManagerState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  { name: "name", internalType: "string", type: "string" },
                  {
                    name: "accountFactory",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "underlying",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "pool", internalType: "address", type: "address" },
                  {
                    name: "creditFacade",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "creditConfigurator",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "priceOracle",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "maxEnabledTokens",
                    internalType: "uint8",
                    type: "uint8",
                  },
                  {
                    name: "collateralTokens",
                    internalType: "address[]",
                    type: "address[]",
                  },
                  {
                    name: "liquidationThresholds",
                    internalType: "uint16[]",
                    type: "uint16[]",
                  },
                  {
                    name: "feeInterest",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "feeLiquidation",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "liquidationDiscount",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "feeLiquidationExpired",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "liquidationDiscountExpired",
                    internalType: "uint16",
                    type: "uint16",
                  },
                ],
              },
              {
                name: "creditConfigurator",
                internalType: "struct BaseState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                ],
              },
              {
                name: "adapters",
                internalType: "struct ContractAdapter[]",
                type: "tuple[]",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  {
                    name: "targetContract",
                    internalType: "address",
                    type: "address",
                  },
                ],
              },
              { name: "totalDebt", internalType: "uint256", type: "uint256" },
              {
                name: "totalDebtLimit",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "pausableAdmins",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "unpausableAdmins",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "emergencyLiquidators",
            internalType: "address[]",
            type: "address[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "filter",
        internalType: "struct MarketFilter",
        type: "tuple",
        components: [
          { name: "curators", internalType: "address[]", type: "address[]" },
          { name: "pools", internalType: "address[]", type: "address[]" },
          { name: "underlying", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "getMarkets",
    outputs: [
      {
        name: "result",
        internalType: "struct MarketData[]",
        type: "tuple[]",
        components: [
          {
            name: "baseParams",
            internalType: "struct BaseParams",
            type: "tuple",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "version", internalType: "uint256", type: "uint256" },
              {
                name: "contractType",
                internalType: "bytes32",
                type: "bytes32",
              },
              {
                name: "serializedParams",
                internalType: "bytes",
                type: "bytes",
              },
            ],
          },
          { name: "owner", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "pool",
            internalType: "struct PoolState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "symbol", internalType: "string", type: "string" },
              { name: "name", internalType: "string", type: "string" },
              { name: "decimals", internalType: "uint8", type: "uint8" },
              { name: "totalSupply", internalType: "uint256", type: "uint256" },
              {
                name: "poolQuotaKeeper",
                internalType: "address",
                type: "address",
              },
              {
                name: "interestRateModel",
                internalType: "address",
                type: "address",
              },
              { name: "treasury", internalType: "address", type: "address" },
              { name: "controller", internalType: "address", type: "address" },
              { name: "underlying", internalType: "address", type: "address" },
              {
                name: "availableLiquidity",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "expectedLiquidity",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "baseInterestIndex",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "baseInterestRate",
                internalType: "uint256",
                type: "uint256",
              },
              { name: "dieselRate", internalType: "uint256", type: "uint256" },
              {
                name: "totalBorrowed",
                internalType: "uint256",
                type: "uint256",
              },
              { name: "totalAssets", internalType: "uint256", type: "uint256" },
              { name: "supplyRate", internalType: "uint256", type: "uint256" },
              { name: "withdrawFee", internalType: "uint256", type: "uint256" },
              {
                name: "totalDebtLimit",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "creditManagerDebtParams",
                internalType: "struct CreditManagerDebtParams[]",
                type: "tuple[]",
                components: [
                  {
                    name: "creditManager",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "borrowed",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "limit", internalType: "uint256", type: "uint256" },
                ],
              },
              {
                name: "baseInterestIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "expectedLiquidityLU",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "quotaRevenue",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "lastBaseInterestUpdate",
                internalType: "uint40",
                type: "uint40",
              },
              {
                name: "lastQuotaRevenueUpdate",
                internalType: "uint40",
                type: "uint40",
              },
              { name: "isPaused", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "poolQuotaKeeper",
            internalType: "struct PoolQuotaKeeperState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "rateKeeper", internalType: "address", type: "address" },
              {
                name: "quotas",
                internalType: "struct QuotaTokenParams[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "rate", internalType: "uint16", type: "uint16" },
                  {
                    name: "cumulativeIndexLU",
                    internalType: "uint192",
                    type: "uint192",
                  },
                  {
                    name: "quotaIncreaseFee",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "totalQuoted",
                    internalType: "uint96",
                    type: "uint96",
                  },
                  { name: "limit", internalType: "uint96", type: "uint96" },
                  { name: "isActive", internalType: "bool", type: "bool" },
                ],
              },
              {
                name: "creditManagers",
                internalType: "address[]",
                type: "address[]",
              },
              {
                name: "lastQuotaRateUpdate",
                internalType: "uint40",
                type: "uint40",
              },
            ],
          },
          {
            name: "interestRateModel",
            internalType: "struct BaseState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
            ],
          },
          {
            name: "rateKeeper",
            internalType: "struct RateKeeperState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              {
                name: "rates",
                internalType: "struct Rate[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "rate", internalType: "uint16", type: "uint16" },
                ],
              },
            ],
          },
          {
            name: "priceOracleData",
            internalType: "struct PriceOracleState",
            type: "tuple",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              {
                name: "priceFeedMapping",
                internalType: "struct PriceFeedMapEntry[]",
                type: "tuple[]",
                components: [
                  { name: "token", internalType: "address", type: "address" },
                  { name: "reserve", internalType: "bool", type: "bool" },
                  {
                    name: "priceFeed",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "stalenessPeriod",
                    internalType: "uint32",
                    type: "uint32",
                  },
                ],
              },
              {
                name: "priceFeedStructure",
                internalType: "struct PriceFeedTreeNode[]",
                type: "tuple[]",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  { name: "decimals", internalType: "uint8", type: "uint8" },
                  { name: "skipCheck", internalType: "bool", type: "bool" },
                  { name: "updatable", internalType: "bool", type: "bool" },
                  {
                    name: "underlyingFeeds",
                    internalType: "address[]",
                    type: "address[]",
                  },
                  {
                    name: "underlyingStalenessPeriods",
                    internalType: "uint32[]",
                    type: "uint32[]",
                  },
                  {
                    name: "answer",
                    internalType: "struct PriceFeedAnswer",
                    type: "tuple",
                    components: [
                      { name: "price", internalType: "int256", type: "int256" },
                      {
                        name: "updatedAt",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      { name: "success", internalType: "bool", type: "bool" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "tokens",
            internalType: "struct TokenData[]",
            type: "tuple[]",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "symbol", internalType: "string", type: "string" },
              { name: "name", internalType: "string", type: "string" },
              { name: "decimals", internalType: "uint8", type: "uint8" },
            ],
          },
          {
            name: "creditManagers",
            internalType: "struct CreditManagerData[]",
            type: "tuple[]",
            components: [
              {
                name: "creditFacade",
                internalType: "struct CreditFacadeState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  {
                    name: "maxQuotaMultiplier",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "creditManager",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "treasury",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "expirable", internalType: "bool", type: "bool" },
                  {
                    name: "degenNFT",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "expirationDate",
                    internalType: "uint40",
                    type: "uint40",
                  },
                  {
                    name: "maxDebtPerBlockMultiplier",
                    internalType: "uint8",
                    type: "uint8",
                  },
                  { name: "botList", internalType: "address", type: "address" },
                  { name: "minDebt", internalType: "uint256", type: "uint256" },
                  { name: "maxDebt", internalType: "uint256", type: "uint256" },
                  {
                    name: "forbiddenTokenMask",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lossLiquidator",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "isPaused", internalType: "bool", type: "bool" },
                ],
              },
              {
                name: "creditManager",
                internalType: "struct CreditManagerState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  { name: "name", internalType: "string", type: "string" },
                  {
                    name: "accountFactory",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "underlying",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "pool", internalType: "address", type: "address" },
                  {
                    name: "creditFacade",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "creditConfigurator",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "priceOracle",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "maxEnabledTokens",
                    internalType: "uint8",
                    type: "uint8",
                  },
                  {
                    name: "collateralTokens",
                    internalType: "address[]",
                    type: "address[]",
                  },
                  {
                    name: "liquidationThresholds",
                    internalType: "uint16[]",
                    type: "uint16[]",
                  },
                  {
                    name: "feeInterest",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "feeLiquidation",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "liquidationDiscount",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "feeLiquidationExpired",
                    internalType: "uint16",
                    type: "uint16",
                  },
                  {
                    name: "liquidationDiscountExpired",
                    internalType: "uint16",
                    type: "uint16",
                  },
                ],
              },
              {
                name: "creditConfigurator",
                internalType: "struct BaseState",
                type: "tuple",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                ],
              },
              {
                name: "adapters",
                internalType: "struct ContractAdapter[]",
                type: "tuple[]",
                components: [
                  {
                    name: "baseParams",
                    internalType: "struct BaseParams",
                    type: "tuple",
                    components: [
                      {
                        name: "addr",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "version",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "contractType",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                      {
                        name: "serializedParams",
                        internalType: "bytes",
                        type: "bytes",
                      },
                    ],
                  },
                  {
                    name: "targetContract",
                    internalType: "address",
                    type: "address",
                  },
                ],
              },
              { name: "totalDebt", internalType: "uint256", type: "uint256" },
              {
                name: "totalDebtLimit",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              {
                name: "baseParams",
                internalType: "struct BaseParams",
                type: "tuple",
                components: [
                  { name: "addr", internalType: "address", type: "address" },
                  { name: "version", internalType: "uint256", type: "uint256" },
                  {
                    name: "contractType",
                    internalType: "bytes32",
                    type: "bytes32",
                  },
                  {
                    name: "serializedParams",
                    internalType: "bytes",
                    type: "bytes",
                  },
                ],
              },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "pausableAdmins",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "unpausableAdmins",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "emergencyLiquidators",
            internalType: "address[]",
            type: "address[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceFeedCompressor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceFeedCompressorAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "priceOracle", internalType: "address", type: "address" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
    ],
    name: "getPriceFeeds",
    outputs: [
      {
        name: "priceFeedMap",
        internalType: "struct PriceFeedMapEntry[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
        ],
      },
      {
        name: "priceFeedTree",
        internalType: "struct PriceFeedTreeNode[]",
        type: "tuple[]",
        components: [
          {
            name: "baseParams",
            internalType: "struct BaseParams",
            type: "tuple",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "version", internalType: "uint256", type: "uint256" },
              {
                name: "contractType",
                internalType: "bytes32",
                type: "bytes32",
              },
              {
                name: "serializedParams",
                internalType: "bytes",
                type: "bytes",
              },
            ],
          },
          { name: "decimals", internalType: "uint8", type: "uint8" },
          { name: "skipCheck", internalType: "bool", type: "bool" },
          { name: "updatable", internalType: "bool", type: "bool" },
          {
            name: "underlyingFeeds",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            internalType: "uint32[]",
            type: "uint32[]",
          },
          {
            name: "answer",
            internalType: "struct PriceFeedAnswer",
            type: "tuple",
            components: [
              { name: "price", internalType: "int256", type: "int256" },
              { name: "updatedAt", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "priceOracle", internalType: "address", type: "address" }],
    name: "getPriceFeeds",
    outputs: [
      {
        name: "priceFeedMap",
        internalType: "struct PriceFeedMapEntry[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
        ],
      },
      {
        name: "priceFeedTree",
        internalType: "struct PriceFeedTreeNode[]",
        type: "tuple[]",
        components: [
          {
            name: "baseParams",
            internalType: "struct BaseParams",
            type: "tuple",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "version", internalType: "uint256", type: "uint256" },
              {
                name: "contractType",
                internalType: "bytes32",
                type: "bytes32",
              },
              {
                name: "serializedParams",
                internalType: "bytes",
                type: "bytes",
              },
            ],
          },
          { name: "decimals", internalType: "uint8", type: "uint8" },
          { name: "skipCheck", internalType: "bool", type: "bool" },
          { name: "updatable", internalType: "bool", type: "bool" },
          {
            name: "underlyingFeeds",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            internalType: "uint32[]",
            type: "uint32[]",
          },
          {
            name: "answer",
            internalType: "struct PriceFeedAnswer",
            type: "tuple",
            components: [
              { name: "price", internalType: "int256", type: "int256" },
              { name: "updatedAt", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "priceFeeds", internalType: "address[]", type: "address[]" },
    ],
    name: "loadPriceFeedTree",
    outputs: [
      {
        name: "priceFeedTree",
        internalType: "struct PriceFeedTreeNode[]",
        type: "tuple[]",
        components: [
          {
            name: "baseParams",
            internalType: "struct BaseParams",
            type: "tuple",
            components: [
              { name: "addr", internalType: "address", type: "address" },
              { name: "version", internalType: "uint256", type: "uint256" },
              {
                name: "contractType",
                internalType: "bytes32",
                type: "bytes32",
              },
              {
                name: "serializedParams",
                internalType: "bytes",
                type: "bytes",
              },
            ],
          },
          { name: "decimals", internalType: "uint8", type: "uint8" },
          { name: "skipCheck", internalType: "bool", type: "bool" },
          { name: "updatable", internalType: "bool", type: "bool" },
          {
            name: "underlyingFeeds",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "underlyingStalenessPeriods",
            internalType: "uint32[]",
            type: "uint32[]",
          },
          {
            name: "answer",
            internalType: "struct PriceFeedAnswer",
            type: "tuple",
            components: [
              { name: "price", internalType: "int256", type: "int256" },
              { name: "updatedAt", internalType: "uint256", type: "uint256" },
              { name: "success", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
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
        name: "contractType",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "serializer",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetSerializer",
  },
] as const;
