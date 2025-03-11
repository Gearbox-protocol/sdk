/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IFarmingPool
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iFarmingPoolAbi = [
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "distributor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "exit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "farmInfo",
    outputs: [
      {
        name: "",
        internalType: "struct FarmAccounting.Info",
        type: "tuple",
        components: [
          { name: "finished", internalType: "uint40", type: "uint40" },
          { name: "duration", internalType: "uint32", type: "uint32" },
          { name: "reward", internalType: "uint184", type: "uint184" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "farmed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "contract IERC20", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "rescueFunds",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "distributor_", internalType: "address", type: "address" },
    ],
    name: "setDistributor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "period", internalType: "uint256", type: "uint256" },
    ],
    name: "startFarming",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldDistributor",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newDistributor",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DistributorChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "reward",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "duration",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RewardUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
] as const;
