//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WithdrawalCompressorV310
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWithdrawalCompressorV310Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_owner", internalType: "address", type: "address" },
      { name: "addressProvider_", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "compressorTypeToCompressor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getCurrentWithdrawals",
    outputs: [
      {
        name: "",
        internalType: "struct ClaimableWithdrawal[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "withdrawalPhantomToken",
            internalType: "address",
            type: "address",
          },
          {
            name: "withdrawalTokenSpent",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "outputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "claimCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct PendingWithdrawal[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "withdrawalPhantomToken",
            internalType: "address",
            type: "address",
          },
          {
            name: "expectedOutputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "claimableAt", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "getWithdrawableAssets",
    outputs: [
      {
        name: "",
        internalType: "struct WithdrawableAsset[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "withdrawalPhantomToken",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          {
            name: "withdrawalLength",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "getWithdrawalRequestResult",
    outputs: [
      {
        name: "withdrawal",
        internalType: "struct RequestableWithdrawal",
        type: "tuple",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "outputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "requestCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "claimableAt", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  // TODO: REMOVE COMMENTS AFTER MIGRATION TO MULTIPLE
  // {
  //   type: "function",
  //   inputs: [
  //     { name: "creditAccount", internalType: "address", type: "address" },
  //     { name: "token", internalType: "address", type: "address" },
  //     { name: "withdrawalToken", internalType: "address", type: "address" },
  //     { name: "amount", internalType: "uint256", type: "uint256" },
  //   ],
  //   name: "getWithdrawalRequestResult",
  //   outputs: [
  //     {
  //       name: "withdrawal",
  //       internalType: "struct RequestableWithdrawal",
  //       type: "tuple",
  //       components: [
  //         { name: "token", internalType: "address", type: "address" },
  //         { name: "amountIn", internalType: "uint256", type: "uint256" },
  //         {
  //           name: "outputs",
  //           internalType: "struct WithdrawalOutput[]",
  //           type: "tuple[]",
  //           components: [
  //             { name: "token", internalType: "address", type: "address" },
  //             { name: "isDelayed", internalType: "bool", type: "bool" },
  //             { name: "amount", internalType: "uint256", type: "uint256" },
  //           ],
  //         },
  //         {
  //           name: "requestCalls",
  //           internalType: "struct MultiCall[]",
  //           type: "tuple[]",
  //           components: [
  //             { name: "target", internalType: "address", type: "address" },
  //             { name: "callData", internalType: "bytes", type: "bytes" },
  //           ],
  //         },
  //         { name: "claimableAt", internalType: "uint256", type: "uint256" },
  //       ],
  //     },
  //   ],
  //   stateMutability: "view",
  // },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "subcompressor", internalType: "address", type: "address" },
    ],
    name: "setSubcompressor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "withdrawableType", internalType: "bytes32", type: "bytes32" },
      { name: "compressorType", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setWithdrawableTypeToCompressorType",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
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
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "withdrawableTypeToCompressorType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
] as const;
