//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICreditManagerV2Exceptions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
] as const

