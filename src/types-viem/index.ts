/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AddressProvider
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const addressProviderAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "addresses",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
    inputs: [],
    name: "getACL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAccountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getContractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataCompressor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGearToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLeveragedActions",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPriceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTreasuryContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getWETHGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getWethToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "pendingOwner",
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
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setACL",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setAccountFactory",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setContractsRegister",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setDataCompressor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setGearToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setLeveragedActions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setTreasuryContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setWETHGateway",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "setWethToken",
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
        name: "service",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddressSet",
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalanceOps
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const balanceOpsAbi = [
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnknownToken",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CalldataExtractor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const calldataExtractorAbi = [
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  {
    type: "error",
    inputs: [],
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
  },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Claimable
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const claimableAbi = [
  {
    type: "function",
    inputs: [],
    name: "claimOwnership",
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
    name: "pendingOwner",
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

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompositePriceFeed
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const compositePriceFeedAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "priceFeeds",
        internalType: "struct PriceFeedParams[2]",
        type: "tuple[2]",
        components: [
          { name: "priceFeed", internalType: "address", type: "address" },
          { name: "stalenessPeriod", internalType: "uint32", type: "uint32" },
        ],
      },
    ],
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
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeed0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "priceFeed1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "skipCheck1",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    name: "stalenessPeriod0",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stalenessPeriod1",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetFeedScale",
    outputs: [{ name: "", internalType: "int256", type: "int256" }],
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
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectPriceFeedException" },
  { type: "error", inputs: [], name: "StalePriceException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ContractsRegisterTrait
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const contractsRegisterTraitAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
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
// Errors
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const errorsAbi = [
  {
    type: "function",
    inputs: [],
    name: "ACL_CALLER_NOT_CONFIGURATOR",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ACL_CALLER_NOT_PAUSABLE_ADMIN",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "AF_CREDIT_ACCOUNT_NOT_IN_STOCK",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "AF_MINING_IS_FINISHED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "AS_ADDRESS_NOT_FOUND",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CA_CONNECTED_CREDIT_MANAGER_ONLY",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CA_FACTORY_ONLY",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CR_CREDIT_MANAGER_ALREADY_ADDED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "CR_POOL_ALREADY_ADDED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "INCORRECT_ARRAY_LENGTH",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "INCORRECT_PARAMETER",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "INCORRECT_PATH_LENGTH",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MATH_ADDITION_OVERFLOW",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MATH_DIVISION_BY_ZERO",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MATH_MULTIPLICATION_OVERFLOW",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "NOT_IMPLEMENTED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "POOL_CANT_ADD_CREDIT_MANAGER_TWICE",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "POOL_CONNECTED_CREDIT_MANAGERS_ONLY",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "POOL_INCORRECT_WITHDRAW_FEE",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "REGISTERED_POOLS_ONLY",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TD_CONTRIBUTOR_IS_NOT_REGISTERED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TD_INCORRECT_WEIGHTS",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "WG_NOT_ENOUGH_FUNDS",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "WG_RECEIVE_IS_NOT_ALLOWED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "ZERO_ADDRESS_IS_NOT_ALLOWED",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FarmAccounting
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const farmAccountingAbi = [
  { type: "error", inputs: [], name: "AmountTooLarge" },
  { type: "error", inputs: [], name: "DurationTooLarge" },
  { type: "error", inputs: [], name: "ZeroDuration" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAaveV2_LendingPoolAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAaveV2LendingPoolAdapterAbi = [
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
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint16", type: "uint16" },
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
      { name: "asset", internalType: "address", type: "address" },
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
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
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
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAaveV2_WrappedATokenAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAaveV2WrappedATokenAdapterAbi = [
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
    name: "aToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "aTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
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
      { name: "leftoverAssets", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverAssets", internalType: "uint256", type: "uint256" },
    ],
    name: "depositDiffUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "assets", internalType: "uint256", type: "uint256" }],
    name: "depositUnderlying",
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
    name: "tokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "waTokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
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
      { name: "leftoverShares", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverShares", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiffUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "shares", internalType: "uint256", type: "uint256" }],
    name: "withdrawUnderlying",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
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
// IAddressProvider
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderAbi = [
  {
    type: "function",
    inputs: [],
    name: "getACL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getAccountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getContractsRegister",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataCompressor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getGearToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLeveragedActions",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPriceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTreasuryContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getWETHGateway",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getWethToken",
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
        name: "service",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddressSet",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "service",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AddressSet",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "addresses",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "_version", internalType: "uint256", type: "uint256" },
    ],
    name: "getAddressOrRevert",
    outputs: [{ name: "result", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32" },
      { name: "value", internalType: "address", type: "address" },
      { name: "saveVersion", internalType: "bool", type: "bool" },
    ],
    name: "setAddress",
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
      { name: "key", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "SetAddress",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAddressProviderV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAddressProviderV3EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "value",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "SetAddress",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAirdropDistributor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAirdropDistributorAbi = [
  {
    type: "function",
    inputs: [
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "account", internalType: "address", type: "address" },
      { name: "totalAmount", internalType: "uint256", type: "uint256" },
      { name: "merkleProof", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "claimed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "merkleRoot",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
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
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "historic", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "campaignId",
        internalType: "uint8",
        type: "uint8",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TokenAllocated",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAirdropDistributorEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAirdropDistributorEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
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
      { name: "historic", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "campaignId",
        internalType: "uint8",
        type: "uint8",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TokenAllocated",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2Vault
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAbi = [
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
        name: "funds",
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
      { name: "assetDeltas", internalType: "int256[]", type: "int256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "sender", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address payable", type: "address" },
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPool",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "enum PoolSpecialization", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "token", internalType: "contract IERC20", type: "address" },
    ],
    name: "getPoolTokenInfo",
    outputs: [
      { name: "cash", internalType: "uint256", type: "uint256" },
      { name: "managed", internalType: "uint256", type: "uint256" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
      { name: "assetManager", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPoolTokens",
    outputs: [
      { name: "tokens", internalType: "contract IERC20[]", type: "address[]" },
      { name: "balances", internalType: "uint256[]", type: "uint256[]" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "sender", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
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
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "funds",
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
    ],
    name: "queryBatchSwap",
    outputs: [
      { name: "assetDeltas", internalType: "int256[]", type: "int256[]" },
    ],
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
        name: "funds",
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
      { name: "amountCalculated", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAdapterAbi = [
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
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
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
  { type: "error", inputs: [], name: "PoolNotSupportedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultAdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAdapterEventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultAdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "PoolNotSupportedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultGetters
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultGettersAbi = [
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPool",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "enum PoolSpecialization", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "token", internalType: "contract IERC20", type: "address" },
    ],
    name: "getPoolTokenInfo",
    outputs: [
      { name: "cash", internalType: "uint256", type: "uint256" },
      { name: "managed", internalType: "uint256", type: "uint256" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
      { name: "assetManager", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPoolTokens",
    outputs: [
      { name: "tokens", internalType: "contract IERC20[]", type: "address[]" },
      { name: "balances", internalType: "uint256[]", type: "uint256[]" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBaseRewardPool
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBaseRewardPoolAbi = [
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
    name: "currentRewards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "donate",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "duration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "earned",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "extraRewards",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extraRewardsLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getReward",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_account", internalType: "address", type: "address" },
      { name: "_claimExtras", internalType: "bool", type: "bool" },
    ],
    name: "getReward",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "historicalRewards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastTimeRewardApplicable",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastUpdateTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "newRewardRatio",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "operator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "periodFinish",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pid",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "queuedRewards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardPerToken",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardPerTokenStored",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardRate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardToken",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "rewards",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "stake",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "stakeAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_for", internalType: "address", type: "address" },
      { name: "_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "stakeFor",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "stakingToken",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
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
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "userRewardPerTokenPaid",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdraw",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "claim", internalType: "bool", type: "bool" }],
    name: "withdrawAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "claim", internalType: "bool", type: "bool" }],
    name: "withdrawAllAndUnwrap",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "claim", internalType: "bool", type: "bool" },
    ],
    name: "withdrawAndUnwrap",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBotListV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBotListV3Abi = [
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
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBotListV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBotListV3EventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICompoundV2_CTokenAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCompoundV2CTokenAdapterAbi = [
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
    name: "cToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cTokenMask",
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
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "mintDiff",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "redeemUnderlying",
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
    name: "tokenMask",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    type: "error",
    inputs: [{ name: "errorCode", internalType: "uint256", type: "uint256" }],
    name: "CTokenError",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICompoundV2_Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCompoundV2ExceptionsAbi = [
  {
    type: "error",
    inputs: [{ name: "errorCode", internalType: "uint256", type: "uint256" }],
    name: "CTokenError",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IContractsRegister
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iContractsRegisterAbi = [
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "pools",
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IContractsRegisterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iContractsRegisterEventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IControllerTimelockV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iControllerTimelockV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "txHash", internalType: "bytes32", type: "bytes32" }],
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
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetVetoAdmin",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IControllerTimelockV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iControllerTimelockV3EventsAbi = [
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
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SetVetoAdmin",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexToken
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexTokenAbi = [
  {
    type: "function",
    inputs: [],
    name: "EMISSIONS_MAX_SUPPLY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "operator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "reductionPerCliff",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalCliffs",
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
    name: "vecrvProxy",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
// IConvexV1BaseRewardPoolAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BaseRewardPoolAdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexV1BoosterAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BoosterAdapterAbi = [
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
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
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_pid", internalType: "uint256", type: "uint256" },
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IConvexV1BoosterAdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iConvexV1BoosterAdapterEventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditAccountBase
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditAccountBaseAbi = [
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
      { name: "target", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransfer",
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
// ICreditAccountV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditAccountV3Abi = [
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
      { name: "target", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [{ name: "result", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "factory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
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
      { name: "token", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransfer",
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
// ICreditConfiguratorV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV2Abi = [
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
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
      { name: "adapter", internalType: "address", type: "address" },
    ],
    name: "allowContract",
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
    name: "allowedContracts",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
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
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "forbidAdapter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "forbidContract",
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
    inputs: [{ name: "liquidator", internalType: "address", type: "address" }],
    name: "removeEmergencyLiquidator",
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
      { name: "_feeInterest", internalType: "uint16", type: "uint16" },
      { name: "_feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "_liquidationPremium", internalType: "uint16", type: "uint16" },
      {
        name: "_feeLiquidationExpired",
        internalType: "uint16",
        type: "uint16",
      },
      {
        name: "_liquidationPremiumExpired",
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
    inputs: [{ name: "_mode", internalType: "bool", type: "bool" }],
    name: "setIncreaseDebtForbidden",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newLimit", internalType: "uint128", type: "uint128" }],
    name: "setLimitPerBlock",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_minBorrowedAmount", internalType: "uint128", type: "uint128" },
      { name: "_maxBorrowedAmount", internalType: "uint128", type: "uint128" },
    ],
    name: "setLimits",
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
      { name: "maxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
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
      { name: "_creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "upgradeCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditFacade", internalType: "address", type: "address" },
      { name: "migrateParams", internalType: "bool", type: "bool" },
    ],
    name: "upgradeCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "upgradePriceOracle",
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
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AdapterForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "AddedToUpgradeable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
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
    name: "ContractAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ContractForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newCreditConfigurator",
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
        name: "newCreditFacade",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CreditFacadeUpgraded",
  },
  { type: "event", anonymous: false, inputs: [], name: "CumulativeLossReset" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "ExpirationDateUpdated",
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
    name: "FeesUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "", internalType: "bool", type: "bool", indexed: false }],
    name: "IncreaseDebtForbiddenModeChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "LimitPerBlockUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LimitsUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: false },
    ],
    name: "MaxEnabledTokensUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "NewEmergencyLiquidationDiscount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewMaxCumulativeLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPriceOracle",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "PriceOracleUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "RemovedFromUpgradeable",
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
    name: "TokenAllowed",
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
    name: "TokenForbidden",
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
        name: "liquidityThreshold",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "TokenLiquidationThresholdUpdated",
  },
  { type: "error", inputs: [], name: "AdapterUsedTwiceException" },
  { type: "error", inputs: [], name: "ContractIsNotAnAllowedAdapterException" },
  {
    type: "error",
    inputs: [],
    name: "CreditManagerOrFacadeUsedAsTargetContractsException",
  },
  { type: "error", inputs: [], name: "IncompatibleContractException" },
  { type: "error", inputs: [], name: "IncorrectExpirationDateException" },
  { type: "error", inputs: [], name: "IncorrectFeesException" },
  { type: "error", inputs: [], name: "IncorrectLimitsException" },
  { type: "error", inputs: [], name: "IncorrectLiquidationThresholdException" },
  { type: "error", inputs: [], name: "SetLTForUnderlyingException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV2Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV2EventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "adapter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AdapterForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "AddedToUpgradeable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
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
    name: "ContractAllowed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "protocol",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ContractForbidden",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newCreditConfigurator",
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
        name: "newCreditFacade",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "CreditFacadeUpgraded",
  },
  { type: "event", anonymous: false, inputs: [], name: "CumulativeLossReset" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "EmergencyLiquidatorRemoved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint40", type: "uint40", indexed: false },
    ],
    name: "ExpirationDateUpdated",
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
    name: "FeesUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "", internalType: "bool", type: "bool", indexed: false }],
    name: "IncreaseDebtForbiddenModeChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "LimitPerBlockUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "maxBorrowedAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "LimitsUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: false },
    ],
    name: "MaxEnabledTokensUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint16", type: "uint16", indexed: false },
    ],
    name: "NewEmergencyLiquidationDiscount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewMaxCumulativeLoss",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint128", type: "uint128", indexed: false },
    ],
    name: "NewTotalDebtLimit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newPriceOracle",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "PriceOracleUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "RemovedFromUpgradeable",
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
    name: "TokenAllowed",
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
    name: "TokenForbidden",
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
        name: "liquidityThreshold",
        internalType: "uint16",
        type: "uint16",
        indexed: false,
      },
    ],
    name: "TokenLiquidationThresholdUpdated",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV2Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV2ExceptionsAbi = [
  { type: "error", inputs: [], name: "AdapterUsedTwiceException" },
  { type: "error", inputs: [], name: "ContractIsNotAnAllowedAdapterException" },
  {
    type: "error",
    inputs: [],
    name: "CreditManagerOrFacadeUsedAsTargetContractsException",
  },
  { type: "error", inputs: [], name: "IncompatibleContractException" },
  { type: "error", inputs: [], name: "IncorrectExpirationDateException" },
  { type: "error", inputs: [], name: "IncorrectFeesException" },
  { type: "error", inputs: [], name: "IncorrectLimitsException" },
  { type: "error", inputs: [], name: "IncorrectLiquidationThresholdException" },
  { type: "error", inputs: [], name: "SetLTForUnderlyingException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV3Abi = [
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
    inputs: [{ name: "newMaxDebt", internalType: "uint128", type: "uint128" }],
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
    inputs: [{ name: "newMinDebt", internalType: "uint128", type: "uint128" }],
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditConfiguratorV3EventsAbi = [
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
// ICreditManagerV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV2Abi = [
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "targetContract", internalType: "address", type: "address" },
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
      { name: "totalValue", internalType: "uint256", type: "uint256" },
      {
        name: "closureActionType",
        internalType: "enum ClosureAction",
        type: "uint8",
      },
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      {
        name: "borrowedAmountWithInterest",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "calcClosePayments",
    outputs: [
      { name: "amountToPool", internalType: "uint256", type: "uint256" },
      { name: "remainingFunds", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "calcCreditAccountAccruedInterest",
    outputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      {
        name: "borrowedAmountWithInterest",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "borrowedAmountWithInterestAndFees",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "checkAndEnableToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "checkAndOptimizeEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "state", internalType: "bool", type: "bool" },
    ],
    name: "checkEmergencyPausable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      {
        name: "closureActionType",
        internalType: "enum ClosureAction",
        type: "uint8",
      },
      { name: "totalValue", internalType: "uint256", type: "uint256" },
      { name: "payer", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "skipTokenMask", internalType: "uint256", type: "uint256" },
      { name: "convertWETH", internalType: "bool", type: "bool" },
    ],
    name: "closeCreditAccount",
    outputs: [
      { name: "remainingFunds", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "collateralTokens",
    outputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "liquidationThreshold", internalType: "uint16", type: "uint16" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenMask", internalType: "uint256", type: "uint256" }],
    name: "collateralTokensByMask",
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
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "contractToAdapter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "borrower", internalType: "address", type: "address" }],
    name: "creditAccounts",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "cumulativeDropAtFastCheckRAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "disableToken",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "enabledTokensMap",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
      { name: "targetContract", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "executeOrder",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "balanceInBefore", internalType: "uint256", type: "uint256" },
      { name: "balanceOutBefore", internalType: "uint256", type: "uint256" },
    ],
    name: "fastCollateralCheck",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fees",
    outputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationDiscount", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationDiscountExpired",
        internalType: "uint16",
        type: "uint16",
      },
    ],
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
    ],
    name: "fullCollateralCheck",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "borrower", internalType: "address", type: "address" }],
    name: "getCreditAccountOrRevert",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "liquidationThresholds",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "increase", internalType: "bool", type: "bool" },
    ],
    name: "manageDebt",
    outputs: [
      { name: "newBorrowedAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "maxAllowedEnabledTokenLength",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
    ],
    name: "openCreditAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "poolService",
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "tokenMasksMap",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "transferAccountOwnership",
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
    name: "universalAdapter",
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
    inputs: [],
    name: "wethAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ExecuteOrder",
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
    name: "NewConfigurator",
  },
  { type: "error", inputs: [], name: "AdaptersOrCreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  { type: "error", inputs: [], name: "CreditConfiguratorOnlyException" },
  { type: "error", inputs: [], name: "CreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "HasNoOpenedAccountException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  { type: "error", inputs: [], name: "ReentrancyLockException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressOrUserAlreadyHasAccountException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV2Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV2EventsAbi = [
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
        name: "target",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ExecuteOrder",
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
    name: "NewConfigurator",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV2Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV2ExceptionsAbi = [
  { type: "error", inputs: [], name: "AdaptersOrCreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  { type: "error", inputs: [], name: "CreditConfiguratorOnlyException" },
  { type: "error", inputs: [], name: "CreditFacadeOnlyException" },
  { type: "error", inputs: [], name: "HasNoOpenedAccountException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  { type: "error", inputs: [], name: "ReentrancyLockException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  {
    type: "error",
    inputs: [],
    name: "ZeroAddressOrUserAlreadyHasAccountException",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "accountFactory",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "adapter", internalType: "address", type: "address" }],
    name: "adapterToContract",
    outputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
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
    inputs: [
      { name: "targetContract", internalType: "address", type: "address" },
    ],
    name: "contractToAdapter",
    outputs: [{ name: "adapter", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
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
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
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
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationDiscount", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationDiscountExpired",
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
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
      { name: "creditConfigurator", internalType: "address", type: "address" },
    ],
    name: "setCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditFacade", internalType: "address", type: "address" },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "feeInterest", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
      { name: "liquidationDiscount", internalType: "uint16", type: "uint16" },
      { name: "feeLiquidationExpired", internalType: "uint16", type: "uint16" },
      {
        name: "liquidationDiscountExpired",
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
      { name: "maxEnabledTokens", internalType: "uint8", type: "uint8" },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "priceOracle", internalType: "address", type: "address" }],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "quotedTokensMask", internalType: "uint256", type: "uint256" },
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCreditManagerV3EventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurvePool
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurvePoolAbi = [
  {
    type: "function",
    inputs: [],
    name: "A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "A_precise",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "admin_balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "admin_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "block_timestamp_last",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mid_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurvePool2Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurvePool2AssetsAbi = [
  {
    type: "function",
    inputs: [],
    name: "A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "A_precise",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "min_mint_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "admin_balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "admin_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "block_timestamp_last",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "_is_deposit", internalType: "bool", type: "bool" },
    ],
    name: "calc_token_amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_balances",
    outputs: [{ name: "", internalType: "uint256[2]", type: "uint256[2]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_previous_balances",
    outputs: [{ name: "", internalType: "uint256[2]", type: "uint256[2]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_price_cumulative_last",
    outputs: [{ name: "", internalType: "uint256[2]", type: "uint256[2]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_first_balances",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
      {
        name: "_last_balances",
        internalType: "uint256[2]",
        type: "uint256[2]",
      },
      { name: "_time_elapsed", internalType: "uint256", type: "uint256" },
    ],
    name: "get_twap_balances",
    outputs: [{ name: "", internalType: "uint256[2]", type: "uint256[2]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mid_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "min_amounts", internalType: "uint256[2]", type: "uint256[2]" },
    ],
    name: "remove_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[2]", type: "uint256[2]" },
      { name: "max_burn_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurvePool3Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurvePool3AssetsAbi = [
  {
    type: "function",
    inputs: [],
    name: "A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "A_precise",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "min_mint_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "admin_balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "admin_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "block_timestamp_last",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "_is_deposit", internalType: "bool", type: "bool" },
    ],
    name: "calc_token_amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_balances",
    outputs: [{ name: "", internalType: "uint256[3]", type: "uint256[3]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_previous_balances",
    outputs: [{ name: "", internalType: "uint256[3]", type: "uint256[3]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_price_cumulative_last",
    outputs: [{ name: "", internalType: "uint256[3]", type: "uint256[3]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_first_balances",
        internalType: "uint256[3]",
        type: "uint256[3]",
      },
      {
        name: "_last_balances",
        internalType: "uint256[3]",
        type: "uint256[3]",
      },
      { name: "_time_elapsed", internalType: "uint256", type: "uint256" },
    ],
    name: "get_twap_balances",
    outputs: [{ name: "", internalType: "uint256[3]", type: "uint256[3]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mid_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "min_amounts", internalType: "uint256[3]", type: "uint256[3]" },
    ],
    name: "remove_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[3]", type: "uint256[3]" },
      { name: "max_burn_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurvePool4Assets
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurvePool4AssetsAbi = [
  {
    type: "function",
    inputs: [],
    name: "A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "A_precise",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "min_mint_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "admin",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "admin_balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "admin_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "block_timestamp_last",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "_is_deposit", internalType: "bool", type: "bool" },
    ],
    name: "calc_token_amount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_burn_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
    ],
    name: "calc_withdraw_one_coin",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "future_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_balances",
    outputs: [{ name: "", internalType: "uint256[4]", type: "uint256[4]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "int128", type: "int128" },
      { name: "j", internalType: "int128", type: "int128" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "j", internalType: "uint256", type: "uint256" },
      { name: "dx", internalType: "uint256", type: "uint256" },
    ],
    name: "get_dy_underlying",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_previous_balances",
    outputs: [{ name: "", internalType: "uint256[4]", type: "uint256[4]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_price_cumulative_last",
    outputs: [{ name: "", internalType: "uint256[4]", type: "uint256[4]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_first_balances",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      {
        name: "_last_balances",
        internalType: "uint256[4]",
        type: "uint256[4]",
      },
      { name: "_time_elapsed", internalType: "uint256", type: "uint256" },
    ],
    name: "get_twap_balances",
    outputs: [{ name: "", internalType: "uint256[4]", type: "uint256[4]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "get_virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "initial_A_time",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "mid_fee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "min_amounts", internalType: "uint256[4]", type: "uint256[4]" },
    ],
    name: "remove_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amounts", internalType: "uint256[4]", type: "uint256[4]" },
      { name: "max_burn_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "int128", type: "int128" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_token_amount", internalType: "uint256", type: "uint256" },
      { name: "i", internalType: "uint256", type: "uint256" },
      { name: "min_amount", internalType: "uint256", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [{ name: "", internalType: "int128", type: "int128" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "i", internalType: "uint256", type: "uint256" }],
    name: "underlying_coins",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "virtual_price",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1AdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_2AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_2AssetsAdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_3AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_3AssetsAdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICurveV1_4AssetsAdapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCurveV1_4AssetsAdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDaiLikePermit
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDaiLikePermitAbi = [
  {
    type: "function",
    inputs: [
      { name: "holder", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "nonce", internalType: "uint256", type: "uint256" },
      { name: "expiry", internalType: "uint256", type: "uint256" },
      { name: "allowed", internalType: "bool", type: "bool" },
      { name: "v", internalType: "uint8", type: "uint8" },
      { name: "r", internalType: "bytes32", type: "bytes32" },
      { name: "s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDataCompressorV2_1
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDataCompressorV2_1Abi = [
  {
    type: "function",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_allowedContract", internalType: "address", type: "address" },
    ],
    name: "getAdapter",
    outputs: [{ name: "adapter", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "borrower", internalType: "address", type: "address" },
    ],
    name: "getCreditAccountData",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData",
        type: "tuple",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "borrower", internalType: "address", type: "address" }],
    name: "getCreditAccountsByBorrower",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
    ],
    name: "getCreditManagerData",
    outputs: [
      {
        name: "",
        internalType: "struct CreditManagerData",
        type: "tuple",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "creditFacade", internalType: "address", type: "address" },
          {
            name: "creditConfigurator",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "pool", internalType: "address", type: "address" },
          { name: "totalDebt", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          { name: "minDebt", internalType: "uint256", type: "uint256" },
          { name: "maxDebt", internalType: "uint256", type: "uint256" },
          {
            name: "availableToBorrow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "collateralTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "adapters",
            internalType: "struct ContractAdapter[]",
            type: "tuple[]",
            components: [
              {
                name: "targetContract",
                internalType: "address",
                type: "address",
              },
              { name: "adapter", internalType: "address", type: "address" },
            ],
          },
          {
            name: "liquidationThresholds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "isDegenMode", internalType: "bool", type: "bool" },
          { name: "degenNFT", internalType: "address", type: "address" },
          {
            name: "forbiddenTokenMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "maxEnabledTokensLength",
            internalType: "uint8",
            type: "uint8",
          },
          { name: "feeInterest", internalType: "uint16", type: "uint16" },
          { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
          {
            name: "liquidationDiscount",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "feeLiquidationExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "liquidationDiscountExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCreditManagersV2List",
    outputs: [
      {
        name: "",
        internalType: "struct CreditManagerData[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "creditFacade", internalType: "address", type: "address" },
          {
            name: "creditConfigurator",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "pool", internalType: "address", type: "address" },
          { name: "totalDebt", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          { name: "minDebt", internalType: "uint256", type: "uint256" },
          { name: "maxDebt", internalType: "uint256", type: "uint256" },
          {
            name: "availableToBorrow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "collateralTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "adapters",
            internalType: "struct ContractAdapter[]",
            type: "tuple[]",
            components: [
              {
                name: "targetContract",
                internalType: "address",
                type: "address",
              },
              { name: "adapter", internalType: "address", type: "address" },
            ],
          },
          {
            name: "liquidationThresholds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "isDegenMode", internalType: "bool", type: "bool" },
          { name: "degenNFT", internalType: "address", type: "address" },
          {
            name: "forbiddenTokenMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "maxEnabledTokensLength",
            internalType: "uint8",
            type: "uint8",
          },
          { name: "feeInterest", internalType: "uint16", type: "uint16" },
          { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
          {
            name: "liquidationDiscount",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "feeLiquidationExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "liquidationDiscountExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_pool", internalType: "address", type: "address" }],
    name: "getPoolData",
    outputs: [
      {
        name: "",
        internalType: "struct PoolData",
        type: "tuple",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "dieselToken", internalType: "address", type: "address" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "baseInterestIndex",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "availableLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "totalBorrowed", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          {
            name: "creditManagerDebtParams",
            internalType: "struct CreditManagerDebtParams[]",
            type: "tuple[]",
            components: [
              {
                name: "creditManager",
                internalType: "address",
                type: "address",
              },
              { name: "borrowed", internalType: "uint256", type: "uint256" },
              { name: "limit", internalType: "uint256", type: "uint256" },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "totalAssets", internalType: "uint256", type: "uint256" },
          { name: "totalSupply", internalType: "uint256", type: "uint256" },
          { name: "supplyRate", internalType: "uint256", type: "uint256" },
          {
            name: "baseInterestRate",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "dieselRate_RAY", internalType: "uint256", type: "uint256" },
          { name: "withdrawFee", internalType: "uint256", type: "uint256" },
          {
            name: "lastBaseInterestUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "baseInterestIndexLU",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "poolQuotaKeeper", internalType: "address", type: "address" },
          { name: "gauge", internalType: "address", type: "address" },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              { name: "zapper", internalType: "address", type: "address" },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPoolsV1List",
    outputs: [
      {
        name: "",
        internalType: "struct PoolData[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "dieselToken", internalType: "address", type: "address" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "baseInterestIndex",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "availableLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "totalBorrowed", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          {
            name: "creditManagerDebtParams",
            internalType: "struct CreditManagerDebtParams[]",
            type: "tuple[]",
            components: [
              {
                name: "creditManager",
                internalType: "address",
                type: "address",
              },
              { name: "borrowed", internalType: "uint256", type: "uint256" },
              { name: "limit", internalType: "uint256", type: "uint256" },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "totalAssets", internalType: "uint256", type: "uint256" },
          { name: "totalSupply", internalType: "uint256", type: "uint256" },
          { name: "supplyRate", internalType: "uint256", type: "uint256" },
          {
            name: "baseInterestRate",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "dieselRate_RAY", internalType: "uint256", type: "uint256" },
          { name: "withdrawFee", internalType: "uint256", type: "uint256" },
          {
            name: "lastBaseInterestUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "baseInterestIndexLU",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "poolQuotaKeeper", internalType: "address", type: "address" },
          { name: "gauge", internalType: "address", type: "address" },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              { name: "zapper", internalType: "address", type: "address" },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      { name: "borrower", internalType: "address", type: "address" },
    ],
    name: "hasOpenedCreditAccount",
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
// IDataCompressorV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDataCompressorV3Abi = [
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
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
    name: "getCreditAccountData",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData",
        type: "tuple",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrower", internalType: "address", type: "address" },
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
    name: "getCreditAccountsByBorrower",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
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
    name: "getCreditAccountsByCreditManager",
    outputs: [
      {
        name: "",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "getCreditManagerData",
    outputs: [
      {
        name: "",
        internalType: "struct CreditManagerData",
        type: "tuple",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "creditFacade", internalType: "address", type: "address" },
          {
            name: "creditConfigurator",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "pool", internalType: "address", type: "address" },
          { name: "totalDebt", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          { name: "minDebt", internalType: "uint256", type: "uint256" },
          { name: "maxDebt", internalType: "uint256", type: "uint256" },
          {
            name: "availableToBorrow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "collateralTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "adapters",
            internalType: "struct ContractAdapter[]",
            type: "tuple[]",
            components: [
              {
                name: "targetContract",
                internalType: "address",
                type: "address",
              },
              { name: "adapter", internalType: "address", type: "address" },
            ],
          },
          {
            name: "liquidationThresholds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "isDegenMode", internalType: "bool", type: "bool" },
          { name: "degenNFT", internalType: "address", type: "address" },
          {
            name: "forbiddenTokenMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "maxEnabledTokensLength",
            internalType: "uint8",
            type: "uint8",
          },
          { name: "feeInterest", internalType: "uint16", type: "uint16" },
          { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
          {
            name: "liquidationDiscount",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "feeLiquidationExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "liquidationDiscountExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCreditManagersV3List",
    outputs: [
      {
        name: "",
        internalType: "struct CreditManagerData[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "name", internalType: "string", type: "string" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "creditFacade", internalType: "address", type: "address" },
          {
            name: "creditConfigurator",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "pool", internalType: "address", type: "address" },
          { name: "totalDebt", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          { name: "minDebt", internalType: "uint256", type: "uint256" },
          { name: "maxDebt", internalType: "uint256", type: "uint256" },
          {
            name: "availableToBorrow",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "collateralTokens",
            internalType: "address[]",
            type: "address[]",
          },
          {
            name: "adapters",
            internalType: "struct ContractAdapter[]",
            type: "tuple[]",
            components: [
              {
                name: "targetContract",
                internalType: "address",
                type: "address",
              },
              { name: "adapter", internalType: "address", type: "address" },
            ],
          },
          {
            name: "liquidationThresholds",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "isDegenMode", internalType: "bool", type: "bool" },
          { name: "degenNFT", internalType: "address", type: "address" },
          {
            name: "forbiddenTokenMask",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "maxEnabledTokensLength",
            internalType: "uint8",
            type: "uint8",
          },
          { name: "feeInterest", internalType: "uint16", type: "uint16" },
          { name: "feeLiquidation", internalType: "uint16", type: "uint16" },
          {
            name: "liquidationDiscount",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "feeLiquidationExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "liquidationDiscountExpired",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "staker", internalType: "address", type: "address" }],
    name: "getGaugesV3Data",
    outputs: [
      {
        name: "result",
        internalType: "struct GaugeInfo[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "pool", internalType: "address", type: "address" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "name", internalType: "string", type: "string" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "currentEpoch", internalType: "uint16", type: "uint16" },
          { name: "epochFrozen", internalType: "bool", type: "bool" },
          {
            name: "quotaParams",
            internalType: "struct GaugeQuotaParams[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "minRate", internalType: "uint16", type: "uint16" },
              { name: "maxRate", internalType: "uint16", type: "uint16" },
              {
                name: "totalVotesLpSide",
                internalType: "uint96",
                type: "uint96",
              },
              {
                name: "totalVotesCaSide",
                internalType: "uint96",
                type: "uint96",
              },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
              {
                name: "stakerVotesLpSide",
                internalType: "uint96",
                type: "uint96",
              },
              {
                name: "stakerVotesCaSide",
                internalType: "uint96",
                type: "uint96",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
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
    name: "getLiquidatableCreditAccounts",
    outputs: [
      {
        name: "result",
        internalType: "struct CreditAccountData[]",
        type: "tuple[]",
        components: [
          { name: "isSuccessful", internalType: "bool", type: "bool" },
          {
            name: "priceFeedsNeeded",
            internalType: "address[]",
            type: "address[]",
          },
          { name: "addr", internalType: "address", type: "address" },
          { name: "borrower", internalType: "address", type: "address" },
          { name: "creditManager", internalType: "address", type: "address" },
          { name: "cmName", internalType: "string", type: "string" },
          { name: "creditFacade", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
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
          { name: "healthFactor", internalType: "uint256", type: "uint256" },
          { name: "baseBorrowRate", internalType: "uint256", type: "uint256" },
          {
            name: "aggregatedBorrowRate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "balances",
            internalType: "struct TokenBalance[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "balance", internalType: "uint256", type: "uint256" },
              { name: "isForbidden", internalType: "bool", type: "bool" },
              { name: "isEnabled", internalType: "bool", type: "bool" },
              { name: "isQuoted", internalType: "bool", type: "bool" },
              { name: "quota", internalType: "uint256", type: "uint256" },
              { name: "quotaRate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaCumulativeIndexLU",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "since", internalType: "uint64", type: "uint64" },
          { name: "cfVersion", internalType: "uint256", type: "uint256" },
          { name: "expirationDate", internalType: "uint40", type: "uint40" },
          { name: "activeBots", internalType: "address[]", type: "address[]" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_pool", internalType: "address", type: "address" }],
    name: "getPoolData",
    outputs: [
      {
        name: "",
        internalType: "struct PoolData",
        type: "tuple",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "dieselToken", internalType: "address", type: "address" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "baseInterestIndex",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "availableLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "totalBorrowed", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          {
            name: "creditManagerDebtParams",
            internalType: "struct CreditManagerDebtParams[]",
            type: "tuple[]",
            components: [
              {
                name: "creditManager",
                internalType: "address",
                type: "address",
              },
              { name: "borrowed", internalType: "uint256", type: "uint256" },
              { name: "limit", internalType: "uint256", type: "uint256" },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "totalAssets", internalType: "uint256", type: "uint256" },
          { name: "totalSupply", internalType: "uint256", type: "uint256" },
          { name: "supplyRate", internalType: "uint256", type: "uint256" },
          {
            name: "baseInterestRate",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "dieselRate_RAY", internalType: "uint256", type: "uint256" },
          { name: "withdrawFee", internalType: "uint256", type: "uint256" },
          {
            name: "lastBaseInterestUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "baseInterestIndexLU",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "poolQuotaKeeper", internalType: "address", type: "address" },
          { name: "gauge", internalType: "address", type: "address" },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              { name: "zapper", internalType: "address", type: "address" },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getPoolsV3List",
    outputs: [
      {
        name: "",
        internalType: "struct PoolData[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "underlying", internalType: "address", type: "address" },
          { name: "dieselToken", internalType: "address", type: "address" },
          { name: "symbol", internalType: "string", type: "string" },
          { name: "name", internalType: "string", type: "string" },
          {
            name: "baseInterestIndex",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "availableLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "expectedLiquidity",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "totalBorrowed", internalType: "uint256", type: "uint256" },
          { name: "totalDebtLimit", internalType: "uint256", type: "uint256" },
          {
            name: "creditManagerDebtParams",
            internalType: "struct CreditManagerDebtParams[]",
            type: "tuple[]",
            components: [
              {
                name: "creditManager",
                internalType: "address",
                type: "address",
              },
              { name: "borrowed", internalType: "uint256", type: "uint256" },
              { name: "limit", internalType: "uint256", type: "uint256" },
              {
                name: "availableToBorrow",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "totalAssets", internalType: "uint256", type: "uint256" },
          { name: "totalSupply", internalType: "uint256", type: "uint256" },
          { name: "supplyRate", internalType: "uint256", type: "uint256" },
          {
            name: "baseInterestRate",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "dieselRate_RAY", internalType: "uint256", type: "uint256" },
          { name: "withdrawFee", internalType: "uint256", type: "uint256" },
          {
            name: "lastBaseInterestUpdate",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "baseInterestIndexLU",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "version", internalType: "uint256", type: "uint256" },
          { name: "poolQuotaKeeper", internalType: "address", type: "address" },
          { name: "gauge", internalType: "address", type: "address" },
          {
            name: "quotas",
            internalType: "struct QuotaInfo[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "rate", internalType: "uint16", type: "uint16" },
              {
                name: "quotaIncreaseFee",
                internalType: "uint16",
                type: "uint16",
              },
              { name: "totalQuoted", internalType: "uint96", type: "uint96" },
              { name: "limit", internalType: "uint96", type: "uint96" },
              { name: "isActive", internalType: "bool", type: "bool" },
            ],
          },
          {
            name: "zappers",
            internalType: "struct ZapperInfo[]",
            type: "tuple[]",
            components: [
              { name: "zapper", internalType: "address", type: "address" },
              { name: "tokenIn", internalType: "address", type: "address" },
              { name: "tokenOut", internalType: "address", type: "address" },
            ],
          },
          {
            name: "lirm",
            internalType: "struct LinearModel",
            type: "tuple",
            components: [
              {
                name: "interestModel",
                internalType: "address",
                type: "address",
              },
              { name: "version", internalType: "uint256", type: "uint256" },
              { name: "U_1", internalType: "uint16", type: "uint16" },
              { name: "U_2", internalType: "uint16", type: "uint16" },
              { name: "R_base", internalType: "uint16", type: "uint16" },
              { name: "R_slope1", internalType: "uint16", type: "uint16" },
              { name: "R_slope2", internalType: "uint16", type: "uint16" },
              { name: "R_slope3", internalType: "uint16", type: "uint16" },
              {
                name: "isBorrowingMoreU2Forbidden",
                internalType: "bool",
                type: "bool",
              },
            ],
          },
          { name: "isPaused", internalType: "bool", type: "bool" },
        ],
      },
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenDistributor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenDistributorAbi = [
  {
    type: "function",
    inputs: [
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "account", internalType: "address", type: "address" },
      { name: "totalAmount", internalType: "uint256", type: "uint256" },
      { name: "merkleProof", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "claimed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "merkleRoot",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDegenDistributorEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDegenDistributorEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
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
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
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
// IERC165
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc165Abi = [
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
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
// IERC20Metadata
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20MetadataAbi = [
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
// IERC20Permit
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20PermitAbi = [
  {
    type: "function",
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20ZapperDeposits
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20ZapperDepositsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC4626
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc4626Abi = [
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
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
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
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
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
// IERC4626Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc4626AdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721Abi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Metadata
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721MetadataAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETHZapperDeposits
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iethZapperDepositsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IFarmingPool
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iFarmingPoolAbi = [
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
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "distributor",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "exit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "farmInfo",
    outputs: [
      {
        name: "",
        internalType: "struct FarmAccounting.Info",
        type: "tuple",
        components: [
          { name: "finished", internalType: "uint40", type: "uint40" },
          { name: "duration", internalType: "uint32", type: "uint32" },
          { name: "reward", internalType: "uint184", type: "uint184" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "farmed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "contract IERC20", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "rescueFunds",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "distributor_", internalType: "address", type: "address" },
    ],
    name: "setDistributor",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "period", internalType: "uint256", type: "uint256" },
    ],
    name: "startFarming",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [],
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
      {
        name: "oldDistributor",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newDistributor",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "DistributorChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "reward",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "duration",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RewardUpdated",
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
// IGasPricer
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGasPricerAbi = [
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getGasPriceTokenOutRAY",
    outputs: [{ name: "gasPrice", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGaugeV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGaugeV3Abi = [
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
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
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
    inputs: [{ name: "status", internalType: "bool", type: "bool" }],
    name: "setFrozenEpoch",
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
      { name: "user", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGaugeV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGaugeV3EventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGearStakingV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGearStakingV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IInterestRateModel
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iInterestRateModelAbi = [
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
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILPPriceFeed
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ilpPriceFeedAbi = [
  {
    type: "function",
    inputs: [],
    name: "allowBoundsUpdate",
    outputs: [],
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
    name: "forbidBoundsUpdate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getAggregatePrice",
    outputs: [{ name: "answer", internalType: "int256", type: "int256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLPExchangeRate",
    outputs: [
      { name: "exchangeRate", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getScale",
    outputs: [{ name: "scale", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastBoundsUpdate",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
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
    name: "lowerBound",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lpContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lpToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "priceOracle",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newLowerBound", internalType: "uint256", type: "uint256" },
    ],
    name: "setLimiter",
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
    inputs: [{ name: "updateData", internalType: "bytes", type: "bytes" }],
    name: "updateBounds",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "updateBoundsAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "upperBound",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
        name: "lowerBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "upperBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetBounds",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetUpdateBoundsAllowed",
  },
  { type: "error", inputs: [], name: "ExchangeRateOutOfBoundsException" },
  { type: "error", inputs: [], name: "LowerBoundCantBeZeroException" },
  { type: "error", inputs: [], name: "ReserveFeedMustNotBeSelfException" },
  { type: "error", inputs: [], name: "UpdateBoundsBeforeCooldownException" },
  { type: "error", inputs: [], name: "UpdateBoundsNotAllowedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILPPriceFeedEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ilpPriceFeedEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "lowerBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "upperBound",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "SetBounds",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "allowed", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "SetUpdateBoundsAllowed",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILPPriceFeedExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ilpPriceFeedExceptionsAbi = [
  { type: "error", inputs: [], name: "ExchangeRateOutOfBoundsException" },
  { type: "error", inputs: [], name: "LowerBoundCantBeZeroException" },
  { type: "error", inputs: [], name: "ReserveFeedMustNotBeSelfException" },
  { type: "error", inputs: [], name: "UpdateBoundsBeforeCooldownException" },
  { type: "error", inputs: [], name: "UpdateBoundsNotAllowedException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILidoV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLidoV1AdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILinearInterestRateModelV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLinearInterestRateModelV3Abi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "returnData", internalType: "bytes[]", type: "bytes[]" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call3[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call3Value[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "value", internalType: "uint256", type: "uint256" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3Value",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "blockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "getBasefee",
    outputs: [{ name: "basefee", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "blockNumber", internalType: "uint256", type: "uint256" }],
    name: "getBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getBlockNumber",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getChainId",
    outputs: [{ name: "chainid", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockCoinbase",
    outputs: [{ name: "coinbase", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockDifficulty",
    outputs: [{ name: "difficulty", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockGasLimit",
    outputs: [{ name: "gaslimit", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [{ name: "timestamp", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "getEthBalance",
    outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLastBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryAggregate",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IOffchainOracle
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iOffchainOracleAbi = [
  {
    type: "function",
    inputs: [
      { name: "srcToken", internalType: "address", type: "address" },
      { name: "dstToken", internalType: "address", type: "address" },
      { name: "useWrappers", internalType: "bool", type: "bool" },
    ],
    name: "getRate",
    outputs: [
      { name: "weightedRate", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "srcToken", internalType: "address", type: "address" },
      { name: "useSrcWrappers", internalType: "bool", type: "bool" },
    ],
    name: "getRateToEth",
    outputs: [
      { name: "weightedRate", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPartialLiquidationBotV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPartialLiquidationBotV3Abi = [
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
  { type: "error", inputs: [], name: "LiquidatedLessThanNeededException" },
  { type: "error", inputs: [], name: "LiquidatedMoreThanNeededException" },
  { type: "error", inputs: [], name: "RepaidMoreThanAllowedException" },
  { type: "error", inputs: [], name: "SeizedLessThanRequiredException" },
  { type: "error", inputs: [], name: "UnderlyingNotLiquidatableException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPermit2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPermit2Abi = [
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        internalType: "struct IPermit2.PackedAllowance",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint160", type: "uint160" },
          { name: "expiration", internalType: "uint48", type: "uint48" },
          { name: "nonce", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      {
        name: "permitSingle",
        internalType: "struct IPermit2.PermitSingle",
        type: "tuple",
        components: [
          {
            name: "details",
            internalType: "struct IPermit2.PermitDetails",
            type: "tuple",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "amount", internalType: "uint160", type: "uint160" },
              { name: "expiration", internalType: "uint48", type: "uint48" },
              { name: "nonce", internalType: "uint48", type: "uint48" },
            ],
          },
          { name: "spender", internalType: "address", type: "address" },
          { name: "sigDeadline", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint160", type: "uint160" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolQuotaKeeperV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolQuotaKeeperV3Abi = [
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
    inputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "pool",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "poolQuotaRevenue",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolQuotaKeeperV3Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolQuotaKeeperV3EventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolService
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolServiceAbi = [
  {
    type: "function",
    inputs: [],
    name: "_cumulativeIndex_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_timestampLU",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [
      { name: "", internalType: "contract AddressProvider", type: "address" },
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
    inputs: [],
    name: "borrowAPY_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "calcLinearCumulative_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "uint256", type: "uint256" }],
    name: "creditManagers",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "creditManagersCanBorrow",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManagersCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "dieselToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "expectedLiquidityLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "fromDiesel",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDieselRate_RAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "removeLiquidity",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "borrowedAmount", internalType: "uint256", type: "uint256" },
      { name: "profit", internalType: "uint256", type: "uint256" },
      { name: "loss", internalType: "uint256", type: "uint256" },
    ],
    name: "repayCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "toDiesel",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "underlyingToken",
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
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
        name: "onBehalfOf",
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
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AddLiquidity",
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
    ],
    name: "BorrowForbidden",
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
    name: "NewCreditManagerConnected",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "NewExpectedLiquidityLimit",
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
    name: "NewInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "NewWithdrawFee",
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
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RemoveLiquidity",
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
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UncoveredLoss",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPoolServiceEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPoolServiceEventsAbi = [
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
        name: "onBehalfOf",
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
      {
        name: "referralCode",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AddLiquidity",
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
    ],
    name: "BorrowForbidden",
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
    name: "NewCreditManagerConnected",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newLimit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "NewExpectedLiquidityLimit",
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
    name: "NewInterestRateModel",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "NewWithdrawFee",
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
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RemoveLiquidity",
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
        name: "loss",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UncoveredLoss",
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
// IPriceOracleBase
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleBaseAbi = [
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
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
// IPriceOracleV2
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV2Abi = [
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
    inputs: [
      { name: "amountFrom", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "amountTo", internalType: "uint256", type: "uint256" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "fastCheck",
    outputs: [
      { name: "collateralFrom", internalType: "uint256", type: "uint256" },
      { name: "collateralTo", internalType: "uint256", type: "uint256" },
    ],
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedsWithFlags",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint256", type: "uint256" },
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
    ],
    name: "NewPriceFeed",
  },
  { type: "error", inputs: [], name: "ChainPriceStaleException" },
  { type: "error", inputs: [], name: "PriceOracleNotExistsException" },
  { type: "error", inputs: [], name: "ZeroPriceException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV2Events
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV2EventsAbi = [
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
    ],
    name: "NewPriceFeed",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV2Exceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV2ExceptionsAbi = [
  { type: "error", inputs: [], name: "ChainPriceStaleException" },
  { type: "error", inputs: [], name: "PriceOracleNotExistsException" },
  { type: "error", inputs: [], name: "ZeroPriceException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPriceOracleV2Ext
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPriceOracleV2ExtAbi = [
  {
    type: "function",
    inputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "priceFeed", internalType: "address", type: "address" },
    ],
    name: "addPriceFeed",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      { name: "amountFrom", internalType: "uint256", type: "uint256" },
      { name: "tokenFrom", internalType: "address", type: "address" },
      { name: "amountTo", internalType: "uint256", type: "uint256" },
      { name: "tokenTo", internalType: "address", type: "address" },
    ],
    name: "fastCheck",
    outputs: [
      { name: "collateralFrom", internalType: "uint256", type: "uint256" },
      { name: "collateralTo", internalType: "uint256", type: "uint256" },
    ],
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
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeeds",
    outputs: [{ name: "priceFeed", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "priceFeedsWithFlags",
    outputs: [
      { name: "priceFeed", internalType: "address", type: "address" },
      { name: "skipCheck", internalType: "bool", type: "bool" },
      { name: "decimals", internalType: "uint256", type: "uint256" },
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
    ],
    name: "NewPriceFeed",
  },
  { type: "error", inputs: [], name: "ChainPriceStaleException" },
  { type: "error", inputs: [], name: "PriceOracleNotExistsException" },
  { type: "error", inputs: [], name: "ZeroPriceException" },
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
// IRedstonePriceFeedEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRedstonePriceFeedEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "price",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UpdatePrice",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRedstonePriceFeedExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRedstonePriceFeedExceptionsAbi = [
  { type: "error", inputs: [], name: "DataPackageTimestampIncorrect" },
  { type: "error", inputs: [], name: "DuplicateSignersException" },
  { type: "error", inputs: [], name: "IncorrectSignersThresholdException" },
  { type: "error", inputs: [], name: "NotEnoughSignersException" },
  { type: "error", inputs: [], name: "RedstonePayloadTimestampIncorrect" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRouter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRouterAbi = [
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    name: "componentAddressById",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "slippage", internalType: "uint256", type: "uint256" },
          { name: "externalSlippage", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "findAllSwaps",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult[]",
        type: "tuple[]",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "gasUsage", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
      { name: "iterations", internalType: "uint256", type: "uint256" },
      { name: "force", internalType: "bool", type: "bool" },
    ],
    name: "findBestClosePath",
    outputs: [
      {
        name: "result",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "gasUsage", internalType: "uint256", type: "uint256" },
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
      },
      { name: "gasPriceTargetRAY", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "gasUsage", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "balances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "gasUsage", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "getGasPriceTokenOutRAY",
    outputs: [{ name: "gasPrice", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isRouterConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "tokenTypes",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
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
      { name: "ttIn", internalType: "uint8", type: "uint8", indexed: true },
      { name: "ttOut", internalType: "uint8", type: "uint8", indexed: true },
      { name: "rc", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "ResolverUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: true },
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "RouterComponentUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tokenAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "tt", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "TokenTypeUpdate",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRouterV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRouterV3Abi = [
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    name: "componentAddressById",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "swapTask",
        internalType: "struct SwapTask",
        type: "tuple",
        components: [
          {
            name: "swapOperation",
            internalType: "enum SwapOperation",
            type: "uint8",
          },
          { name: "creditAccount", internalType: "address", type: "address" },
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "connectors", internalType: "address[]", type: "address[]" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findAllSwaps",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult[]",
        type: "tuple[]",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      {
        name: "expectedBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
      {
        name: "pathOptions",
        internalType: "struct PathOption[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "option", internalType: "uint8", type: "uint8" },
          { name: "totalOptions", internalType: "uint8", type: "uint8" },
        ],
      },
      { name: "iterations", internalType: "uint256", type: "uint256" },
      { name: "force", internalType: "bool", type: "bool" },
    ],
    name: "findBestClosePath",
    outputs: [
      {
        name: "result",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "expectedBalance", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOneTokenDiffPath",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "tokenOut", internalType: "address", type: "address" },
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOneTokenPath",
    outputs: [
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
      {
        name: "balances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "leftoverBalances",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "target", internalType: "address", type: "address" },
      { name: "connectors", internalType: "address[]", type: "address[]" },
      { name: "slippage", internalType: "uint256", type: "uint256" },
    ],
    name: "findOpenStrategyPath",
    outputs: [
      {
        name: "",
        internalType: "struct Balance[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "balance", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "",
        internalType: "struct RouterResult",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "minAmount", internalType: "uint256", type: "uint256" },
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
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "futureRouter",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isRouterConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxComponentId",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "tokenTypes",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
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
      { name: "ttIn", internalType: "uint8", type: "uint8", indexed: true },
      { name: "ttOut", internalType: "uint8", type: "uint8", indexed: true },
      { name: "rc", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "ResolverUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint8", type: "uint8", indexed: true },
      { name: "", internalType: "address", type: "address", indexed: true },
      {
        name: "version",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RouterComponentUpdate",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "SetFutureRouter",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tokenAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "tt", internalType: "uint8", type: "uint8", indexed: true },
    ],
    name: "TokenTypeUpdate",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ISwapRouter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iSwapRouterAbi = [
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
    outputs: [{ name: "amountOut", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
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
    outputs: [{ name: "amountOut", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
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
    outputs: [{ name: "amountIn", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
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
    outputs: [{ name: "amountIn", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV2AdapterAbi = [
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
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV2AdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV2AdapterEventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV2AdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV2AdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV3Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV3AdapterAbi = [
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
  { type: "error", inputs: [], name: "InvalidPathException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV3AdapterEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV3AdapterEventsAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IUniswapV3AdapterExceptions
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iUniswapV3AdapterExceptionsAbi = [
  { type: "error", inputs: [], name: "InvalidPathException" },
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
// IVotingContractV3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iVotingContractV3Abi = [
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
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "votes", internalType: "uint96", type: "uint96" },
      { name: "extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWETH
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwethAbi = [
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
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
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
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [],
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
      { name: "dst", internalType: "address", type: "address", indexed: true },
      { name: "wad", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "Deposit",
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
      { name: "src", internalType: "address", type: "address", indexed: true },
      { name: "wad", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "Withdrawal",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWETHGateway
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwethGatewayAbi = [
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint16", type: "uint16" },
    ],
    name: "addLiquidityETH",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address payable", type: "address" },
    ],
    name: "removeLiquidityETH",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrapWETH",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IYVault
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iyVaultAbi = [
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
      { name: "_amount", internalType: "uint256", type: "uint256" },
      { name: "recipient", internalType: "address", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    name: "pricePerShare",
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "recipient", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "maxShares", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "maxShares", internalType: "uint256", type: "uint256" },
      { name: "recipient", internalType: "address", type: "address" },
      { name: "maxLoss", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
// IYearnV2Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iYearnV2AdapterAbi = [
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
// IZapperRegister
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iZapperRegisterAbi = [
  {
    type: "function",
    inputs: [{ name: "pool", internalType: "address", type: "address" }],
    name: "zappers",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "AddZapper",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "RemoveZapper",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IstETH
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const istEthAbi = [
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
    inputs: [],
    name: "getFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_sharesAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getPooledEthByShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_ethAmount", internalType: "uint256", type: "uint256" }],
    name: "getSharesByPooledEth",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTotalPooledEther",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTotalShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "sharesOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_referral", internalType: "address", type: "address" }],
    name: "submit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
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
// IstETHGetters
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const istEthGettersAbi = [
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
    inputs: [],
    name: "getFee",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_sharesAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getPooledEthByShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_ethAmount", internalType: "uint256", type: "uint256" }],
    name: "getSharesByPooledEth",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTotalPooledEther",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getTotalShares",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "sharesOf",
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
// IwstETH
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthAbi = [
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
      { name: "_wstETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getStETHByWstETH",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_stETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getWstETHByStETH",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stEthPerToken",
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
    name: "tokensPerStEth",
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
    inputs: [
      { name: "_wstETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "unwrap",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_stETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "wrap",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
// IwstETHGateWay
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthGateWayAbi = [
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "referralCode", internalType: "uint256", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "removeLiquidity",
    outputs: [{ name: "amountGet", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  { type: "error", inputs: [], name: "NonRegisterPoolException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IwstETHGetters
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthGettersAbi = [
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
      { name: "_wstETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getStETHByWstETH",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_stETHAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "getWstETHByStETH",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
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
    inputs: [],
    name: "stETH",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "stEthPerToken",
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
    name: "tokensPerStEth",
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
// IwstETHV1Adapter
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwstEthv1AdapterAbi = [
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
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NumericArrayLib
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const numericArrayLibAbi = [
  { type: "error", inputs: [], name: "CanNotPickMedianOfEmptyArray" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableAbi = [
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
// RedstoneConstants
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneConstantsAbi = [
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstoneConsumerBase
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneConsumerBaseAbi = [
  {
    type: "function",
    inputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
    name: "aggregateValues",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "getAuthorisedSignerIndex",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataServiceId",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getUniqueSignersThreshold",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "receivedTimestampMilliseconds",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "validateTimestamp",
    outputs: [],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "CanNotPickMedianOfEmptyArray" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "GetDataServiceIdNotImplemented" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  {
    type: "error",
    inputs: [],
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
  },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampFromTooLongFuture",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampIsTooOld",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstoneConsumerNumericBase
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneConsumerNumericBaseAbi = [
  {
    type: "function",
    inputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
    name: "aggregateValues",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "getAuthorisedSignerIndex",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataServiceId",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getUniqueSignersThreshold",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "receivedTimestampMilliseconds",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "validateTimestamp",
    outputs: [],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "CanNotPickMedianOfEmptyArray" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "GetDataServiceIdNotImplemented" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  {
    type: "error",
    inputs: [],
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
  },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampFromTooLongFuture",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampIsTooOld",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstoneDefaultsLib
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneDefaultsLibAbi = [
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampFromTooLongFuture",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampIsTooOld",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstonePriceFeed
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstonePriceFeedAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_token", internalType: "address", type: "address" },
      { name: "_dataFeedId", internalType: "bytes32", type: "bytes32" },
      { name: "_signers", internalType: "address[10]", type: "address[10]" },
      { name: "signersThreshold", internalType: "uint8", type: "uint8" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
    name: "aggregateValues",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "dataFeedId",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    inputs: [],
    name: "description",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "signerAddress", internalType: "address", type: "address" },
    ],
    name: "getAuthorisedSignerIndex",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataServiceId",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getUniqueSignersThreshold",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastPayloadTimestamp",
    outputs: [{ name: "", internalType: "uint40", type: "uint40" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastPrice",
    outputs: [{ name: "", internalType: "uint128", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "", internalType: "uint80", type: "uint80" },
      { name: "", internalType: "int256", type: "int256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
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
    name: "signerAddress0",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress1",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress2",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress3",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress4",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress5",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress6",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress7",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress8",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "signerAddress9",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    name: "token",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [
      {
        name: "receivedTimestampMilliseconds",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "validateTimestamp",
    outputs: [],
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
        name: "price",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UpdatePrice",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "CanNotPickMedianOfEmptyArray" },
  { type: "error", inputs: [], name: "DataPackageTimestampIncorrect" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "DuplicateSignersException" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "GetDataServiceIdNotImplemented" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectSignersThresholdException" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  { type: "error", inputs: [], name: "NotEnoughSignersException" },
  {
    type: "error",
    inputs: [],
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
  },
  { type: "error", inputs: [], name: "RedstonePayloadTimestampIncorrect" },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeERC20
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeErc20Abi = [
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "Permit2TransferAmountTooHigh" },
  { type: "error", inputs: [], name: "SafeDecreaseAllowanceFailed" },
  { type: "error", inputs: [], name: "SafeIncreaseAllowanceFailed" },
  { type: "error", inputs: [], name: "SafePermitBadLength" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SignUpRepository
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const signUpRepositoryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    inputs: [
      {
        name: "signatures",
        internalType: "struct SignupInfo[]",
        type: "tuple[]",
        components: [
          { name: "account", internalType: "address", type: "address" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "addBatchSignatures",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "addSignature",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "messageHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "signatureVersion",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
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
    inputs: [
      { name: "newVersion", internalType: "uint8", type: "uint8" },
      { name: "message", internalType: "string", type: "string" },
    ],
    name: "updateLegalText",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      { name: "text", internalType: "string", type: "string", indexed: false },
      {
        name: "messageHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "NewSignatureAdded",
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
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "Signature",
  },
  { type: "error", inputs: [], name: "IncorrectSignatureException" },
  { type: "error", inputs: [], name: "IncorrectVersionException" },
] as const;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SignUpRepositoryEvents
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const signUpRepositoryEventsAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      { name: "text", internalType: "string", type: "string", indexed: false },
      {
        name: "messageHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "NewSignatureAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "version", internalType: "uint8", type: "uint8", indexed: true },
      {
        name: "signature",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "Signature",
  },
] as const;
