//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGaugeV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGaugeV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "addQuotaToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMaxRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMinRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "epochFrozen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochLastUpdate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokens", internalType: "address[]", type: "address[]" }],
    name: "getRates",
    outputs: [{ name: "rates", internalType: "uint16[]", type: "uint16[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAdded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "quotaRateParams",
    outputs: [
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
      { name: "totalVotesLpSide", internalType: "uint96", type: "uint96" },
      { name: "totalVotesCaSide", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "status", internalType: "bool", type: "bool" }],
    name: "setFrozenEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "unvote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "userTokenVotes",
    outputs: [
      { name: "votesLpSide", internalType: "uint96", type: "uint96" },
      { name: "votesCaSide", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "voter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "AddQuotaToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "status", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetFrozenEpoch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "SetQuotaTokenParams",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Unvote",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "epochNow",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "UpdateEpoch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Vote",
  },
] as const

