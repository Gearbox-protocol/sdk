export const iMarketConfiguratorFactoryAbi = [
  {
    type: "function",
    inputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "addMarketConfigurator",
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
    inputs: [],
    name: "bytecodeRepository",
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
      { name: "emergencyAdmin", internalType: "address", type: "address" },
      { name: "adminFeeTreasury", internalType: "address", type: "address" },
      { name: "curatorName", internalType: "string", type: "string" },
      { name: "deployGovernor", internalType: "bool", type: "bool" },
    ],
    name: "createMarketConfigurator",
    outputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "index", internalType: "uint256", type: "uint256" }],
    name: "getMarketConfigurator",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getMarketConfigurators",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getNumMarketConfigurators",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getShutdownMarketConfigurators",
    outputs: [{ name: "", internalType: "address[]", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isMarketConfigurator",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "shutdownMarketConfigurator",
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
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
    ],
    name: "CreateMarketConfigurator",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "marketConfigurator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "ShutdownMarketConfigurator",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotCrossChainGovernanceException",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "CallerIsNotMarketConfiguratorAdminException",
  },
  {
    type: "error",
    inputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "CantShutdownMarketConfiguratorException",
  },
  {
    type: "error",
    inputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "MarketConfiguratorIsAlreadyAddedException",
  },
  {
    type: "error",
    inputs: [
      { name: "marketConfigruator", internalType: "address", type: "address" },
    ],
    name: "MarketConfiguratorIsAlreadyShutdownException",
  },
  {
    type: "error",
    inputs: [
      { name: "marketConfigurator", internalType: "address", type: "address" },
    ],
    name: "MarketConfiguratorIsNotRegisteredException",
  },
] as const;
