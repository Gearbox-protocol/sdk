/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACL
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const aclAbi = [
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "addPausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "addUnpausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "claimOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "isPausableAdmin",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "isUnpausableAdmin",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
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
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "pausableAdminSet",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pendingOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "admin", internalType: "address", type: "address" }],
    name: "removePausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "admin", internalType: "address", type: "address" }],
    name: "removeUnpausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "unpausableAdminSet",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "PausableAdminAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "admin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "PausableAdminRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "UnpausableAdminAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "admin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "UnpausableAdminRemoved",
  },
  {
    type: "error",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "AddressNotPausableAdminException",
  },
  {
    type: "error",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "AddressNotUnpausableAdminException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACLNonReentrantTrait
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const aclNonReentrantTraitAbi = [
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccountFactoryV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accountFactoryV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "addCreditManager",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "delay",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "rescue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "returnCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "takeCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "masterCreditAccount",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AddCreditManager",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "DeployCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "Rescue",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ReturnCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TakeCreditAccount",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditManagerException" },
  { type: "error", inputs: [], name: "CreditAccountIsInUseException" },
  {
    type: "error",
    inputs: [],
    name: "MasterCreditAccountAlreadyDeployedException",
  },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// iAddressProviderV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3Abi = [
  {
    type: "function",
    name: "addresses",
    inputs: [
      {
        name: "key",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_version",
        type: "uint256",
        internalType: "uint256",
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
    name: "getAddressOrRevert",
    inputs: [
      {
        name: "key",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_version",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setAddress",
    inputs: [
      {
        name: "key",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "value",
        type: "address",
        internalType: "address",
      },
      {
        name: "saveVersion",
        type: "bool",
        internalType: "bool",
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
    name: "SetAddress",
    inputs: [
      {
        name: "key",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "value",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "version",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2VaultAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balancerV2VaultAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [
      { name: "kind", internalType: "enum SwapKind", type: "uint8" },
      {
        name: "swaps",
        internalType: "struct BatchSwapStep[]",
        type: "tuple[]",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "assetInIndex", internalType: "uint256", type: "uint256" },
          { name: "assetOutIndex", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "assets", internalType: "contract IAsset[]", type: "address[]" },
      {
        name: "",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limits", internalType: "int256[]", type: "int256[]" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "batchSwap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address payable", type: "address" },
      {
        name: "request",
        internalType: "struct ExitPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "minAmountsOut",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "exitPool",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetOut", internalType: "contract IAsset", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "minAmountOut", internalType: "uint256", type: "uint256" },
    ],
    name: "exitPoolSingleAsset",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetOut", internalType: "contract IAsset", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exitPoolSingleAssetDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      {
        name: "request",
        internalType: "struct JoinPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "maxAmountsIn",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "joinPool",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetIn", internalType: "contract IAsset", type: "address" },
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "minAmountOut", internalType: "uint256", type: "uint256" },
    ],
    name: "joinPoolSingleAsset",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "assetIn", internalType: "contract IAsset", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "joinPoolSingleAssetDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "poolStatus",
    outputs: [{ name: "", internalType: "enum PoolStatus", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "newStatus", internalType: "enum PoolStatus", type: "uint8" },
    ],
    name: "setPoolStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "singleSwap",
        internalType: "struct SingleSwap",
        type: "tuple",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "kind", internalType: "enum SwapKind", type: "uint8" },
          { name: "assetIn", internalType: "contract IAsset", type: "address" },
          {
            name: "assetOut",
            internalType: "contract IAsset",
            type: "address",
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limit", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "singleSwapDiff",
        internalType: "struct SingleSwapDiff",
        type: "tuple",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "assetIn", internalType: "contract IAsset", type: "address" },
          {
            name: "assetOut",
            internalType: "contract IAsset",
            type: "address",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "limitRateRAY", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "poolId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newStatus",
        internalType: "enum PoolStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "PoolNotSupportedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BatchesChain
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const batchesChainAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_timelock", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "revertIfQueued",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "timelock",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BotListV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const botListV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "activeBots",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "approvedCreditManager",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "bot", internalType: "address", type: "address" }],
    name: "botForbiddenStatus",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "botPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "botSpecialPermissions",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "eraseAllBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBotStatus",
    outputs: [
      { name: "permissions", internalType: "uint192", type: "uint192" },
      { name: "forbidden", internalType: "bool", type: "bool" },
      { name: "hasSpecialPermissions", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "forbidden", internalType: "bool", type: "bool" },
    ],
    name: "setBotForbiddenStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [
      { name: "activeBotsRemaining", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "bot", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotSpecialPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setCreditManagerApprovedStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
      { name: "bot", internalType: "address", type: "address", indexed: true },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "EraseBot",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
      { name: "bot", internalType: "address", type: "address", indexed: true },
      { name: "forbidden", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetBotForbiddenStatus",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotPermissions",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "bot", internalType: "address", type: "address", indexed: true },
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "permissions",
        internalType: "uint192",
        type: "uint192",
        indexed: false,
      },
    ],
    name: "SetBotSpecialPermissions",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetCreditManagerApprovedStatus",
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
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "InvalidBotException" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CamelotV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const camelotV3AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3AdapterTypes.ExactDiffInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactDiffInput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType:
          "struct ICamelotV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactDiffInputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType:
          "struct ICamelotV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactDiffInputSingleSupportingFeeOnTransferTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactInput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactInputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactInputSingleSupportingFeeOnTransferTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactOutputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactOutput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ICamelotV3Router.ExactOutputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
          { name: "limitSqrtPrice", internalType: "uint160", type: "uint160" },
        ],
      },
    ],
    name: "exactOutputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct CamelotV3PoolStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "setPoolStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ContractsRegister
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const contractsRegisterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_acl",
    outputs: [{ name: "", internalType: "contract IACL", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newCreditManager", internalType: "address", type: "address" },
    ],
    name: "addCreditManager",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newPoolAddress", internalType: "address", type: "address" },
    ],
    name: "addPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCreditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCreditManagersCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPools",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPoolsCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isCreditManager",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isPool",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pools",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewCreditManagerAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewPoolAdded",
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnPausableAdminException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ControllerTimelockV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const controllerTimelockV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_addressProvider", internalType: "address", type: "address" },
      { name: "_vetoAdmin", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "cancelTransaction",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyHash", internalType: "bytes32", type: "bytes32" }],
    name: "disablePolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
    name: "executeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    name: "forbidBoundsUpdate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "getCreditManagerDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "getExpirationDate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "contractAddress", internalType: "address", type: "address" },
    ],
    name: "getGroup",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getLTRampParamsHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "getMaxDebtLimit",
    outputs: [{ name: "", internalType: "uint128", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "getMaxDebtPerBlockMultiplier",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "gauge", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getMaxQuotaRate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "getMinDebtLimit",
    outputs: [{ name: "", internalType: "uint128", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "gauge", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getMinQuotaRate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "policyHash", internalType: "bytes32", type: "bytes32" }],
    name: "getPolicy",
    outputs: [
      {
        name: "",
        internalType: "struct Policy",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "admin", internalType: "address", type: "address" },
          { name: "delay", internalType: "uint40", type: "uint40" },
          { name: "flags", internalType: "uint8", type: "uint8" },
          { name: "exactValue", internalType: "uint256", type: "uint256" },
          { name: "minValue", internalType: "uint256", type: "uint256" },
          { name: "maxValue", internalType: "uint256", type: "uint256" },
          { name: "referencePoint", internalType: "uint256", type: "uint256" },
          {
            name: "referencePointUpdatePeriod",
            internalType: "uint40",
            type: "uint40",
          },
          {
            name: "referencePointTimestampLU",
            internalType: "uint40",
            type: "uint40",
          },
          { name: "minPctChangeDown", internalType: "uint16", type: "uint16" },
          { name: "minPctChangeUp", internalType: "uint16", type: "uint16" },
          { name: "maxPctChangeDown", internalType: "uint16", type: "uint16" },
          { name: "maxPctChangeUp", internalType: "uint16", type: "uint16" },
          { name: "minChange", internalType: "uint256", type: "uint256" },
          { name: "maxChange", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    name: "getPriceFeedLowerBound",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolQuotaKeeper", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getTokenLimit",
    outputs: [{ name: "", internalType: "uint96", type: "uint96" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolQuotaKeeper", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getTokenQuotaIncreaseFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "getTotalDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "getWithdrawFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "queuedTransactions",
    outputs: [
      { name: "queued", internalType: "bool", type: "bool" },
      { name: "executor", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "eta", internalType: "uint40", type: "uint40" },
      { name: "signature", internalType: "string", type: "string" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "sanityCheckValue", internalType: "uint256", type: "uint256" },
      { name: "sanityCheckCallData", internalType: "bytes", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "rampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "rampLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "debtLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "expirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "group", internalType: "string", type: "string" },
    ],
    name: "setGroup",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "lowerBound", internalType: "uint256", type: "uint256" },
    ],
    name: "setLPPriceFeedLimiter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "maxDebt", internalType: "uint128", type: "uint128" },
    ],
    name: "setMaxDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "multiplier", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxDebtPerBlockMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "rate", internalType: "uint16", type: "uint16" },
    ],
    name: "setMaxQuotaRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "minDebt", internalType: "uint128", type: "uint128" },
    ],
    name: "setMinDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "rate", internalType: "uint16", type: "uint16" },
    ],
    name: "setMinQuotaRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "policyHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "policyParams",
        internalType: "struct Policy",
        type: "tuple",
        components: [
          { name: "enabled", internalType: "bool", type: "bool" },
          { name: "admin", internalType: "address", type: "address" },
          { name: "delay", internalType: "uint40", type: "uint40" },
          { name: "flags", internalType: "uint8", type: "uint8" },
          { name: "exactValue", internalType: "uint256", type: "uint256" },
          { name: "minValue", internalType: "uint256", type: "uint256" },
          { name: "maxValue", internalType: "uint256", type: "uint256" },
          { name: "referencePoint", internalType: "uint256", type: "uint256" },
          {
            name: "referencePointUpdatePeriod",
            internalType: "uint40",
            type: "uint40",
          },
          {
            name: "referencePointTimestampLU",
            internalType: "uint40",
            type: "uint40",
          },
          { name: "minPctChangeDown", internalType: "uint16", type: "uint16" },
          { name: "minPctChangeUp", internalType: "uint16", type: "uint16" },
          { name: "maxPctChangeDown", internalType: "uint16", type: "uint16" },
          { name: "maxPctChangeUp", internalType: "uint16", type: "uint16" },
          { name: "minChange", internalType: "uint256", type: "uint256" },
          { name: "maxChange", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "setPolicy",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "priceOracle", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    name: "setReservePriceFeedStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "limit", internalType: "uint96", type: "uint96" },
    ],
    name: "setTokenLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaIncreaseFee", internalType: "uint16", type: "uint16" },
    ],
    name: "setTokenQuotaIncreaseFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    name: "setVetoAdmin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "newFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
    inputs: [],
    name: "vetoAdmin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "CancelTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "ExecuteTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "txHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "executor",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "signature",
        internalType: "string",
        type: "string",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      { name: "eta", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "QueueTransaction",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "contractAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "group", internalType: "string", type: "string", indexed: true },
    ],
    name: "SetGroup",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "policyHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      { name: "enabled", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPolicy",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetVetoAdmin",
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotExecutorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotVetoAdminException" },
  { type: "error", inputs: [], name: "ParameterChangedAfterQueuedTxException" },
  { type: "error", inputs: [], name: "ParameterChecksFailedException" },
  { type: "error", inputs: [], name: "TxExecutedOutsideTimeWindowException" },
  { type: "error", inputs: [], name: "TxExecutionRevertedException" },
  { type: "error", inputs: [], name: "TxNotQueuedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexV1BaseRewardPoolAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexV1BaseRewardPoolAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_baseRewardPool", internalType: "address", type: "address" },
      { name: "_stakedPhantomToken", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveLPTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "curveLPtoken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraReward4",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getReward",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardTokensMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "stake",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "stakeDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "stakedPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakedTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawAndUnwrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawDiffAndUnwrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConvexV1BoosterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const convexV1BoosterAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_booster", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "deposit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateStakedPhantomTokensMap",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pid", internalType: "uint256", type: "uint256", indexed: true },
      {
        name: "phantomToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPidToPhantomToken",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CreditConfiguratorV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const creditConfiguratorV3Abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_creditManager",
        internalType: "contract CreditManagerV3",
        type: "address",
      },
      {
        name: "_creditFacade",
        internalType: "contract CreditFacadeV3",
        type: "address",
      },
      {
        name: "opts",
        internalType: "struct CreditManagerOpts",
        type: "tuple",
        components: [
          { name: "minDebt", internalType: "uint128", type: "uint128" },
          { name: "maxDebt", internalType: "uint128", type: "uint128" },
          { name: "degenNFT", internalType: "address", type: "address" },
          { name: "expirable", internalType: "bool", type: "bool" },
          { name: "name", internalType: "string", type: "string" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    name: "addCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "addEmergencyLiquidator",
    outputs: [],
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
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "allowAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "allowToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "allowedAdapters",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditFacade",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "emergencyLiquidators",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "forbidBorrowing",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "forbidToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "makeTokenQuoted",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
      },
      { name: "rampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "rampLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "removeEmergencyLiquidator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "resetCumulativeLoss",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newVersion", internalType: "uint256", type: "uint256" }],
    name: "setBotList",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newCreditFacade", internalType: "address", type: "address" },
      { name: "migrateParams", internalType: "bool", type: "bool" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newExpirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationPremium", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationPremiumExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    name: "setLiquidationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
    ],
    name: "setMaxCumulativeLoss",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "maxDebt", internalType: "uint128", type: "uint128" }],
    name: "setMaxDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxDebtLimitPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setMaxDebtPerBlockMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newMaxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "minDebt", internalType: "uint128", type: "uint128" }],
    name: "setMinDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newVersion", internalType: "uint256", type: "uint256" }],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newCreditConfigurator",
        internalType: "address",
        type: "address",
      },
    ],
    name: "upgradeCreditConfigurator",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCollateralToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddEmergencyLiquidator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AllowAdapter",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AllowToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CreditConfiguratorUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ForbidAdapter",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ForbidToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "QuoteToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RemoveEmergencyLiquidator",
  },
  { type: "event", anonymous: false, inputs: [], name: "ResetCumulativeLoss" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidationThresholdInitial",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationThresholdFinal",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "timestampRampStart",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
      {
        name: "timestampRampEnd",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
    ],
    name: "ScheduleTokenLiquidationThresholdRamp",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetBorrowingLimits",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "botList",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetBotList",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditFacade",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetCreditFacade",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "expirationDate",
        internalType: "uint40",
        type: "uint40",
        indexed: false,
      },
    ],
    name: "SetExpirationDate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
        indexed: false,
      },
    ],
    name: "SetMaxCumulativeLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxDebtPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetMaxDebtPerBlockMultiplier",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxEnabledTokens",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetMaxEnabledTokens",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "priceOracle",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPriceOracle",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidationThreshold",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "SetTokenLiquidationThreshold",
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
    anonymous: false,
    inputs: [
      {
        name: "feeInterest",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "feeLiquidation",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationPremium",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "liquidationPremiumExpired",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "UpdateFees",
  },
  { type: "error", inputs: [], name: "AdapterIsNotRegisteredException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "IncompatibleContractException" },
  { type: "error", inputs: [], name: "IncorrectExpirationDateException" },
  { type: "error", inputs: [], name: "IncorrectLimitsException" },
  { type: "error", inputs: [], name: "IncorrectLiquidationThresholdException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectTokenContractException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenIsNotQuotedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CreditFacadeV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const creditFacadeV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_degenNFT", internalType: "address", type: "address" },
      { name: "_expirable", internalType: "bool", type: "bool" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "botList",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "botMulticall",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "canLiquidateWhilePaused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "debtLimits",
    outputs: [
      { name: "minDebt", internalType: "uint128", type: "uint128" },
      { name: "maxDebt", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "degenNFT",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirationDate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "forbiddenTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lossParams",
    outputs: [
      {
        name: "currentCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "maxCumulativeLoss", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxDebtPerBlockMultiplier",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxQuotaMultiplier",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "multicall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "onBehalfOf", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "openCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newBotList", internalType: "address", type: "address" }],
    name: "setBotList",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "bot", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "resetCumulativeLoss", internalType: "bool", type: "bool" },
    ],
    name: "setCumulativeLossParams",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newMinDebt", internalType: "uint128", type: "uint128" },
      { name: "newMaxDebt", internalType: "uint128", type: "uint128" },
      {
        name: "newMaxDebtPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setDebtLimits",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "liquidator", internalType: "address", type: "address" },
      {
        name: "allowance",
        internalType: "enum AllowanceAction",
        type: "uint8",
      },
    ],
    name: "setEmergencyLiquidator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newExpirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      {
        name: "allowance",
        internalType: "enum AllowanceAction",
        type: "uint8",
      },
    ],
    name: "setTokenAllowance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "DecreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Execute",
  },
  { type: "event", anonymous: false, inputs: [], name: "FinishMultiCall" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "IncreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
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
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "StartMultiCall",
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
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "WithdrawCollateral",
  },
  { type: "error", inputs: [], name: "BalanceLessThanExpectedException" },
  { type: "error", inputs: [], name: "BorrowAmountOutOfLimitsException" },
  { type: "error", inputs: [], name: "BorrowedBlockLimitException" },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditAccountOwnerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CloseAccountWithEnabledTokensException" },
  { type: "error", inputs: [], name: "CreditAccountNotLiquidatableException" },
  { type: "error", inputs: [], name: "CustomHealthFactorTooLowException" },
  { type: "error", inputs: [], name: "ExpectedBalancesAlreadySetException" },
  { type: "error", inputs: [], name: "ExpectedBalancesNotSetException" },
  { type: "error", inputs: [], name: "ForbiddenInWhitelistedModeException" },
  {
    type: "error",
    inputs: [],
    name: "ForbiddenTokenBalanceIncreasedException",
  },
  { type: "error", inputs: [], name: "ForbiddenTokenEnabledException" },
  { type: "error", inputs: [], name: "ForbiddenTokensException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InvalidCollateralHintException" },
  {
    type: "error",
    inputs: [{ name: "permission", internalType: "uint256", type: "uint256" }],
    name: "NoPermissionException",
  },
  { type: "error", inputs: [], name: "NotAllowedAfterExpirationException" },
  { type: "error", inputs: [], name: "NotAllowedWhenNotExpirableException" },
  { type: "error", inputs: [], name: "NotApprovedBotException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  {
    type: "error",
    inputs: [],
    name: "RemainingTokenBalanceIncreasedException",
  },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "UnexpectedPermissionsException" },
  { type: "error", inputs: [], name: "UnknownMethodException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CreditManagerV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const creditManagerV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_addressProvider", internalType: "address", type: "address" },
      { name: "_pool", internalType: "address", type: "address" },
      { name: "_name", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "accountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "adapterToContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "payer", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addToken",
    outputs: [],
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
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "task", internalType: "enum CollateralCalcTask", type: "uint8" },
    ],
    name: "calcDebtAndCollateral",
    outputs: [
      {
        name: "cdd",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
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
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "collateralTokenByMask",
    outputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "collateralTokensCount",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "contractToAdapter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "creditAccountInfo",
    outputs: [
      { name: "debt", internalType: "uint256", type: "uint256" },
      {
        name: "cumulativeIndexLastUpdate",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "cumulativeQuotaInterest",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "quotaFees", internalType: "uint128", type: "uint128" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "flags", internalType: "uint16", type: "uint16" },
      { name: "lastDebtUpdate", internalType: "uint64", type: "uint64" },
      { name: "borrower", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "offset", internalType: "uint256", type: "uint256" },
      { name: "limit", internalType: "uint256", type: "uint256" },
    ],
    name: "creditAccounts",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccounts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccountsLen",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditConfigurator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditFacade",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "enabledTokensMaskOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "callData", internalType: "bytes", type: "bytes" },
    ],
    name: "externalCall",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fees",
    outputs: [
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationDiscount", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "flagsOf",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "collateralHints", internalType: "uint256[]", type: "uint256[]" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
      { name: "useSafePrices", internalType: "bool", type: "bool" },
    ],
    name: "fullCollateralCheck",
    outputs: [
      {
        name: "enabledTokensMaskAfter",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getActiveCreditAccountOrRevert",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBorrowerOrRevert",
    outputs: [{ name: "borrower", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "getTokenByMask",
    outputs: [{ name: "token", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenMaskOrRevert",
    outputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
    ],
    name: "isLiquidatable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "collateralDebtData",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
          },
        ],
      },
      { name: "to", internalType: "address", type: "address" },
      { name: "isExpired", internalType: "bool", type: "bool" },
    ],
    name: "liquidateCreditAccount",
    outputs: [
      { name: "remainingFunds", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "liquidationThresholds",
    outputs: [{ name: "lt", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "ltParams",
    outputs: [
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "action", internalType: "enum ManageDebtAction", type: "uint8" },
    ],
    name: "manageDebt",
    outputs: [
      { name: "newDebt", internalType: "uint256", type: "uint256" },
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxEnabledTokens",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "onBehalfOf", internalType: "address", type: "address" }],
    name: "openCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotedTokensMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "revocations",
        internalType: "struct RevocationPair[]",
        type: "tuple[]",
        components: [
          { name: "spender", internalType: "address", type: "address" },
          { name: "token", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "revokeAdapterAllowances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "setActiveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "setCollateralTokenData",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "adapter", internalType: "address", type: "address" },
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "setContractAllowance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "setCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditFacade", internalType: "address", type: "address" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationDiscount", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "flag", internalType: "uint16", type: "uint16" },
      { name: "value", internalType: "bool", type: "bool" },
    ],
    name: "setFlagFor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_maxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_priceOracle", internalType: "address", type: "address" },
    ],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_quotedTokensMask", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotedMask",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
      { name: "maxQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetCreditConfigurator",
  },
  { type: "error", inputs: [], name: "ActiveCreditAccountNotSetException" },
  { type: "error", inputs: [], name: "ActiveCreditAccountOverridenException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  { type: "error", inputs: [], name: "CallerNotAdapterException" },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "CloseAccountWithNonZeroDebtException" },
  { type: "error", inputs: [], name: "CreditAccountDoesNotExistException" },
  { type: "error", inputs: [], name: "DebtToZeroWithActiveQuotasException" },
  { type: "error", inputs: [], name: "DebtUpdatedTwiceInOneBlockException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InsufficientRemainingFundsException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "UpdateQuotaOnZeroDebtAccountException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CreditManagerV3_USDT
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const creditManagerV3UsdtAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_addressProvider", internalType: "address", type: "address" },
      { name: "_pool", internalType: "address", type: "address" },
      { name: "_name", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "accountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "adapterToContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "payer", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addToken",
    outputs: [],
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
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "approveToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "task", internalType: "enum CollateralCalcTask", type: "uint8" },
    ],
    name: "calcDebtAndCollateral",
    outputs: [
      {
        name: "cdd",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
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
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "collateralTokenByMask",
    outputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "collateralTokensCount",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "contractToAdapter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "creditAccountInfo",
    outputs: [
      { name: "debt", internalType: "uint256", type: "uint256" },
      {
        name: "cumulativeIndexLastUpdate",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "cumulativeQuotaInterest",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "quotaFees", internalType: "uint128", type: "uint128" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "flags", internalType: "uint16", type: "uint16" },
      { name: "lastDebtUpdate", internalType: "uint64", type: "uint64" },
      { name: "borrower", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "offset", internalType: "uint256", type: "uint256" },
      { name: "limit", internalType: "uint256", type: "uint256" },
    ],
    name: "creditAccounts",
    outputs: [{ name: "result", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccounts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditAccountsLen",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditConfigurator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditFacade",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "enabledTokensMaskOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "target", internalType: "address", type: "address" },
      { name: "callData", internalType: "bytes", type: "bytes" },
    ],
    name: "externalCall",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fees",
    outputs: [
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationDiscount", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "flagsOf",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "collateralHints", internalType: "uint256[]", type: "uint256[]" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
      { name: "useSafePrices", internalType: "bool", type: "bool" },
    ],
    name: "fullCollateralCheck",
    outputs: [
      {
        name: "enabledTokensMaskAfter",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getActiveCreditAccountOrRevert",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getBorrowerOrRevert",
    outputs: [{ name: "borrower", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "getTokenByMask",
    outputs: [{ name: "token", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenMaskOrRevert",
    outputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
    ],
    name: "isLiquidatable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "collateralDebtData",
        internalType: "struct CollateralDebtData",
        type: "tuple",
        components: [
          { name: "debt", internalType: "uint256", type: "uint256" },
          {
            name: "cumulativeIndexNow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeIndexLastUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "cumulativeQuotaInterest",
            internalType: "uint128",
            type: "uint128",
          },
          { name: "accruedInterest", internalType: "uint256", type: "uint256" },
          { name: "accruedFees", internalType: "uint256", type: "uint256" },
          { name: "totalDebtUSD", internalType: "uint256", type: "uint256" },
          { name: "totalValue", internalType: "uint256", type: "uint256" },
          { name: "totalValueUSD", internalType: "uint256", type: "uint256" },
          { name: "twvUSD", internalType: "uint256", type: "uint256" },
          {
            name: "enabledTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokensMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "quotedTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "_poolQuotaKeeper",
            internalType: "address",
            type: "address",
          },
        ],
      },
      { name: "to", internalType: "address", type: "address" },
      { name: "isExpired", internalType: "bool", type: "bool" },
    ],
    name: "liquidateCreditAccount",
    outputs: [
      { name: "remainingFunds", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "liquidationThresholds",
    outputs: [{ name: "lt", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "ltParams",
    outputs: [
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "enabledTokensMask", internalType: "uint256", type: "uint256" },
      { name: "action", internalType: "enum ManageDebtAction", type: "uint8" },
    ],
    name: "manageDebt",
    outputs: [
      { name: "newDebt", internalType: "uint256", type: "uint256" },
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxEnabledTokens",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "onBehalfOf", internalType: "address", type: "address" }],
    name: "openCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotedTokensMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "revocations",
        internalType: "struct RevocationPair[]",
        type: "tuple[]",
        components: [
          { name: "spender", internalType: "address", type: "address" },
          { name: "token", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "revokeAdapterAllowances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "setActiveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "ltInitial", internalType: "uint16", type: "uint16" },
      { name: "ltFinal", internalType: "uint16", type: "uint16" },
      { name: "timestampRampStart", internalType: "uint40", type: "uint40" },
      { name: "rampDuration", internalType: "uint24", type: "uint24" },
    ],
    name: "setCollateralTokenData",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "adapter", internalType: "address", type: "address" },
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "setContractAllowance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "setCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditFacade", internalType: "address", type: "address" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationDiscount", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "flag", internalType: "uint16", type: "uint16" },
      { name: "value", internalType: "bool", type: "bool" },
    ],
    name: "setFlagFor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_maxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_priceOracle", internalType: "address", type: "address" },
    ],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_quotedTokensMask", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotedMask",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
      { name: "maxQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
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
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetCreditConfigurator",
  },
  { type: "error", inputs: [], name: "ActiveCreditAccountNotSetException" },
  { type: "error", inputs: [], name: "ActiveCreditAccountOverridenException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  { type: "error", inputs: [], name: "CallerNotAdapterException" },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "CloseAccountWithNonZeroDebtException" },
  { type: "error", inputs: [], name: "CreditAccountDoesNotExistException" },
  { type: "error", inputs: [], name: "DebtToZeroWithActiveQuotasException" },
  { type: "error", inputs: [], name: "DebtUpdatedTwiceInOneBlockException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InsufficientRemainingFundsException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "UpdateQuotaOnZeroDebtAccountException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter2Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter2AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter3Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter3AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[3]", type: "uint256[3]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1Adapter4Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1Adapter4AssetsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[4]", type: "uint256[4]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterDeposit
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterDepositAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curveDeposit", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_nCoins", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterStETH
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterStEthAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      {
        name: "_curveStETHPoolGateway",
        internalType: "address",
        type: "address",
      },
      { name: "_lp_token", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CurveV1AdapterStableNG
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curveV1AdapterStableNgAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_curvePool", internalType: "address", type: "address" },
      { name: "_lp_token", internalType: "address", type: "address" },
      { name: "_metapoolBase", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "add_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_add_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_diff_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
      { name: "min_dy", internalType: "uint256", type: "uint256" },
    ],
    name: "exchange_underlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lpTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lp_token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "metapoolBase",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "nCoins",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_diff_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "remove_liquidity",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "minAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying0Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying1Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying2Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying3Mask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "use256",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DegenNFTV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const degenNftv2Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_addressProvider", internalType: "address", type: "address" },
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_acl",
    outputs: [{ name: "", internalType: "contract IACL", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade_", internalType: "address", type: "address" },
    ],
    name: "addCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isSupportedCreditFacade",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "minter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade_", internalType: "address", type: "address" },
    ],
    name: "removeCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "baseURI_", internalType: "string", type: "string" }],
    name: "setBaseUri",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "minter_", internalType: "address", type: "address" }],
    name: "setMinter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
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
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewMinterSet",
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
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnPausableAdminException" },
  {
    type: "error",
    inputs: [],
    name: "CreditFacadeOrConfiguratorOnlyException",
  },
  { type: "error", inputs: [], name: "InsufficientBalanceException" },
  { type: "error", inputs: [], name: "InvalidCreditFacadeException" },
  { type: "error", inputs: [], name: "MinterOnlyException" },
  { type: "error", inputs: [], name: "NotImplementedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "name_", internalType: "string", type: "string" },
      { name: "symbol_", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
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
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC4626Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc4626AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "asset",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "assetMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "redeemDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "sharesMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Faucet
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const faucetAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
      { name: "_assets", internalType: "address[]", type: "address[]" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "assets",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amountUSD", internalType: "uint256", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "minAmountUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "prices",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "scales",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GaugeV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gaugeV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_pool", internalType: "address", type: "address" },
      { name: "_gearStaking", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "addQuotaToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMaxRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "minRate", internalType: "uint16", type: "uint16" },
    ],
    name: "changeQuotaMinRate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochFrozen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "epochLastUpdate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokens", internalType: "address[]", type: "address[]" }],
    name: "getRates",
    outputs: [{ name: "rates", internalType: "uint16[]", type: "uint16[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAdded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "quotaRateParams",
    outputs: [
      { name: "minRate", internalType: "uint16", type: "uint16" },
      { name: "maxRate", internalType: "uint16", type: "uint16" },
      { name: "totalVotesLpSide", internalType: "uint96", type: "uint96" },
      { name: "totalVotesCaSide", internalType: "uint96", type: "uint96" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "status", internalType: "bool", type: "bool" }],
    name: "setFrozenEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "unvote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateEpoch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "userTokenVotes",
    outputs: [
      { name: "votesLpSide", internalType: "uint96", type: "uint96" },
      { name: "votesCaSide", internalType: "uint96", type: "uint96" },
    ],
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
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "voter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "AddQuotaToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
      { name: "status", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetFrozenEpoch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "minRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
      {
        name: "maxRate",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "SetQuotaTokenParams",
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
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Unvote",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "epochNow",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "UpdateEpoch",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "votes", internalType: "uint96", type: "uint96", indexed: false },
      { name: "lpSide", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "Vote",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotVoterException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InsufficientVotesException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GearStakingV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gearStakingV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_addressProvider", internalType: "address", type: "address" },
      {
        name: "_firstEpochTimestamp",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
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
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
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
    name: "unpause",
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
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotMigratorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "IncompatibleSuccessorException" },
  { type: "error", inputs: [], name: "InsufficientBalanceException" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
  { type: "error", inputs: [], name: "VotingContractNotAllowedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IArbToken
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iArbTokenAbi = [
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "bridgeBurn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "bridgeMint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "l1Address",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2Abi = [
  {
    type: "function",
    inputs: [
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "state", internalType: "bool", type: "bool" },
    ],
    name: "approveAccountTransfer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "blacklistHelper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "calcCreditAccountHealthFactor",
    outputs: [{ name: "hf", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "calcTotalValue",
    outputs: [
      { name: "total", internalType: "uint256", type: "uint256" },
      { name: "twv", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [
      { name: "", internalType: "contract ICreditManagerV2", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "degenNFT",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "borrower", internalType: "address", type: "address" }],
    name: "hasOpenedCreditAccount",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isBlacklistableUnderlying",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isTokenAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "limits",
    outputs: [
      { name: "minBorrowedAmount", internalType: "uint128", type: "uint128" },
      { name: "maxBorrowedAmount", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExpiredCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExpiredCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "lossParams",
    outputs: [
      {
        name: "currentCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "maxCumulativeLoss", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "multicall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "leverageFactor", internalType: "uint16", type: "uint16" },
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "openCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "openCreditAccountMulticall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "params",
    outputs: [
      {
        name: "maxBorrowedAmountPerBlock",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "isIncreaseDebtForbidden", internalType: "bool", type: "bool" },
      { name: "expirationDate", internalType: "uint40", type: "uint40" },
      {
        name: "emergencyLiquidationDiscount",
        internalType: "uint16",
        type: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebt",
    outputs: [
      { name: "currentTotalDebt", internalType: "uint128", type: "uint128" },
      { name: "totalDebtLimit", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "transferAccountOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "transfersAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "blacklistHelper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BlacklistHelperSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "DecreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "IncreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurLossOnLiquidation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateExpiredCreditAccount",
  },
  { type: "event", anonymous: false, inputs: [], name: "MultiCallFinished" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "MultiCallStarted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "referralCode",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TokenDisabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TokenEnabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldOwner",
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
    name: "TransferAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "state", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TransferAccountAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "UnderlyingSentToBlacklistHelper",
  },
  { type: "error", inputs: [], name: "AccountTransferNotAllowedException" },
  {
    type: "error",
    inputs: [],
    name: "ActionProhibitedWithForbiddenTokensException",
  },
  { type: "error", inputs: [], name: "AdaptersOrCreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "BalanceLessThanMinimumDesiredException",
  },
  { type: "error", inputs: [], name: "BorrowAmountOutOfLimitsException" },
  { type: "error", inputs: [], name: "BorrowedBlockLimitException" },
  { type: "error", inputs: [], name: "CantLiquidateNonExpiredException" },
  {
    type: "error",
    inputs: [],
    name: "CantLiquidateWithSuchHealthFactorException",
  },
  {
    type: "error",
    inputs: [],
    name: "CantTransferLiquidatableAccountException",
  },
  { type: "error", inputs: [], name: "CreditConfiguratorOnlyException" },
  { type: "error", inputs: [], name: "CreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "ExpectedBalancesAlreadySetException" },
  { type: "error", inputs: [], name: "ForbiddenDuringClosureException" },
  { type: "error", inputs: [], name: "HasNoOpenedAccountException" },
  { type: "error", inputs: [], name: "IncorrectCallDataException" },
  {
    type: "error",
    inputs: [],
    name: "IncreaseAndDecreaseForbiddenInOneCallException",
  },
  { type: "error", inputs: [], name: "IncreaseDebtForbiddenException" },
  { type: "error", inputs: [], name: "LiquiditySanityCheckException" },
  {
    type: "error",
    inputs: [],
    name: "NotAllowedForBlacklistedAddressException",
  },
  { type: "error", inputs: [], name: "NotAllowedInWhitelistedMode" },
  { type: "error", inputs: [], name: "NotAllowedWhenNotExpirableException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  {
    type: "error",
    inputs: [],
    name: "OpenAccountNotAllowedAfterExpirationException",
  },
  { type: "error", inputs: [], name: "ReentrancyLockException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "UnknownMethodException" },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressOrUserAlreadyHasAccountException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "blacklistHelper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BlacklistHelperSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "DecreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "IncreaseBorrowedAmount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurLossOnLiquidation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateExpiredCreditAccount",
  },
  { type: "event", anonymous: false, inputs: [], name: "MultiCallFinished" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "MultiCallStarted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "referralCode",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TokenDisabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TokenEnabled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldOwner",
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
    name: "TransferAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      { name: "state", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "TransferAccountAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "borrower",
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
    name: "UnderlyingSentToBlacklistHelper",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2ExceptionsAbi = [
  { type: "error", inputs: [], name: "AccountTransferNotAllowedException" },
  {
    type: "error",
    inputs: [],
    name: "ActionProhibitedWithForbiddenTokensException",
  },
  { type: "error", inputs: [], name: "AdaptersOrCreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "BalanceLessThanMinimumDesiredException",
  },
  { type: "error", inputs: [], name: "BorrowAmountOutOfLimitsException" },
  { type: "error", inputs: [], name: "BorrowedBlockLimitException" },
  { type: "error", inputs: [], name: "CantLiquidateNonExpiredException" },
  {
    type: "error",
    inputs: [],
    name: "CantLiquidateWithSuchHealthFactorException",
  },
  {
    type: "error",
    inputs: [],
    name: "CantTransferLiquidatableAccountException",
  },
  { type: "error", inputs: [], name: "CreditConfiguratorOnlyException" },
  { type: "error", inputs: [], name: "CreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "ExpectedBalancesAlreadySetException" },
  { type: "error", inputs: [], name: "ForbiddenDuringClosureException" },
  { type: "error", inputs: [], name: "HasNoOpenedAccountException" },
  { type: "error", inputs: [], name: "IncorrectCallDataException" },
  {
    type: "error",
    inputs: [],
    name: "IncreaseAndDecreaseForbiddenInOneCallException",
  },
  { type: "error", inputs: [], name: "IncreaseDebtForbiddenException" },
  { type: "error", inputs: [], name: "LiquiditySanityCheckException" },
  {
    type: "error",
    inputs: [],
    name: "NotAllowedForBlacklistedAddressException",
  },
  { type: "error", inputs: [], name: "NotAllowedInWhitelistedMode" },
  { type: "error", inputs: [], name: "NotAllowedWhenNotExpirableException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  {
    type: "error",
    inputs: [],
    name: "OpenAccountNotAllowedAfterExpirationException",
  },
  { type: "error", inputs: [], name: "ReentrancyLockException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "UnknownMethodException" },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressOrUserAlreadyHasAccountException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2Extended
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2ExtendedAbi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "decreaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "disableToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "enableToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "increaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "expected",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "revertIfReceivedLessThan",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV2V2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV2V2Abi = [
  {
    type: "function",
    inputs: [],
    name: "params",
    outputs: [
      {
        name: "maxBorrowedAmountPerBlock",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "isIncreaseDebtForbidden", internalType: "bool", type: "bool" },
      { name: "expirationDate", internalType: "uint40", type: "uint40" },
    ],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "botList",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "botMulticall",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "canLiquidateWhilePaused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "debtLimits",
    outputs: [
      { name: "minDebt", internalType: "uint128", type: "uint128" },
      { name: "maxDebt", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "degenNFT",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expirationDate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "forbiddenTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "lossParams",
    outputs: [
      {
        name: "currentCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "maxCumulativeLoss", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxDebtPerBlockMultiplier",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxQuotaMultiplier",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "multicall",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "onBehalfOf", internalType: "address", type: "address" },
      {
        name: "calls",
        internalType: "struct MultiCall[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "openCreditAccount",
    outputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "newBotList", internalType: "address", type: "address" }],
    name: "setBotList",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "bot", internalType: "address", type: "address" },
      { name: "permissions", internalType: "uint192", type: "uint192" },
    ],
    name: "setBotPermissions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newMaxCumulativeLoss",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "resetCumulativeLoss", internalType: "bool", type: "bool" },
    ],
    name: "setCumulativeLossParams",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newMinDebt", internalType: "uint128", type: "uint128" },
      { name: "newMaxDebt", internalType: "uint128", type: "uint128" },
      {
        name: "newMaxDebtPerBlockMultiplier",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setDebtLimits",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "liquidator", internalType: "address", type: "address" },
      {
        name: "allowance",
        internalType: "enum AllowanceAction",
        type: "uint8",
      },
    ],
    name: "setEmergencyLiquidator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newExpirationDate", internalType: "uint40", type: "uint40" },
    ],
    name: "setExpirationDate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      {
        name: "allowance",
        internalType: "enum AllowanceAction",
        type: "uint8",
      },
    ],
    name: "setTokenAllowance",
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
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "DecreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Execute",
  },
  { type: "event", anonymous: false, inputs: [], name: "FinishMultiCall" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "IncreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "StartMultiCall",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "WithdrawCollateral",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
    name: "AddCollateral",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrower",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CloseCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "DecreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "targetContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Execute",
  },
  { type: "event", anonymous: false, inputs: [], name: "FinishMultiCall" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
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
    name: "IncreaseDebt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "liquidator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "remainingFunds",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LiquidateCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "OpenCreditAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "StartMultiCall",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
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
      { name: "to", internalType: "address", type: "address", indexed: false },
    ],
    name: "WithdrawCollateral",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditFacadeV3Multicall
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditFacadeV3MulticallAbi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "addCollateralWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "compareBalances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "decreaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "disableToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "enableToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "increaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "onDemandPriceUpdate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "revocations",
        internalType: "struct RevocationPair[]",
        type: "tuple[]",
        components: [
          { name: "spender", internalType: "address", type: "address" },
          { name: "token", internalType: "address", type: "address" },
        ],
      },
    ],
    name: "revokeAdapterAllowances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "collateralHints", internalType: "uint256[]", type: "uint256[]" },
      { name: "minHealthFactor", internalType: "uint16", type: "uint16" },
    ],
    name: "setFullCheckParams",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "balanceDeltas",
        internalType: "struct BalanceDelta[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "amount", internalType: "int256", type: "int256" },
        ],
      },
    ],
    name: "storeExpectedBalances",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "quotaChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenNFTV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenNftv2Abi = [
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "operator", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "minter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "owner", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
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
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
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
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
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
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewMinterSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "error",
    inputs: [],
    name: "CreditFacadeOrConfiguratorOnlyException",
  },
  { type: "error", inputs: [], name: "InsufficientBalanceException" },
  { type: "error", inputs: [], name: "InvalidCreditFacadeException" },
  { type: "error", inputs: [], name: "MinterOnlyException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenNFTV2Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenNftv2EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewCreditFacadeRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewMinterSet",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenNFTV2Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenNftv2ExceptionsAbi = [
  {
    type: "error",
    inputs: [],
    name: "CreditFacadeOrConfiguratorOnlyException",
  },
  { type: "error", inputs: [], name: "InsufficientBalanceException" },
  { type: "error", inputs: [], name: "InvalidCreditFacadeException" },
  { type: "error", inputs: [], name: "MinterOnlyException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20Abi = [
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILegacyMintableERC20
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLegacyMintableErc20Abi = [
  {
    type: "function",
    inputs: [
      { name: "_from", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "l1Token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_to", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IOptimismMintableERC20
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iOptimismMintableErc20Abi = [
  {
    type: "function",
    inputs: [],
    name: "bridge",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_from", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_to", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "remoteToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
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
    inputs: [],
    name: "asset",
    outputs: [
      { name: "assetTokenAddress", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "availableLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    name: "baseInterestIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestIndexLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowable",
    outputs: [{ name: "borrowable", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidityLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "interestRateModel",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastBaseInterestUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRevenueUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "lendCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "maxDeposit",
    outputs: [{ name: "maxAssets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "maxMint",
    outputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxRedeem",
    outputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ name: "maxAssets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "mintWithReferral",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewMint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    name: "repayCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newPoolQuotaKeeper", internalType: "address", type: "address" },
    ],
    name: "setPoolQuotaKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newQuotaRevenue", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotaRevenue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint256", type: "uint256" }],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newWithdrawFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "supplyRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalAssets",
    outputs: [
      { name: "totalManagedAssets", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "quotaRevenueDelta", internalType: "int256", type: "int256" },
    ],
    name: "updateQuotaRevenue",
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
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
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
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
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
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdraw",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
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
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceFeed
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceFeedAbi = [
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "answer", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "updatedAt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeedType",
    outputs: [{ name: "", internalType: "enum PriceFeedType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "skipPriceCheck",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "convert",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertFromUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "getPriceRaw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPriceSafe",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedParams",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint8", type: "uint8" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "priceFeedsRaw",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "safeConvertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
    name: "setPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
    ],
    name: "setReservePriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    name: "setReservePriceFeedStatus",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
      { name: "trusted", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "active", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeedStatus",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
      { name: "trusted", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "active", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeedStatus",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUpdatablePriceFeed
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUpdatablePriceFeedAbi = [
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "answer", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "updatedAt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeedType",
    outputs: [{ name: "", internalType: "enum PriceFeedType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "skipPriceCheck",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updatable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "data", internalType: "bytes", type: "bytes" }],
    name: "updatePrice",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVersion
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVersionAbi = [
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iZapperAbi = [
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// InflationAttackBlocker
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const inflationAttackBlockerAbi = [
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "mintDeadShares",
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
    inputs: [],
    name: "renounceOwnership",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// InsolvencyChecker
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const insolvencyCheckerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_dataCompressor", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "priceUpdates",
        internalType: "struct PriceOnDemand[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "checkAllPoolsV3",
    outputs: [
      {
        name: "check",
        internalType: "struct InsolvencyPoolCheck[]",
        type: "tuple[]",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          { name: "pool", internalType: "address", type: "address" },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "realLiquidity", internalType: "uint256", type: "uint256" },
          { name: "tvl", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct PriceOnDemand[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "checkPoolV3",
    outputs: [
      {
        name: "result",
        internalType: "struct InsolvencyPoolCheck",
        type: "tuple",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          { name: "pool", internalType: "address", type: "address" },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "realLiquidity", internalType: "uint256", type: "uint256" },
          { name: "tvl", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "dataCompressor",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LidoV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lidoV1AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_lidoGateway", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETHTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "submit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "submitDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "weth",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "wethTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LinearInterestRateModelV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const linearInterestRateModelV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "U_1", internalType: "uint16", type: "uint16" },
      { name: "U_2", internalType: "uint16", type: "uint16" },
      { name: "R_base", internalType: "uint16", type: "uint16" },
      { name: "R_slope1", internalType: "uint16", type: "uint16" },
      { name: "R_slope2", internalType: "uint16", type: "uint16" },
      { name: "R_slope3", internalType: "uint16", type: "uint16" },
      {
        name: "_isBorrowingMoreU2Forbidden",
        internalType: "bool",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "R_base_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "R_slope1_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "R_slope2_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "R_slope3_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "U_1_WAD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "U_2_WAD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
    ],
    name: "availableToBorrow",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
      { name: "checkOptimalBorrowing", internalType: "bool", type: "bool" },
    ],
    name: "calcBorrowRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "expectedLiquidity", internalType: "uint256", type: "uint256" },
      { name: "availableLiquidity", internalType: "uint256", type: "uint256" },
    ],
    name: "calcBorrowRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getModelParameters",
    outputs: [
      { name: "U_1", internalType: "uint16", type: "uint16" },
      { name: "U_2", internalType: "uint16", type: "uint16" },
      { name: "R_base", internalType: "uint16", type: "uint16" },
      { name: "R_slope1", internalType: "uint16", type: "uint16" },
      { name: "R_slope2", internalType: "uint16", type: "uint16" },
      { name: "R_slope3", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isBorrowingMoreU2Forbidden",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "BorrowingMoreThanU2ForbiddenException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PartialLiquidationBotV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const partialLiquidationBotV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
      { name: "minHealthFactor_", internalType: "uint16", type: "uint16" },
      { name: "maxHealthFactor_", internalType: "uint16", type: "uint16" },
      { name: "premiumScaleFactor_", internalType: "uint16", type: "uint16" },
      { name: "feeScaleFactor_", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "feeScaleFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "seizedAmount", internalType: "uint256", type: "uint256" },
      { name: "maxRepaidAmount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct IPartialLiquidationBotV3.PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExactCollateral",
    outputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "minSeizedAmount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
      {
        name: "priceUpdates",
        internalType: "struct IPartialLiquidationBotV3.PriceUpdate[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "reserve", internalType: "bool", type: "bool" },
          { name: "data", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "liquidateExactDebt",
    outputs: [
      { name: "seizedAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxHealthFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "minHealthFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "premiumScaleFactor",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "repaidDebt",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "seizedCollateral",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "LiquidatePartial",
  },
  { type: "error", inputs: [], name: "CreditAccountNotLiquidatableException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "LiquidatedLessThanNeededException" },
  { type: "error", inputs: [], name: "LiquidatedMoreThanNeededException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "RepaidMoreThanAllowedException" },
  { type: "error", inputs: [], name: "SeizedLessThanRequiredException" },
  { type: "error", inputs: [], name: "UnderlyingNotLiquidatableException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PoolQuotaKeeperV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const poolQuotaKeeperV3Abi = [
  {
    type: "constructor",
    inputs: [{ name: "_pool", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
    ],
    name: "accrueQuotaInterest",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
    ],
    name: "addCreditManager",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "addQuotaToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "cumulativeIndex",
    outputs: [{ name: "", internalType: "uint192", type: "uint192" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "gauge",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getQuota",
    outputs: [
      { name: "quota", internalType: "uint96", type: "uint96" },
      { name: "cumulativeIndexLU", internalType: "uint192", type: "uint192" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "getQuotaAndOutstandingInterest",
    outputs: [
      { name: "quoted", internalType: "uint96", type: "uint96" },
      { name: "outstandingInterest", internalType: "uint128", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getQuotaRate",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getTokenQuotaParams",
    outputs: [
      { name: "rate", internalType: "uint16", type: "uint16" },
      { name: "cumulativeIndexLU", internalType: "uint192", type: "uint192" },
      { name: "quotaIncreaseFee", internalType: "uint16", type: "uint16" },
      { name: "totalQuoted", internalType: "uint96", type: "uint96" },
      { name: "limit", internalType: "uint96", type: "uint96" },
      { name: "isActive", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "isQuotedToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRateUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaRevenue",
    outputs: [
      { name: "quotaRevenue", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotedTokens",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "tokens", internalType: "address[]", type: "address[]" },
      { name: "setLimitsToZero", internalType: "bool", type: "bool" },
    ],
    name: "removeQuotas",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_gauge", internalType: "address", type: "address" }],
    name: "setGauge",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "limit", internalType: "uint96", type: "uint96" },
    ],
    name: "setTokenLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "fee", internalType: "uint16", type: "uint16" },
    ],
    name: "setTokenQuotaIncreaseFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "requestedChange", internalType: "int96", type: "int96" },
      { name: "minQuota", internalType: "uint96", type: "uint96" },
      { name: "maxQuota", internalType: "uint96", type: "uint96" },
    ],
    name: "updateQuota",
    outputs: [
      {
        name: "caQuotaInterestChange",
        internalType: "uint128",
        type: "uint128",
      },
      { name: "fees", internalType: "uint128", type: "uint128" },
      { name: "enableToken", internalType: "bool", type: "bool" },
      { name: "disableToken", internalType: "bool", type: "bool" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateRates",
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddQuotaToken",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "newGauge",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetGauge",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "fee", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "SetQuotaIncreaseFee",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "limit", internalType: "uint96", type: "uint96", indexed: false },
    ],
    name: "SetTokenLimit",
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
    anonymous: false,
    inputs: [
      {
        name: "creditAccount",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "quotaChange",
        internalType: "int96",
        type: "int96",
        indexed: false,
      },
    ],
    name: "UpdateQuota",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "rate", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "UpdateTokenQuotaRate",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotCreditManagerException" },
  { type: "error", inputs: [], name: "CallerNotGaugeException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "IncompatibleCreditManagerException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "QuotaIsOutOfBoundsException" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenIsNotQuotedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PoolV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const poolV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider_", internalType: "address", type: "address" },
      { name: "underlyingToken_", internalType: "address", type: "address" },
      { name: "interestRateModel_", internalType: "address", type: "address" },
      { name: "totalDebtLimit_", internalType: "uint256", type: "uint256" },
      { name: "name_", internalType: "string", type: "string" },
      { name: "symbol_", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "asset",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "availableLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    name: "baseInterestIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestIndexLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowable",
    outputs: [{ name: "borrowable", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", internalType: "bytes1", type: "bytes1" },
      { name: "name", internalType: "string", type: "string" },
      { name: "version", internalType: "string", type: "string" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "verifyingContract", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "extensions", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidityLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "interestRateModel",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastBaseInterestUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRevenueUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "lendCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "maxDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "maxMint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxRedeem",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "mintWithReferral",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewMint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    name: "repayCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newPoolQuotaKeeper", internalType: "address", type: "address" },
    ],
    name: "setPoolQuotaKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newQuotaRevenue", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotaRevenue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint256", type: "uint256" }],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newWithdrawFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "supplyRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "quotaRevenueDelta", internalType: "int256", type: "int256" },
    ],
    name: "updateQuotaRevenue",
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
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
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
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposit",
  },
  { type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
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
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdraw",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotCreditManagerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotPoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CreditManagerCantBorrowException" },
  { type: "error", inputs: [], name: "IncompatibleCreditManagerException" },
  { type: "error", inputs: [], name: "IncompatiblePoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InvalidShortString" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
  {
    type: "error",
    inputs: [{ name: "str", internalType: "string", type: "string" }],
    name: "StringTooLong",
  },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PoolV3_USDT
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const poolV3UsdtAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider_", internalType: "address", type: "address" },
      { name: "underlyingToken_", internalType: "address", type: "address" },
      { name: "interestRateModel_", internalType: "address", type: "address" },
      { name: "totalDebtLimit_", internalType: "uint256", type: "uint256" },
      { name: "name_", internalType: "string", type: "string" },
      { name: "symbol_", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "asset",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "availableLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    name: "baseInterestIndex",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestIndexLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "baseInterestRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowable",
    outputs: [{ name: "borrowable", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "creditManagerDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "subtractedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", internalType: "bytes1", type: "bytes1" },
      { name: "name", internalType: "string", type: "string" },
      { name: "version", internalType: "string", type: "string" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "verifyingContract", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "extensions", internalType: "uint256[]", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "expectedLiquidityLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "addedValue", internalType: "uint256", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "interestRateModel",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastBaseInterestUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastQuotaRevenueUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "lendCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "maxDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "maxMint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxRedeem",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "mintWithReferral",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewMint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "quotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "repaidAmount", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    name: "repayCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "newLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setCreditManagerDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
      },
    ],
    name: "setInterestRateModel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newPoolQuotaKeeper", internalType: "address", type: "address" },
    ],
    name: "setPoolQuotaKeeper",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newQuotaRevenue", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuotaRevenue",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint256", type: "uint256" }],
    name: "setTotalDebtLimit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newWithdrawFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "supplyRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalBorrowed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalDebtLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlyingToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "quotaRevenueDelta", internalType: "int256", type: "int256" },
    ],
    name: "updateQuotaRevenue",
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
    inputs: [
      { name: "assets", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddCreditManager",
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
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creditAccount",
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
    name: "Borrow",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposit",
  },
  { type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IncurUncoveredLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "onBehalfOf",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Refer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "borrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "profit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Repay",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creditManager",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetCreditManagerDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newInterestRateModel",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPoolQuotaKeeper",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetPoolQuotaKeeper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "limit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "SetWithdrawFee",
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
    anonymous: false,
    inputs: [
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "assets",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "shares",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdraw",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotCreditManagerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotPoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CreditManagerCantBorrowException" },
  { type: "error", inputs: [], name: "IncompatibleCreditManagerException" },
  { type: "error", inputs: [], name: "IncompatiblePoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "InvalidShortString" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
  {
    type: "error",
    inputs: [{ name: "str", internalType: "string", type: "string" }],
    name: "StringTooLong",
  },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PriceFeedMultiplier
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const priceFeedMultiplierAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_priceFeed", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "answer", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "updatedAt", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeedType",
    outputs: [{ name: "", internalType: "enum PriceFeedType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newMultipilier", internalType: "int256", type: "int256" },
    ],
    name: "setMultipilier",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "skipPriceCheck",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PriceOracleV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const priceOracleV3Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "addressProvider", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "controller",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "convert",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertFromUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "convertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPrice",
    outputs: [{ name: "price", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "getPriceRaw",
    outputs: [{ name: "price", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getPriceSafe",
    outputs: [{ name: "price", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedParams",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint8", type: "uint8" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "reserve", internalType: "bool", type: "bool" },
    ],
    name: "priceFeedsRaw",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "safeConvertToUSD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newController", internalType: "address", type: "address" },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
      { name: "trusted", internalType: "bool", type: "bool" },
    ],
    name: "setPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
    ],
    name: "setReservePriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "active", internalType: "bool", type: "bool" },
    ],
    name: "setReservePriceFeedStatus",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
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
        name: "newController",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "NewController",
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
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
      { name: "trusted", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "priceFeed",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "stalenessPeriod",
        internalType: "uint32",
        type: "uint32",
        indexed: false,
      },
      { name: "skipCheck", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "active", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetReservePriceFeedStatus",
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
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectPriceFeedException" },
  { type: "error", inputs: [], name: "IncorrectTokenContractException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  { type: "error", inputs: [], name: "StalePriceException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenStealer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenStealerAbi = [
  {
    type: "function",
    inputs: [
      { name: "faucet", internalType: "address", type: "address" },
      { name: "_assets", internalType: "address[]", type: "address[]" },
    ],
    name: "steal",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UnderlyingDepositZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const underlyingDepositZapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "depositWithPermit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "depositWithReferralAndPermit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UnderlyingFarmingZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const underlyingFarmingZapperAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "farmingPool", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "depositWithPermit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "depositWithReferralAndPermit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV2AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
    ],
    name: "isPairAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pairs",
        internalType: "struct UniswapV2PairStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "setPairStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "amountOutMin", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountOut", internalType: "uint256", type: "uint256" },
      { name: "amountInMax", internalType: "uint256", type: "uint256" },
      { name: "path", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPairStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV3AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct IUniswapV3AdapterTypes.ExactDiffInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactDiffInput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType:
          "struct IUniswapV3AdapterTypes.ExactDiffInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
          { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactDiffInputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ISwapRouter.ExactInputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "exactInput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "amountOutMinimum",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactInputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ISwapRouter.ExactOutputParams",
        type: "tuple",
        components: [
          { name: "path", internalType: "bytes", type: "bytes" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "exactOutput",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "params",
        internalType: "struct ISwapRouter.ExactOutputSingleParams",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "recipient", internalType: "address", type: "address" },
          { name: "deadline", internalType: "uint256", type: "uint256" },
          { name: "amountOut", internalType: "uint256", type: "uint256" },
          { name: "amountInMaximum", internalType: "uint256", type: "uint256" },
          {
            name: "sqrtPriceLimitX96",
            internalType: "uint160",
            type: "uint160",
          },
        ],
      },
    ],
    name: "exactOutputSingle",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
      { name: "fee", internalType: "uint24", type: "uint24" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct UniswapV3PoolStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "fee", internalType: "uint24", type: "uint24" },
          { name: "allowed", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "setPoolStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "fee", internalType: "uint24", type: "uint24", indexed: true },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VelodromeV2RouterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const velodromeV2RouterAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_router", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token0", internalType: "address", type: "address" },
      { name: "token1", internalType: "address", type: "address" },
      { name: "stable", internalType: "bool", type: "bool" },
      { name: "factory", internalType: "address", type: "address" },
    ],
    name: "isPoolAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pools",
        internalType: "struct VelodromeV2PoolStatus[]",
        type: "tuple[]",
        components: [
          { name: "token0", internalType: "address", type: "address" },
          { name: "token1", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
          { name: "allowed", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "setPoolStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "rateMinRAY", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
        ],
      },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapDiffTokensForTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amountIn", internalType: "uint256", type: "uint256" },
      { name: "amountOutMin", internalType: "uint256", type: "uint256" },
      {
        name: "routes",
        internalType: "struct Route[]",
        type: "tuple[]",
        components: [
          { name: "from", internalType: "address", type: "address" },
          { name: "to", internalType: "address", type: "address" },
          { name: "stable", internalType: "bool", type: "bool" },
          { name: "factory", internalType: "address", type: "address" },
        ],
      },
      { name: "", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "token0",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "token1",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "stable", internalType: "bool", type: "bool", indexed: false },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetPoolStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "InvalidPathException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETHDepositZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wethDepositZapperAbi = [
  {
    type: "constructor",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "deposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "ReceiveIsNotAllowedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETHFarmingZapper
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wethFarmingZapperAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "farmingPool", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "deposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "receiver", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "depositWithReferral",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewDeposit",
    outputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "previewRedeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenOutAmount", internalType: "uint256", type: "uint256" },
      { name: "receiver", internalType: "address", type: "address" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "redeemWithPermit",
    outputs: [
      { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenIn",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenOut",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "underlying",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "ReceiveIsNotAllowedException" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WstETHV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wstEthv1AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_wstETH", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stETHTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "unwrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrapDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "wrap",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "wrapDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "wstETHTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const yearnV2AdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_vault", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "tokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "maxLoss", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "yTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

export const iMellowVaultAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
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
    name: "deposit",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "amounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "minLpAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
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
    name: "depositOneAsset",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minLpAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
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
    name: "depositOneAssetDiff",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rateMinRAY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
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
    name: "isUnderlyingAllowed",
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
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setUnderlyingStatusBatch",
    inputs: [
      {
        name: "underlyings",
        type: "tuple[]",
        internalType: "struct MellowUnderlyingStatus[]",
        components: [
          {
            name: "underlying",
            type: "address",
            internalType: "address",
          },
          {
            name: "allowed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    type: "event",
    name: "SetUnderlyingStatus",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newStatus",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IncorrectArrayLengthException",
    inputs: [],
  },
  {
    type: "error",
    name: "UnderlyingNotAllowedException",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "UnderlyingNotFoundException",
    inputs: [
      {
        name: "asset",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;

export const iPendleRouterAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
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
    name: "getAllowedPairs",
    inputs: [],
    outputs: [
      {
        name: "pairs",
        type: "tuple[]",
        internalType: "struct PendlePairStatus[]",
        components: [
          {
            name: "market",
            type: "address",
            internalType: "address",
          },
          {
            name: "inputToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PendleStatus",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isPairAllowed",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "inputToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "pendleToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "status",
        type: "uint8",
        internalType: "enum PendleStatus",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ptToMarket",
    inputs: [
      {
        name: "pt",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemDiffPyToToken",
    inputs: [
      {
        name: "yt",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverPt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenDiffOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minRateRAY",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "redeemPyToToken",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "yt",
        type: "address",
        internalType: "address",
      },
      {
        name: "netPyIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minTokenOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenRedeemSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
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
    name: "setPairStatusBatch",
    inputs: [
      {
        name: "pairs",
        type: "tuple[]",
        internalType: "struct PendlePairStatus[]",
        components: [
          {
            name: "market",
            type: "address",
            internalType: "address",
          },
          {
            name: "inputToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PendleStatus",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiffPtForToken",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "leftoverPt",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "diffOutput",
        type: "tuple",
        internalType: "struct TokenDiffOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minRateRAY",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "swapDiffTokenForPt",
    inputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "minRateRAY",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "guessPtOut",
        type: "tuple",
        internalType: "struct ApproxParams",
        components: [
          {
            name: "guessMin",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessMax",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessOffchain",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxIteration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "diffInput",
        type: "tuple",
        internalType: "struct TokenDiffInput",
        components: [
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "leftoverTokenIn",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "swapExactPtForToken",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "exactPtIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "output",
        type: "tuple",
        internalType: "struct TokenOutput",
        components: [
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "minTokenOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenRedeemSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
      {
        name: "limit",
        type: "tuple",
        internalType: "struct LimitOrderData",
        components: [
          {
            name: "limitRouter",
            type: "address",
            internalType: "address",
          },
          {
            name: "epsSkipMarket",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "normalFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "optData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
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
    name: "swapExactTokenForPt",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "minPtOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "guessPtOut",
        type: "tuple",
        internalType: "struct ApproxParams",
        components: [
          {
            name: "guessMin",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessMax",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "guessOffchain",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxIteration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eps",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "input",
        type: "tuple",
        internalType: "struct TokenInput",
        components: [
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "netTokenIn",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenMintSy",
            type: "address",
            internalType: "address",
          },
          {
            name: "pendleSwap",
            type: "address",
            internalType: "address",
          },
          {
            name: "swapData",
            type: "tuple",
            internalType: "struct SwapData",
            components: [
              {
                name: "swapType",
                type: "uint8",
                internalType: "enum SwapType",
              },
              {
                name: "extRouter",
                type: "address",
                internalType: "address",
              },
              {
                name: "extCalldata",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "needScale",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
        ],
      },
      {
        name: "limit",
        type: "tuple",
        internalType: "struct LimitOrderData",
        components: [
          {
            name: "limitRouter",
            type: "address",
            internalType: "address",
          },
          {
            name: "epsSkipMarket",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "normalFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            type: "tuple[]",
            internalType: "struct FillOrderParams[]",
            components: [
              {
                name: "order",
                type: "tuple",
                internalType: "struct Order",
                components: [
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "expiry",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "token",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "YT",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "maker",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "receiver",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "makingAmount",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "permit",
                    type: "bytes",
                    internalType: "bytes",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "makingAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "optData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
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
    type: "event",
    name: "SetPairStatus",
    inputs: [
      {
        name: "market",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "inputToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pendleToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "uint8",
        indexed: false,
        internalType: "enum PendleStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "PairNotAllowedException",
    inputs: [],
  },
  {
    type: "error",
    name: "RedemptionNotAllowedException",
    inputs: [],
  },
] as const;

export const iDaiUsdsAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
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
    name: "dai",
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
    name: "daiMask",
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
    name: "daiToUsds",
    inputs: [
      {
        name: "usr",
        type: "address",
        internalType: "address",
      },
      {
        name: "wad",
        type: "uint256",
        internalType: "uint256",
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
    name: "daiToUsdsDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
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
    name: "usds",
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
    name: "usdsMask",
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
    name: "usdsToDai",
    inputs: [
      {
        name: "usr",
        type: "address",
        internalType: "address",
      },
      {
        name: "wad",
        type: "uint256",
        internalType: "uint256",
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
    name: "usdsToDaiDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
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
] as const;

export const iStakingRewardsAdapterAbi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
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
    name: "getReward",
    inputs: [],
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
    name: "rewardsToken",
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
    name: "rewardsTokenMask",
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
    name: "stake",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
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
    name: "stakeDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
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
    name: "stakedPhantomToken",
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
    name: "stakedPhantomTokenMask",
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
    name: "stakingToken",
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
    name: "stakingTokenMask",
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
    name: "withdraw",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
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
    name: "withdrawDiff",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
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
] as const;
