//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WithdrawalCompressorV311
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWithdrawalCompressorV311Abi = [
  {
    inputs: [
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address", name: "addressProvider_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "addressProvider",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "compressorTypeToCompressor",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractType",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "creditAccount", type: "address" },
    ],
    name: "getCurrentWithdrawals",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          {
            internalType: "address",
            name: "withdrawalPhantomToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "withdrawalTokenSpent",
            type: "uint256",
          },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "bool", name: "isDelayed", type: "bool" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WithdrawalOutput[]",
            name: "outputs",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "address", name: "target", type: "address" },
              { internalType: "bytes", name: "callData", type: "bytes" },
            ],
            internalType: "struct MultiCall[]",
            name: "claimCalls",
            type: "tuple[]",
          },
        ],
        internalType: "struct ClaimableWithdrawal[]",
        name: "",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          {
            internalType: "address",
            name: "withdrawalPhantomToken",
            type: "address",
          },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "bool", name: "isDelayed", type: "bool" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WithdrawalOutput[]",
            name: "expectedOutputs",
            type: "tuple[]",
          },
          { internalType: "uint256", name: "claimableAt", type: "uint256" },
        ],
        internalType: "struct PendingWithdrawal[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "creditManager", type: "address" },
    ],
    name: "getWithdrawableAssets",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          {
            internalType: "address",
            name: "withdrawalPhantomToken",
            type: "address",
          },
          { internalType: "address", name: "underlying", type: "address" },
          {
            internalType: "uint256",
            name: "withdrawalLength",
            type: "uint256",
          },
          { internalType: "uint256", name: "maxWithdrawals", type: "uint256" },
        ],
        internalType: "struct WithdrawableAsset[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "creditAccount", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getWithdrawalRequestResult",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "bool", name: "isDelayed", type: "bool" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WithdrawalOutput[]",
            name: "outputs",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "address", name: "target", type: "address" },
              { internalType: "bytes", name: "callData", type: "bytes" },
            ],
            internalType: "struct MultiCall[]",
            name: "requestCalls",
            type: "tuple[]",
          },
          { internalType: "uint256", name: "claimableAt", type: "uint256" },
        ],
        internalType: "struct RequestableWithdrawal",
        name: "withdrawal",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // {
  //   inputs: [
  //     { internalType: "address", name: "creditAccount", type: "address" },
  //     { internalType: "address", name: "token", type: "address" },
  //     { internalType: "address", name: "withdrawalToken", type: "address" },
  //     { internalType: "uint256", name: "amount", type: "uint256" },
  //   ],
  //   name: "getWithdrawalRequestResult",
  //   outputs: [
  //     {
  //       components: [
  //         { internalType: "address", name: "token", type: "address" },
  //         { internalType: "uint256", name: "amountIn", type: "uint256" },
  //         {
  //           components: [
  //             { internalType: "address", name: "token", type: "address" },
  //             { internalType: "bool", name: "isDelayed", type: "bool" },
  //             { internalType: "uint256", name: "amount", type: "uint256" },
  //           ],
  //           internalType: "struct WithdrawalOutput[]",
  //           name: "outputs",
  //           type: "tuple[]",
  //         },
  //         {
  //           components: [
  //             { internalType: "address", name: "target", type: "address" },
  //             { internalType: "bytes", name: "callData", type: "bytes" },
  //           ],
  //           internalType: "struct MultiCall[]",
  //           name: "requestCalls",
  //           type: "tuple[]",
  //         },
  //         { internalType: "uint256", name: "claimableAt", type: "uint256" },
  //       ],
  //       internalType: "struct RequestableWithdrawal",
  //       name: "withdrawal",
  //       type: "tuple",
  //     },
  //   ],
  //   stateMutability: "view",
  //   type: "function",
  // },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "subcompressor", type: "address" },
    ],
    name: "setSubcompressor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "withdrawableType", type: "bytes32" },
      { internalType: "bytes32", name: "compressorType", type: "bytes32" },
    ],
    name: "setWithdrawableTypeToCompressorType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "withdrawableTypeToCompressorType",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
