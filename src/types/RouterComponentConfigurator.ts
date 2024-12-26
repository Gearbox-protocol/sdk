//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RouterComponentConfigurator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const routerComponentConfiguratorAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "router",
    outputs: [
      { name: "", internalType: "contract IRouterV3", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newRouter", internalType: "address", type: "address" }],
    name: "updateRouter",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: true },
    ],
    name: "NewRouter",
  },
  { type: "error", inputs: [], name: "FutureRouterOnlyException" },
  { type: "error", inputs: [], name: "MigrationErrorException" },
  { type: "error", inputs: [], name: "RouterOnlyException" },
  { type: "error", inputs: [], name: "RouterOwnerOnlyException" },
] as const

