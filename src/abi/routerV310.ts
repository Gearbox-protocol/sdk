export const iGearboxRouterV310Abi = [
  {
    type: "function",
    name: "componentAddressByType",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
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
    name: "futureRouter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRouterConfigurator",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "knownComponentTypes",
    inputs: [],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "processClaims",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeManyToOne",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOneToOne",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      { name: "numSplits", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOneToOneDiff",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      { name: "numSplits", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOpenManyToOne",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
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
    name: "RouterComponentUpdate",
    inputs: [
      { name: "", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "", type: "address", indexed: true, internalType: "address" },
      {
        name: "version",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetFutureRouter",
    inputs: [
      { name: "", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;
