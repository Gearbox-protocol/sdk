export const priceFeedCompressorAbi = [
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
    name: "getPriceOracleState",
    inputs: [{ name: "priceOracle", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
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
              { name: "priceFeed", type: "address", internalType: "address" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceOracleState",
    inputs: [
      { name: "priceOracle", type: "address", internalType: "address" },
      { name: "tokens", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "result",
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
              { name: "priceFeed", type: "address", internalType: "address" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPriceOracles",
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
        internalType: "struct PriceOracleState[]",
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
              { name: "priceFeed", type: "address", internalType: "address" },
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
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUpdatablePriceFeeds",
    inputs: [
      { name: "priceFeeds", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "",
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
        name: "",
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
    name: "loadPriceFeedTree",
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
        name: "",
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
        name: "",
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
    name: "serializers",
    inputs: [
      { name: "priceFeedType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
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
