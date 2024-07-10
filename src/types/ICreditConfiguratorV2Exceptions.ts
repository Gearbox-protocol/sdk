//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditConfiguratorV2Exceptions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
] as const

