export const withdrawalCompressorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", type: "address", internalType: "address" },
      { name: "addressProvider_", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "compressorTypeToCompressor",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentWithdrawals",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct ClaimableWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "withdrawalTokenSpent",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "outputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "claimCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        type: "tuple[]",
        internalType: "struct PendingWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "expectedOutputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          { name: "claimableAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWithdrawableAssets",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct WithdrawableAsset[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          { name: "underlying", type: "address", internalType: "address" },
          {
            name: "withdrawalLength",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWithdrawalRequestResult",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "withdrawal",
        type: "tuple",
        internalType: "struct RequestableWithdrawal",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amountIn", type: "uint256", internalType: "uint256" },
          {
            name: "outputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "requestCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "claimableAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setSubcompressor",
    inputs: [
      { name: "subcompressor", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setWithdrawableTypeToCompressorType",
    inputs: [
      { name: "withdrawableType", type: "bytes32", internalType: "bytes32" },
      { name: "compressorType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawableTypeToCompressorType",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
