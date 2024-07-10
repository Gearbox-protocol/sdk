//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolServiceEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolServiceEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AddLiquidity",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BorrowForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewCreditManagerConnected",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "NewExpectedLiquidityLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "NewWithdrawFee",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RemoveLiquidity",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UncoveredLoss",
  },
] as const

