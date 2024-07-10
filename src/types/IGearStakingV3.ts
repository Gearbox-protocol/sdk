//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGearStakingV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGearStakingV3Abi = [
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "allowedVotingContract",
    outputs: [
      { name: "", internalType: "enum VotingContractStatus", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "availableBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "claimWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint96", type: "uint96" },
      {
        name: "votes",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint96", type: "uint96" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      {
        name: "votes",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "depositOnMigration",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint96", type: "uint96" },
      {
        name: "votes",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "depositWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "firstEpochTimestamp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "gear",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentEpoch",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "getWithdrawableAmounts",
    outputs: [
      { name: "withdrawableNow", internalType: "uint256", type: "uint256" },
      {
        name: "withdrawableInEpochs",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint96", type: "uint96" },
      {
        name: "votesBefore",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "votesAfter",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "migrator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "votes",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "multivote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newMigrator", internalType: "address", type: "address" }],
    name: "setMigrator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newSuccessor", internalType: "address", type: "address" },
    ],
    name: "setSuccessor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "votingContract", internalType: "address", type: "address" },
      {
        name: "status",
        internalType: "enum VotingContractStatus",
        type: "uint8",
      },
    ],
    name: "setVotingContractStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "successor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
      { name: "amount", internalType: "uint96", type: "uint96" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "votes",
        internalType: "struct MultiVote[]",
        type: "tuple[]",
        components: [
          { name: "votingContract", internalType: "address", type: "address" },
          { name: "voteAmount", internalType: "uint96", type: "uint96" },
          { name: "isIncrease", internalType: "bool", type: "bool" },
          { name: "extraData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ClaimGearWithdrawal",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DepositGear",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "successor",
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
    name: "MigrateGear",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ScheduleGearWithdrawal",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "migrator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetMigrator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "successor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetSuccessor",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "votingContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "status",
        internalType: "enum VotingContractStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetVotingContractStatus",
  },
] as const

