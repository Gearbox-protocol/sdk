//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolV3EventsAbi = [
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
    name: "AddCreditManager",
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
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
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
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
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
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
  },
] as const

