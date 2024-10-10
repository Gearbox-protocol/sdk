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

export const iAdapterCompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContractAdapters",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        internalType: "struct ContractAdapter[]",
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
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketData",
    inputs: [
      {
        name: "pool",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct MarketData",
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
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
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
                name: "symbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "totalSupply",
                type: "uint256",
                internalType: "uint256",
              },
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
              {
                name: "treasury",
                type: "address",
                internalType: "address",
              },
              {
                name: "controller",
                type: "address",
                internalType: "address",
              },
              {
                name: "underlying",
                type: "address",
                internalType: "address",
              },
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
              {
                name: "dieselRate",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalBorrowed",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "supplyRate",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "withdrawFee",
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
                  {
                    name: "limit",
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
              {
                name: "isPaused",
                type: "bool",
                internalType: "bool",
              },
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
                name: "rateKeeper",
                type: "address",
                internalType: "address",
              },
              {
                name: "quotas",
                type: "tuple[]",
                internalType: "struct QuotaTokenParams[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "rate",
                    type: "uint16",
                    internalType: "uint16",
                  },
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
                  {
                    name: "limit",
                    type: "uint96",
                    internalType: "uint96",
                  },
                  {
                    name: "isActive",
                    type: "bool",
                    internalType: "bool",
                  },
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
            name: "rateKeeper",
            type: "tuple",
            internalType: "struct RateKeeperState",
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
                name: "rates",
                type: "tuple[]",
                internalType: "struct Rate[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "rate",
                    type: "uint16",
                    internalType: "uint16",
                  },
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
                name: "priceFeedMapping",
                type: "tuple[]",
                internalType: "struct PriceFeedMapEntry[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "reserve",
                    type: "bool",
                    internalType: "bool",
                  },
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
                    name: "decimals",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  {
                    name: "skipCheck",
                    type: "bool",
                    internalType: "bool",
                  },
                  {
                    name: "updatable",
                    type: "bool",
                    internalType: "bool",
                  },
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
                      {
                        name: "price",
                        type: "int256",
                        internalType: "int256",
                      },
                      {
                        name: "updatedAt",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "success",
                        type: "bool",
                        internalType: "bool",
                      },
                    ],
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
              {
                name: "addr",
                type: "address",
                internalType: "address",
              },
              {
                name: "symbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
            ],
          },
          {
            name: "creditManagers",
            type: "tuple[]",
            internalType: "struct CreditManagerData[]",
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
                    name: "maxQuotaMultiplier",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "treasury",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "expirable",
                    type: "bool",
                    internalType: "bool",
                  },
                  {
                    name: "degenNFT",
                    type: "address",
                    internalType: "address",
                  },
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
                  {
                    name: "botList",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "minDebt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "maxDebt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "forbiddenTokenMask",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lossLiquidator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "isPaused",
                    type: "bool",
                    internalType: "bool",
                  },
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
                  {
                    name: "name",
                    type: "string",
                    internalType: "string",
                  },
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
                  {
                    name: "pool",
                    type: "address",
                    internalType: "address",
                  },
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
                    name: "priceOracle",
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
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "liquidationThresholds",
                    type: "uint16[]",
                    internalType: "uint16[]",
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
                name: "totalDebt",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDebtLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "availableToBorrow",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "zappers",
            type: "tuple[]",
            internalType: "struct ZapperInfo[]",
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
                name: "tokenIn",
                type: "address",
                internalType: "address",
              },
              {
                name: "tokenOut",
                type: "address",
                internalType: "address",
              },
            ],
          },
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
            name: "curators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "pools",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "underlying",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        internalType: "struct MarketData[]",
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
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
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
                name: "symbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "totalSupply",
                type: "uint256",
                internalType: "uint256",
              },
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
              {
                name: "treasury",
                type: "address",
                internalType: "address",
              },
              {
                name: "controller",
                type: "address",
                internalType: "address",
              },
              {
                name: "underlying",
                type: "address",
                internalType: "address",
              },
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
              {
                name: "dieselRate",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalBorrowed",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "supplyRate",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "withdrawFee",
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
                  {
                    name: "limit",
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
              {
                name: "isPaused",
                type: "bool",
                internalType: "bool",
              },
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
                name: "rateKeeper",
                type: "address",
                internalType: "address",
              },
              {
                name: "quotas",
                type: "tuple[]",
                internalType: "struct QuotaTokenParams[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "rate",
                    type: "uint16",
                    internalType: "uint16",
                  },
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
                  {
                    name: "limit",
                    type: "uint96",
                    internalType: "uint96",
                  },
                  {
                    name: "isActive",
                    type: "bool",
                    internalType: "bool",
                  },
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
            name: "rateKeeper",
            type: "tuple",
            internalType: "struct RateKeeperState",
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
                name: "rates",
                type: "tuple[]",
                internalType: "struct Rate[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "rate",
                    type: "uint16",
                    internalType: "uint16",
                  },
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
                name: "priceFeedMapping",
                type: "tuple[]",
                internalType: "struct PriceFeedMapEntry[]",
                components: [
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "reserve",
                    type: "bool",
                    internalType: "bool",
                  },
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
                    name: "decimals",
                    type: "uint8",
                    internalType: "uint8",
                  },
                  {
                    name: "skipCheck",
                    type: "bool",
                    internalType: "bool",
                  },
                  {
                    name: "updatable",
                    type: "bool",
                    internalType: "bool",
                  },
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
                      {
                        name: "price",
                        type: "int256",
                        internalType: "int256",
                      },
                      {
                        name: "updatedAt",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "success",
                        type: "bool",
                        internalType: "bool",
                      },
                    ],
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
              {
                name: "addr",
                type: "address",
                internalType: "address",
              },
              {
                name: "symbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "name",
                type: "string",
                internalType: "string",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
            ],
          },
          {
            name: "creditManagers",
            type: "tuple[]",
            internalType: "struct CreditManagerData[]",
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
                    name: "maxQuotaMultiplier",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "creditManager",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "treasury",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "expirable",
                    type: "bool",
                    internalType: "bool",
                  },
                  {
                    name: "degenNFT",
                    type: "address",
                    internalType: "address",
                  },
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
                  {
                    name: "botList",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "minDebt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "maxDebt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "forbiddenTokenMask",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lossLiquidator",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "isPaused",
                    type: "bool",
                    internalType: "bool",
                  },
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
                  {
                    name: "name",
                    type: "string",
                    internalType: "string",
                  },
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
                  {
                    name: "pool",
                    type: "address",
                    internalType: "address",
                  },
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
                    name: "priceOracle",
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
                    type: "address[]",
                    internalType: "address[]",
                  },
                  {
                    name: "liquidationThresholds",
                    type: "uint16[]",
                    internalType: "uint16[]",
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
                name: "totalDebt",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDebtLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "availableToBorrow",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "zappers",
            type: "tuple[]",
            internalType: "struct ZapperInfo[]",
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
                name: "tokenIn",
                type: "address",
                internalType: "address",
              },
              {
                name: "tokenOut",
                type: "address",
                internalType: "address",
              },
            ],
          },
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
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
