export const gaugeCompressorAbi = [
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
    name: "getGaugeInfo",
    inputs: [
      { name: "gauge", type: "address", internalType: "address" },
      { name: "staker", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct GaugeInfo",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "pool", type: "address", internalType: "address" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "name", type: "string", internalType: "string" },
          { name: "voter", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "currentEpoch", type: "uint16", internalType: "uint16" },
          { name: "epochLastUpdate", type: "uint16", internalType: "uint16" },
          { name: "epochFrozen", type: "bool", internalType: "bool" },
          {
            name: "quotaParams",
            type: "tuple[]",
            internalType: "struct GaugeQuotaParams[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "minRate", type: "uint16", internalType: "uint16" },
              { name: "maxRate", type: "uint16", internalType: "uint16" },
              {
                name: "totalVotesLpSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "totalVotesCaSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "stakerVotesLpSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "stakerVotesCaSide",
                type: "uint96",
                internalType: "uint96",
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
    name: "getGauges",
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
      { name: "staker", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple[]",
        internalType: "struct GaugeInfo[]",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "pool", type: "address", internalType: "address" },
          { name: "symbol", type: "string", internalType: "string" },
          { name: "name", type: "string", internalType: "string" },
          { name: "voter", type: "address", internalType: "address" },
          { name: "underlying", type: "address", internalType: "address" },
          { name: "currentEpoch", type: "uint16", internalType: "uint16" },
          { name: "epochLastUpdate", type: "uint16", internalType: "uint16" },
          { name: "epochFrozen", type: "bool", internalType: "bool" },
          {
            name: "quotaParams",
            type: "tuple[]",
            internalType: "struct GaugeQuotaParams[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "minRate", type: "uint16", internalType: "uint16" },
              { name: "maxRate", type: "uint16", internalType: "uint16" },
              {
                name: "totalVotesLpSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "totalVotesCaSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "stakerVotesLpSide",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "stakerVotesCaSide",
                type: "uint96",
                internalType: "uint96",
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
