export const ITreasurySplitterAbi = [
  {
    type: "function",
    name: "activeProposals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct TwoAdminProposal[]",
        components: [
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "confirmedByAdmin",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "confirmedByTreasuryProxy",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cancelConfigure",
    inputs: [
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "configure",
    inputs: [
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "defaultSplit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Split",
        components: [
          {
            name: "initialized",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "receivers",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "proportions",
            type: "uint16[]",
            internalType: "uint16[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "distribute",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getProposal",
    inputs: [
      {
        name: "callDataHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct TwoAdminProposal",
        components: [
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "confirmedByAdmin",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "confirmedByTreasuryProxy",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setDefaultSplit",
    inputs: [
      {
        name: "receivers",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "proportions",
        type: "uint16[]",
        internalType: "uint16[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenInsuranceAmount",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenSplit",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "receivers",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "proportions",
        type: "uint16[]",
        internalType: "uint16[]",
      },
      {
        name: "distribute",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tokenInsuranceAmount",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenSplits",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Split",
        components: [
          {
            name: "initialized",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "receivers",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "proportions",
            type: "uint16[]",
            internalType: "uint16[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "treasuryProxy",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "DistributeToken",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "distributedAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetDefaultSplit",
    inputs: [
      {
        name: "receivers",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "proportions",
        type: "uint16[]",
        indexed: false,
        internalType: "uint16[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenInsuranceAmount",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenSplit",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "receivers",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "proportions",
        type: "uint16[]",
        indexed: false,
        internalType: "uint16[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawToken",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawnAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IncorrectConfigureSelectorException",
    inputs: [],
  },
  {
    type: "error",
    name: "OnlyAdminOrTreasuryProxyException",
    inputs: [],
  },
  {
    type: "error",
    name: "OnlySelfException",
    inputs: [],
  },
  {
    type: "error",
    name: "PropotionSumIncorrectException",
    inputs: [],
  },
  {
    type: "error",
    name: "SplitArraysDifferentLengthException",
    inputs: [],
  },
  {
    type: "error",
    name: "TreasurySplitterAsReceiverException",
    inputs: [],
  },
  {
    type: "error",
    name: "UndefinedSplitException",
    inputs: [],
  },
] as const;
