export const creditSuiteCompressorAbi = [
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
    name: "getAccountFactoryState",
    inputs: [
      { name: "accountFactory", type: "address", internalType: "address" },
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
    name: "getAdapters",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [
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
          { name: "targetContract", type: "address", internalType: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditConfiguratorState",
    inputs: [
      { name: "creditConfigurator", type: "address", internalType: "address" },
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
    name: "getCreditFacadeState",
    inputs: [
      { name: "creditFacade", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct CreditFacadeState",
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
          { name: "degenNFT", type: "address", internalType: "address" },
          { name: "botList", type: "address", internalType: "address" },
          { name: "expirable", type: "bool", internalType: "bool" },
          { name: "expirationDate", type: "uint40", internalType: "uint40" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditManagerState",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct CreditManagerState",
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
          { name: "name", type: "string", internalType: "string" },
          { name: "accountFactory", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "pool", type: "address", internalType: "address" },
          { name: "creditFacade", type: "address", internalType: "address" },
          {
            name: "creditConfigurator",
            type: "address",
            internalType: "address",
          },
          { name: "maxEnabledTokens", type: "uint8", internalType: "uint8" },
          {
            name: "collateralTokens",
            type: "tuple[]",
            internalType: "struct CollateralToken[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              {
                name: "liquidationThreshold",
                type: "uint16",
                internalType: "uint16",
              },
            ],
          },
          { name: "feeInterest", type: "uint16", internalType: "uint16" },
          { name: "feeLiquidation", type: "uint16", internalType: "uint16" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditSuiteData",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct CreditSuiteData",
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
              { name: "degenNFT", type: "address", internalType: "address" },
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
              { name: "name", type: "string", internalType: "string" },
              {
                name: "accountFactory",
                type: "address",
                internalType: "address",
              },
              { name: "underlying", type: "address", internalType: "address" },
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
                  { name: "token", type: "address", internalType: "address" },
                  {
                    name: "liquidationThreshold",
                    type: "uint16",
                    internalType: "uint16",
                  },
                ],
              },
              { name: "feeInterest", type: "uint16", internalType: "uint16" },
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
            name: "accountFactory",
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
            name: "adapters",
            type: "tuple[]",
            internalType: "struct AdapterState[]",
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
                name: "targetContract",
                type: "address",
                internalType: "address",
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
    name: "getCreditSuites",
    inputs: [
      {
        name: "filter",
        type: "tuple",
        internalType: "struct CreditManagerFilter",
        components: [
          {
            name: "configurators",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "creditManagers",
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
              { name: "degenNFT", type: "address", internalType: "address" },
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
              { name: "name", type: "string", internalType: "string" },
              {
                name: "accountFactory",
                type: "address",
                internalType: "address",
              },
              { name: "underlying", type: "address", internalType: "address" },
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
                  { name: "token", type: "address", internalType: "address" },
                  {
                    name: "liquidationThreshold",
                    type: "uint16",
                    internalType: "uint16",
                  },
                ],
              },
              { name: "feeInterest", type: "uint16", internalType: "uint16" },
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
            name: "accountFactory",
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
            name: "adapters",
            type: "tuple[]",
            internalType: "struct AdapterState[]",
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
                name: "targetContract",
                type: "address",
                internalType: "address",
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
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
