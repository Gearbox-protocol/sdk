export const accountMigratorAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_creditManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "_targetContract",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acl",
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
    name: "creditManager",
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
    name: "lock",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "locked",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "migrate",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct MigrationParams",
        components: [
          {
            name: "accountOwner",
            type: "address",
            internalType: "address",
          },
          {
            name: "sourceCreditAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCreditManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "migratedCollaterals",
            type: "tuple[]",
            internalType: "struct MigratedCollateral[]",
            components: [
              {
                name: "collateral",
                type: "address",
                internalType: "address",
              },
              {
                name: "amount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "targetQuotaIncrease",
                type: "uint96",
                internalType: "uint96",
              },
              {
                name: "underlyingInSource",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "underlyingInTarget",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "phantomTokenParams",
                type: "tuple",
                internalType: "struct PhantomTokenParams",
                components: [
                  {
                    name: "isPhantomToken",
                    type: "bool",
                    internalType: "bool",
                  },
                  {
                    name: "underlying",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "underlyingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "targetBorrowAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "underlyingSwapCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "extraOpeningCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "uniqueTransferredTokens",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "numAddCollateralCalls",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "numRemoveQuotasCalls",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "numIncreaseQuotaCalls",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "numPhantomTokenCalls",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "serialize",
    inputs: [],
    outputs: [
      {
        name: "serializedData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetContract",
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
    name: "unlock",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "error",
    name: "AddressIsNotContractException",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "CallerNotCreditFacadeException",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddressException",
    inputs: [],
  },
] as const;
