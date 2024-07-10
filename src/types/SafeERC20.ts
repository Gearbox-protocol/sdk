//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeErc20Abi = [
  { type: "error", inputs: [], name: "ForceApproveFailed" },
  { type: "error", inputs: [], name: "Permit2TransferAmountTooHigh" },
  { type: "error", inputs: [], name: "SafeDecreaseAllowanceFailed" },
  { type: "error", inputs: [], name: "SafeIncreaseAllowanceFailed" },
  { type: "error", inputs: [], name: "SafePermitBadLength" },
  { type: "error", inputs: [], name: "SafeTransferFailed" },
  { type: "error", inputs: [], name: "SafeTransferFromFailed" },
] as const

