export const iCreditFacadeV310Abi = [
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
    name: "botList",
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
    name: "botMulticall",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "calls",
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
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "closeCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "calls",
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
    ],
    outputs: [],
    stateMutability: "payable",
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
    name: "debtLimits",
    inputs: [],
    outputs: [
      {
        name: "minDebt",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "maxDebt",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "degenNFT",
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
    name: "emergencyLiquidators",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "expirable",
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
    name: "expirationDate",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "forbiddenTokenMask",
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
    name: "isEmergencyLiquidator",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "liquidateCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "calls",
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
    ],
    outputs: [
      {
        name: "reportedLoss",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "lossLiquidator",
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
    name: "maxDebtPerBlockMultiplier",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxQuotaMultiplier",
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
    name: "multicall",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "calls",
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
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "openCreditAccount",
    inputs: [
      {
        name: "onBehalfOf",
        type: "address",
        internalType: "address",
      },
      {
        name: "calls",
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
        name: "referralCode",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "partiallyLiquidateCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "repaidAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minSeizedAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "priceUpdates",
        type: "tuple[]",
        internalType: "struct PriceUpdate[]",
        components: [
          {
            name: "priceFeed",
            type: "address",
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "seizedAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDebtLimits",
    inputs: [
      {
        name: "newMinDebt",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "newMaxDebt",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "newMaxDebtPerBlockMultiplier",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setEmergencyLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowance",
        type: "uint8",
        internalType: "enum AllowanceAction",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setExpirationDate",
    inputs: [
      {
        name: "newExpirationDate",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLossLiquidator",
    inputs: [
      {
        name: "newLossLiquidator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenAllowance",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowance",
        type: "uint8",
        internalType: "enum AllowanceAction",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "treasury",
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
    name: "underlying",
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
    name: "unpause",
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
    type: "function",
    name: "weth",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    name: "AddCollateral",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
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
    name: "CloseCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Execute",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "targetContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FinishMultiCall",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "LiquidateCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "liquidator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "remainingFunds",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OpenCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "onBehalfOf",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "referralCode",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PartiallyLiquidateCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "liquidator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "repaidDebt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "seizedCollateral",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "fee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StartMultiCall",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawCollateral",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
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
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawPhantomToken",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
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
] as const;

export const iCreditManagerV310Abi = [
  {
    type: "function",
    name: "accountFactory",
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
    name: "adapterToContract",
    inputs: [
      {
        name: "adapter",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "targetContract",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addCollateral",
    inputs: [
      {
        name: "payer",
        type: "address",
        internalType: "address",
      },
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
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
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addToken",
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
    name: "approveCreditAccount",
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
    name: "approveToken",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "spender",
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
    name: "calcDebtAndCollateral",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "task",
        type: "uint8",
        internalType: "enum CollateralCalcTask",
      },
    ],
    outputs: [
      {
        name: "cdd",
        type: "tuple",
        internalType: "struct CollateralDebtData",
        components: [
          {
            name: "debt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeIndexNow",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "accruedInterest",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accruedFees",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalDebtUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalValue",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalValueUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "twvUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quotedTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quotedTokens",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "closeCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "collateralTokenByMask",
    inputs: [
      {
        name: "tokenMask",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "liquidationThreshold",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collateralTokensCount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractToAdapter",
    inputs: [
      {
        name: "targetContract",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "adapter",
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
    name: "creditAccountInfo",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "debt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeIndexLastUpdate",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "cumulativeQuotaInterest",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "quotaFees",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "enabledTokensMask",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "flags",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "lastDebtUpdate",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "borrower",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditAccounts",
    inputs: [
      {
        name: "offset",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "limit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditAccounts",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditAccountsLen",
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
    name: "creditConfigurator",
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
    name: "creditFacade",
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
    name: "enabledTokensMaskOf",
    inputs: [
      {
        name: "creditAccount",
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
    name: "execute",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "externalCall",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
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
    outputs: [
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fees",
    inputs: [],
    outputs: [
      {
        name: "feeInterest",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "feeLiquidation",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationDiscount",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "feeLiquidationExpired",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationDiscountExpired",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "flagsOf",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "fullCollateralCheck",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "enabledTokensMask",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "collateralHints",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minHealthFactor",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "useSafePrices",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getActiveCreditAccountOrRevert",
    inputs: [],
    outputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBorrowerOrRevert",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "borrower",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenByMask",
    inputs: [
      {
        name: "tokenMask",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenMaskOrRevert",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "tokenMask",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isLiquidatable",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "minHealthFactor",
        type: "uint16",
        internalType: "uint16",
      },
    ],
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
    name: "liquidateCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "collateralDebtData",
        type: "tuple",
        internalType: "struct CollateralDebtData",
        components: [
          {
            name: "debt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeIndexNow",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "accruedInterest",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accruedFees",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalDebtUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalValue",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalValueUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "twvUSD",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "enabledTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quotedTokensMask",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quotedTokens",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "isExpired",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "remainingFunds",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "loss",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "liquidationThresholds",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "lt",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ltParams",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "ltInitial",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "ltFinal",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "timestampRampStart",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "rampDuration",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "manageDebt",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "enabledTokensMask",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "action",
        type: "uint8",
        internalType: "enum ManageDebtAction",
      },
    ],
    outputs: [
      {
        name: "newDebt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "maxEnabledTokens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "openCreditAccount",
    inputs: [
      {
        name: "onBehalfOf",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pool",
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
    name: "poolQuotaKeeper",
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
    name: "priceOracle",
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
    name: "quotedTokensMask",
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
    name: "setActiveCreditAccount",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCollateralTokenData",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "ltInitial",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "ltFinal",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "timestampRampStart",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "rampDuration",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setContractAllowance",
    inputs: [
      {
        name: "adapter",
        type: "address",
        internalType: "address",
      },
      {
        name: "targetContract",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCreditConfigurator",
    inputs: [
      {
        name: "creditConfigurator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCreditFacade",
    inputs: [
      {
        name: "creditFacade",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFees",
    inputs: [
      {
        name: "feeInterest",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "feeLiquidation",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationDiscount",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "feeLiquidationExpired",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationDiscountExpired",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFlagFor",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "flag",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "value",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPriceOracle",
    inputs: [
      {
        name: "priceOracle",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "underlying",
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
    name: "updateQuota",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "quotaChange",
        type: "int96",
        internalType: "int96",
      },
      {
        name: "minQuota",
        type: "uint96",
        internalType: "uint96",
      },
      {
        name: "maxQuota",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    outputs: [
      {
        name: "tokensToEnable",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToDisable",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    type: "function",
    name: "withdrawCollateral",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
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
      {
        name: "to",
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
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "SetCreditConfigurator",
    inputs: [
      {
        name: "newConfigurator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export const iPriceOracleV310Abi = [
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
    name: "addUpdatablePriceFeed",
    inputs: [
      {
        name: "priceFeed",
        type: "address",
        internalType: "address",
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
    name: "controller",
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
    name: "convert",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenFrom",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenTo",
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
    name: "convertFromUSD",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
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
    name: "convertToUSD",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
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
    name: "getPrice",
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
    name: "getReservePrice",
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
    name: "getSafePrice",
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
    name: "getTokens",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUpdatablePriceFeeds",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceFeedParams",
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
        internalType: "struct PriceFeedParams",
        components: [
          {
            name: "priceFeed",
            type: "address",
            internalType: "address",
          },
          {
            name: "stalenessPeriod",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "skipCheck",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "tokenDecimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceFeeds",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "priceFeed",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reservePriceFeedParams",
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
        internalType: "struct PriceFeedParams",
        components: [
          {
            name: "priceFeed",
            type: "address",
            internalType: "address",
          },
          {
            name: "stalenessPeriod",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "skipCheck",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "tokenDecimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reservePriceFeeds",
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
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "safeConvertToUSD",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
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
    name: "setController",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setReservePriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePrices",
    inputs: [
      {
        name: "updates",
        type: "tuple[]",
        internalType: "struct PriceUpdate[]",
        components: [
          {
            name: "priceFeed",
            type: "address",
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
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
    type: "event",
    name: "AddUpdatablePriceFeed",
    inputs: [
      {
        name: "priceFeed",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewController",
    inputs: [
      {
        name: "newController",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetPriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
      {
        name: "skipCheck",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetReservePriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "stalenessPeriod",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
      {
        name: "skipCheck",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
] as const;

export const iCreditFacadeV310MulticallAbi = [
  {
    type: "function",
    name: "addCollateral",
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
    name: "addCollateralWithPermit",
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
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "compareBalances",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decreaseDebt",
    inputs: [
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
    name: "increaseDebt",
    inputs: [
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
    name: "onDemandPriceUpdates",
    inputs: [
      {
        name: "updates",
        type: "tuple[]",
        internalType: "struct PriceUpdate[]",
        components: [
          {
            name: "priceFeed",
            type: "address",
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBotPermissions",
    inputs: [
      {
        name: "bot",
        type: "address",
        internalType: "address",
      },
      {
        name: "permissions",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFullCheckParams",
    inputs: [
      {
        name: "collateralHints",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minHealthFactor",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "storeExpectedBalances",
    inputs: [
      {
        name: "balanceDeltas",
        type: "tuple[]",
        internalType: "struct BalanceDelta[]",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "amount",
            type: "int256",
            internalType: "int256",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateQuota",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "quotaChange",
        type: "int96",
        internalType: "int96",
      },
      {
        name: "minQuota",
        type: "uint96",
        internalType: "uint96",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawCollateral",
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
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const iMarketConfiguratorV310Abi = [
  {
    type: "function",
    name: "adapterFactory",
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
    name: "addressProvider",
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
    name: "contractsRegister",
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
    name: "controller",
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
    name: "creditFactory",
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
    name: "interestModelFactory",
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
    name: "owner",
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
    name: "poolFactory",
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
    name: "pools",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceOracleFactory",
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
    name: "treasury",
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
    type: "event",
    name: "CreateMarket",
    inputs: [
      {
        name: "pool",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "underlying",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "_name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "_symbol",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DeployDegenNFT",
    inputs: [
      {
        name: "",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveMarket",
    inputs: [
      {
        name: "pool",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetName",
    inputs: [
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetPriceFeedFromStore",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "trusted",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetReservePriceFeedFromStore",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceFeedd",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export const iCreditConfiguratorV310Abi = [
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
    name: "addCollateralToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "liquidationThreshold",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addEmergencyLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowAdapter",
    inputs: [
      {
        name: "adapter",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowToken",
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
    name: "allowedAdapters",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
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
    name: "controller",
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
    name: "creditFacade",
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
    name: "forbidAdapter",
    inputs: [
      {
        name: "adapter",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "forbidBorrowing",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "forbidToken",
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
    name: "rampLiquidationThreshold",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "liquidationThresholdFinal",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "rampStart",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "rampDuration",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeEmergencyLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setController",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCreditFacade",
    inputs: [
      {
        name: "newCreditFacade",
        type: "address",
        internalType: "address",
      },
      {
        name: "migrateParams",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDebtLimits",
    inputs: [
      {
        name: "newMinDebt",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "newMaxDebt",
        type: "uint128",
        internalType: "uint128",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setExpirationDate",
    inputs: [
      {
        name: "newExpirationDate",
        type: "uint40",
        internalType: "uint40",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFees",
    inputs: [
      {
        name: "feeLiquidation",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationPremium",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "feeLiquidationExpired",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "liquidationPremiumExpired",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLiquidationThreshold",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "liquidationThreshold",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setLossLiquidator",
    inputs: [
      {
        name: "newLossLiquidator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setMaxDebtPerBlockMultiplier",
    inputs: [
      {
        name: "newMaxDebtLimitPerBlockMultiplier",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPriceOracle",
    inputs: [
      {
        name: "newPriceOracle",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "underlying",
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
    name: "upgradeCreditConfigurator",
    inputs: [
      {
        name: "newCreditConfigurator",
        type: "address",
        internalType: "address",
      },
    ],
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
    type: "event",
    name: "AddCollateralToken",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddEmergencyLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AllowAdapter",
    inputs: [
      {
        name: "targetContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "adapter",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AllowToken",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CreditConfiguratorUpgraded",
    inputs: [
      {
        name: "creditConfigurator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ForbidAdapter",
    inputs: [
      {
        name: "targetContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "adapter",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ForbidToken",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewController",
    inputs: [
      {
        name: "newController",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveEmergencyLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ScheduleTokenLiquidationThresholdRamp",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "liquidationThresholdInitial",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "liquidationThresholdFinal",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "timestampRampStart",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
      {
        name: "timestampRampEnd",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetBorrowingLimits",
    inputs: [
      {
        name: "minDebt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "maxDebt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetCreditFacade",
    inputs: [
      {
        name: "creditFacade",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetExpirationDate",
    inputs: [
      {
        name: "expirationDate",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetLossLiquidator",
    inputs: [
      {
        name: "liquidator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetMaxDebtPerBlockMultiplier",
    inputs: [
      {
        name: "maxDebtPerBlockMultiplier",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetPriceOracle",
    inputs: [
      {
        name: "priceOracle",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenLiquidationThreshold",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "liquidationThreshold",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UpdateFees",
    inputs: [
      {
        name: "feeLiquidation",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "liquidationPremium",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "feeLiquidationExpired",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "liquidationPremiumExpired",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
    ],
    anonymous: false,
  },
] as const;
