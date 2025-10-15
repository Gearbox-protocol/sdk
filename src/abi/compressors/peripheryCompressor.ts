export const peripheryCompressorAbi = [
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
    name: "getBots",
    inputs: [
      { name: "marketConfigurator", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "botStates",
        type: "tuple[]",
        internalType: "struct BotState[]",
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
            name: "requiredPermissions",
            type: "uint192",
            internalType: "uint192",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConnectedBots",
    inputs: [
      { name: "marketConfigurator", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "botStates",
        type: "tuple[]",
        internalType: "struct ConnectedBotState[]",
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
            name: "requiredPermissions",
            type: "uint192",
            internalType: "uint192",
          },
          { name: "creditAccount", type: "address", internalType: "address" },
          { name: "permissions", type: "uint192", internalType: "uint192" },
          { name: "forbidden", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getZappers",
    inputs: [
      { name: "marketConfigurator", type: "address", internalType: "address" },
      { name: "pool", type: "address", internalType: "address" },
    ],
    outputs: [
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
