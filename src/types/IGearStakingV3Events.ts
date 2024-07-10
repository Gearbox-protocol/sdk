//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGearStakingV3Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGearStakingV3EventsAbi = [
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

