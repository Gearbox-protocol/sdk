//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBotListV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBotListV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "activeBots",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "approvedCreditManager",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "bot", internalType: "address", type: "address" }],
    name: "botForbiddenStatus",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "botPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "botSpecialPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "eraseAllBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBotStatus",
    outputs: [
      { name: "permissions", internalType: "uint192", type: "uint192" },
      { name: "forbidden", internalType: "bool", type: "bool" },
      { name: "hasSpecialPermissions", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "forbidden", internalType: "bool", type: "bool" },
    ],
    name: "setBotForbiddenStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [
      { name: "activeBotsRemaining", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotSpecialPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setCreditManagerApprovedStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
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
    ],
    name: "EraseBot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      { name: "forbidden", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetBotForbiddenStatus",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
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
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotPermissions",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotSpecialPermissions",
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
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetCreditManagerApprovedStatus",
  },
] as const

