export const iAaveV3PoolAbi = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
      {
        type: "uint16",
        name: "referralCode",
      },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "address",
        name: "to",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    name: "borrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "uint256",
        name: "interestRateMode",
      },
      {
        type: "uint16",
        name: "referralCode",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
    ],
    outputs: [],
  },
  {
    name: "repay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
      {
        type: "uint256",
        name: "amount",
      },
      {
        type: "uint256",
        name: "interestRateMode",
      },
      {
        type: "address",
        name: "onBehalfOf",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    name: "getReserveAToken",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "address",
        name: "asset",
      },
    ],
    outputs: [
      {
        type: "address",
      },
    ],
  },
] as const;
