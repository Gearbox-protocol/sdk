export const iCurveV1_2AssetsAdapterAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amounts",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "add_liquidity",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "calc_add_one_coin",
    outputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [
      {
        name: "",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "int128",
        type: "int128",
      },
      {
        name: "j",
        internalType: "int128",
        type: "int128",
      },
      {
        name: "dx",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "min_dy",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "j",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "dx",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "min_dy",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "j",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange_diff",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "j",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "j",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "dx",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "min_dy",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange_underlying",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "i",
        internalType: "int128",
        type: "int128",
      },
      {
        name: "j",
        internalType: "int128",
        type: "int128",
      },
      {
        name: "dx",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "min_dy",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "exchange_underlying",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "leftoverAmount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "rateMinRAY",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
    ],
    name: "remove_liquidity",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amounts",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "int128",
        type: "int128",
      },
      {
        name: "minAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "i",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "minAmount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      {
        name: "useSafePrices",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [
      {
        name: "serializedData",
        internalType: "bytes",
        type: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [
      {
        name: "",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [
      {
        name: "",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
] as const;
