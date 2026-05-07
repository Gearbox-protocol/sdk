export const rwaCompressorAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "addressProvider",
        type: "address",
        internalType: "contract IAddressProvider",
      },
    ],
    stateMutability: "nonpayable",
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
    name: "getRWAInvestorData",
    inputs: [
      { name: "investor", type: "address", internalType: "address" },
      { name: "factories", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "investorData",
        type: "tuple[]",
        internalType: "struct IRWACompressor.RWAInvestorData[]",
        components: [
          {
            name: "creditAccounts",
            type: "tuple[]",
            internalType: "struct IRWACompressor.RWACreditAccountData[]",
            components: [
              {
                name: "creditAccount",
                type: "address",
                internalType: "address",
              },
              { name: "wallet", type: "address", internalType: "address" },
              { name: "frozen", type: "bool", internalType: "bool" },
              { name: "extraDetails", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "extraDetails", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRWAMarketsData",
    inputs: [
      { name: "configurators", type: "address[]", internalType: "address[]" },
      { name: "factories", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      {
        name: "underlyingsData",
        type: "tuple[]",
        internalType: "struct IRWACompressor.RWAUnderlyingData[]",
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
          { name: "asset", type: "address", internalType: "address" },
          { name: "factory", type: "address", internalType: "address" },
          { name: "extraDetails", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "factoriesData",
        type: "tuple[]",
        internalType: "struct IRWACompressor.RWAFactoryData[]",
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
          { name: "extraDetails", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setSubcompressor",
    inputs: [
      { name: "subcompressor", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "subcompressors",
    inputs: [
      { name: "domain", type: "bytes32", internalType: "bytes32" },
      { name: "postfix", type: "bytes32", internalType: "bytes32" },
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
  {
    type: "error",
    name: "CallerIsNotInstanceOwnerException",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidDomainException",
    inputs: [{ name: "domain", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "InvalidRWAFactoryException",
    inputs: [{ name: "factory", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidMarketConfiguratorException",
    inputs: [
      { name: "marketConfigurator", type: "address", internalType: "address" },
    ],
  },
] as const;
