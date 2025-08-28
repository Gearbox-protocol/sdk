//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccountMigratorBotV310
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accountMigratorBotV310Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_mcFactory", internalType: "address", type: "address" },
      { name: "_ioProxy", internalType: "address", type: "address" },
      {
        name: "_contractsRegisterOld",
        internalType: "address",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "contractsRegisterOld",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mcFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct MigrationParams",
        type: "tuple",
        components: [
          { name: "accountOwner", internalType: "address", type: "address" },
          {
            name: "sourceCreditAccount",
            internalType: "address",
            type: "address",
          },
          {
            name: "targetCreditManager",
            internalType: "address",
            type: "address",
          },
          {
            name: "migratedCollaterals",
            internalType: "struct MigratedCollateral[]",
            type: "tuple[]",
            components: [
              { name: "collateral", internalType: "address", type: "address" },
              { name: "amount", internalType: "uint256", type: "uint256" },
              {
                name: "targetQuotaIncrease",
                internalType: "uint96",
                type: "uint96",
              },
              {
                name: "underlyingInSource",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "underlyingInTarget",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "phantomTokenParams",
                internalType: "struct PhantomTokenParams",
                type: "tuple",
                components: [
                  {
                    name: "isPhantomToken",
                    internalType: "bool",
                    type: "bool",
                  },
                  {
                    name: "underlying",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "underlyingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "targetBorrowAmount",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "underlyingSwapCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          {
            name: "extraOpeningCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          {
            name: "uniqueTransferredTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "numAddCollateralCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numRemoveQuotasCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numIncreaseQuotaCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numPhantomTokenCalls",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct MigrationParams",
        type: "tuple",
        components: [
          { name: "accountOwner", internalType: "address", type: "address" },
          {
            name: "sourceCreditAccount",
            internalType: "address",
            type: "address",
          },
          {
            name: "targetCreditManager",
            internalType: "address",
            type: "address",
          },
          {
            name: "migratedCollaterals",
            internalType: "struct MigratedCollateral[]",
            type: "tuple[]",
            components: [
              { name: "collateral", internalType: "address", type: "address" },
              { name: "amount", internalType: "uint256", type: "uint256" },
              {
                name: "targetQuotaIncrease",
                internalType: "uint96",
                type: "uint96",
              },
              {
                name: "underlyingInSource",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "underlyingInTarget",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "phantomTokenParams",
                internalType: "struct PhantomTokenParams",
                type: "tuple",
                components: [
                  {
                    name: "isPhantomToken",
                    internalType: "bool",
                    type: "bool",
                  },
                  {
                    name: "underlying",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "underlyingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "targetBorrowAmount",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "underlyingSwapCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          {
            name: "extraOpeningCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          {
            name: "uniqueTransferredTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "numAddCollateralCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numRemoveQuotasCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numIncreaseQuotaCalls",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "numPhantomTokenCalls",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
      {
        name: "priceUpdates",
        internalType: "struct PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "migrateCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "phantomToken", internalType: "address", type: "address" },
    ],
    name: "phantomTokenOverrides",
    outputs: [
      {
        name: "",
        internalType: "struct PhantomTokenOverride",
        type: "tuple",
        components: [
          { name: "newToken", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "withdrawalCallData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
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
    inputs: [],
    name: "requiredPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "phantomToken", internalType: "address", type: "address" },
      { name: "newToken", internalType: "address", type: "address" },
      { name: "underlying", internalType: "address", type: "address" },
      { name: "withdrawalCallData", internalType: "bytes", type: "bytes" },
    ],
    name: "setPhantomTokenOverride",
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
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccountMigratorPreviewerV310
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accountMigratorPreviewerV310Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_migratorBot", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "migratorBot",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "sourceCreditAccount", internalType: "address", type: "address" },
      { name: "targetCreditManager", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "previewMigration",
    outputs: [
      {
        name: "result",
        internalType: "struct PreviewMigrationResult",
        type: "tuple",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          {
            name: "expectedTargetHF",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedTargetSafeHF",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedUnderlyingDust",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "failureStates",
            internalType: "struct FailureStates",
            type: "tuple",
            components: [
              { name: "targetHFTooLow", internalType: "bool", type: "bool" },
              {
                name: "targetSafeHFTooLow",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "sourceUnderlyingIsNotCollateral",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "migratedCollateralDoesNotExistInTarget",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "insufficientTargetQuotaLimits",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "insufficientTargetBorrowLiquidity",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "insufficientTargetDebtLimit",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "newTargetDebtOutOfLimits",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "noPathToSourceUnderlying",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "cannotSwapEnoughToCoverDebt",
                internalType: "bool",
                type: "bool",
              },
              {
                name: "sourceHasNoMigratorBotAdapter",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          {
            name: "migrationParams",
            internalType: "struct MigrationParams",
            type: "tuple",
            components: [
              {
                name: "accountOwner",
                internalType: "address",
                type: "address",
              },
              {
                name: "sourceCreditAccount",
                internalType: "address",
                type: "address",
              },
              {
                name: "targetCreditManager",
                internalType: "address",
                type: "address",
              },
              {
                name: "migratedCollaterals",
                internalType: "struct MigratedCollateral[]",
                type: "tuple[]",
                components: [
                  {
                    name: "collateral",
                    internalType: "address",
                    type: "address",
                  },
                  { name: "amount", internalType: "uint256", type: "uint256" },
                  {
                    name: "targetQuotaIncrease",
                    internalType: "uint96",
                    type: "uint96",
                  },
                  {
                    name: "underlyingInSource",
                    internalType: "bool",
                    type: "bool",
                  },
                  {
                    name: "underlyingInTarget",
                    internalType: "bool",
                    type: "bool",
                  },
                  {
                    name: "phantomTokenParams",
                    internalType: "struct PhantomTokenParams",
                    type: "tuple",
                    components: [
                      {
                        name: "isPhantomToken",
                        internalType: "bool",
                        type: "bool",
                      },
                      {
                        name: "underlying",
                        internalType: "address",
                        type: "address",
                      },
                      {
                        name: "underlyingAmount",
                        internalType: "uint256",
                        type: "uint256",
                      },
                    ],
                  },
                ],
              },
              {
                name: "targetBorrowAmount",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "underlyingSwapCalls",
                internalType: "struct MultiCall[]",
                type: "tuple[]",
                components: [
                  { name: "target", internalType: "address", type: "address" },
                  { name: "callData", internalType: "bytes", type: "bytes" },
                ],
              },
              {
                name: "extraOpeningCalls",
                internalType: "struct MultiCall[]",
                type: "tuple[]",
                components: [
                  { name: "target", internalType: "address", type: "address" },
                  { name: "callData", internalType: "bytes", type: "bytes" },
                ],
              },
              {
                name: "uniqueTransferredTokens",
                internalType: "address[]",
                type: "address[]",
              },
              {
                name: "numAddCollateralCalls",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "numRemoveQuotasCalls",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "numIncreaseQuotaCalls",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "numPhantomTokenCalls",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
