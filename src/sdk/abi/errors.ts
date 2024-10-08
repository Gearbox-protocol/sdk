export const iRouterV3ErrorsAbi = [
  {
    type: "error",
    inputs: [
      { name: "tokenIn", internalType: "address", type: "address" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundException",
  },
  {
    type: "error",
    inputs: [
      { name: "ttIn", internalType: "uint8", type: "uint8" },
      { name: "tokenOut", internalType: "address", type: "address" },
    ],
    name: "PathNotFoundExceptionTyped",
  },
  {
    type: "error",
    inputs: [{ name: "tokenOut", internalType: "address", type: "address" }],
    name: "PathToTargetNotFound",
  },
  { type: "error", inputs: [], name: "UnsupportedAdapterType" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "UnsupportedRouterComponent",
  },
] as const;

export const iExceptionsAbi = [
  { type: "error", inputs: [], name: "ActiveCreditAccountNotSetException" },
  { type: "error", inputs: [], name: "ActiveCreditAccountOverridenException" },
  { type: "error", inputs: [], name: "AdapterIsNotRegisteredException" },
  {
    type: "error",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "AddressIsNotContractException",
  },
  { type: "error", inputs: [], name: "AddressNotFoundException" },
  { type: "error", inputs: [], name: "AllowanceFailedException" },
  { type: "error", inputs: [], name: "AmountCantBeZeroException" },
  { type: "error", inputs: [], name: "BalanceLessThanExpectedException" },
  { type: "error", inputs: [], name: "BorrowAmountOutOfLimitsException" },
  { type: "error", inputs: [], name: "BorrowedBlockLimitException" },
  { type: "error", inputs: [], name: "BorrowingMoreThanU2ForbiddenException" },
  { type: "error", inputs: [], name: "CallerNotAccountFactoryException" },
  { type: "error", inputs: [], name: "CallerNotAdapterException" },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotControllerException" },
  { type: "error", inputs: [], name: "CallerNotCreditAccountOwnerException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "CallerNotCreditManagerException" },
  { type: "error", inputs: [], name: "CallerNotExecutorException" },
  { type: "error", inputs: [], name: "CallerNotGaugeException" },
  { type: "error", inputs: [], name: "CallerNotMigratorException" },
  { type: "error", inputs: [], name: "CallerNotPausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotPoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "CallerNotUnpausableAdminException" },
  { type: "error", inputs: [], name: "CallerNotVetoAdminException" },
  { type: "error", inputs: [], name: "CallerNotVoterException" },
  { type: "error", inputs: [], name: "CloseAccountWithEnabledTokensException" },
  { type: "error", inputs: [], name: "CloseAccountWithNonZeroDebtException" },
  { type: "error", inputs: [], name: "CreditAccountDoesNotExistException" },
  { type: "error", inputs: [], name: "CreditAccountIsInUseException" },
  { type: "error", inputs: [], name: "CreditAccountNotLiquidatableException" },
  { type: "error", inputs: [], name: "CreditManagerCantBorrowException" },
  { type: "error", inputs: [], name: "CustomHealthFactorTooLowException" },
  { type: "error", inputs: [], name: "DebtToZeroWithActiveQuotasException" },
  { type: "error", inputs: [], name: "DebtUpdatedTwiceInOneBlockException" },
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
  { type: "error", inputs: [], name: "IncompatibleContractException" },
  { type: "error", inputs: [], name: "IncompatibleCreditManagerException" },
  { type: "error", inputs: [], name: "IncompatiblePoolQuotaKeeperException" },
  { type: "error", inputs: [], name: "IncompatibleSuccessorException" },
  { type: "error", inputs: [], name: "IncorrectExpirationDateException" },
  { type: "error", inputs: [], name: "IncorrectLimitsException" },
  { type: "error", inputs: [], name: "IncorrectLiquidationThresholdException" },
  { type: "error", inputs: [], name: "IncorrectParameterException" },
  { type: "error", inputs: [], name: "IncorrectPriceException" },
  { type: "error", inputs: [], name: "IncorrectPriceFeedException" },
  { type: "error", inputs: [], name: "IncorrectTokenContractException" },
  { type: "error", inputs: [], name: "InsufficientBalanceException" },
  { type: "error", inputs: [], name: "InsufficientRemainingFundsException" },
  { type: "error", inputs: [], name: "InsufficientVotesException" },
  { type: "error", inputs: [], name: "InvalidBotException" },
  { type: "error", inputs: [], name: "InvalidCollateralHintException" },
  {
    type: "error",
    inputs: [],
    name: "MasterCreditAccountAlreadyDeployedException",
  },
  {
    type: "error",
    inputs: [{ name: "permission", internalType: "uint256", type: "uint256" }],
    name: "NoPermissionException",
  },
  { type: "error", inputs: [], name: "NotAllowedAfterExpirationException" },
  { type: "error", inputs: [], name: "NotAllowedWhenNotExpirableException" },
  { type: "error", inputs: [], name: "NotApprovedBotException" },
  { type: "error", inputs: [], name: "NotEnoughCollateralException" },
  { type: "error", inputs: [], name: "NotImplementedException" },
  { type: "error", inputs: [], name: "ParameterChangedAfterQueuedTxException" },
  { type: "error", inputs: [], name: "ParameterChecksFailedException" },
  { type: "error", inputs: [], name: "PriceFeedDoesNotExistException" },
  { type: "error", inputs: [], name: "QuotaIsOutOfBoundsException" },
  { type: "error", inputs: [], name: "ReceiveIsNotAllowedException" },
  { type: "error", inputs: [], name: "RegisteredCreditManagerOnlyException" },
  { type: "error", inputs: [], name: "RegisteredPoolOnlyException" },
  {
    type: "error",
    inputs: [],
    name: "RemainingTokenBalanceIncreasedException",
  },
  { type: "error", inputs: [], name: "StalePriceException" },
  { type: "error", inputs: [], name: "TargetContractNotAllowedException" },
  { type: "error", inputs: [], name: "TokenAlreadyAddedException" },
  { type: "error", inputs: [], name: "TokenIsNotQuotedException" },
  { type: "error", inputs: [], name: "TokenNotAllowedException" },
  { type: "error", inputs: [], name: "TooManyEnabledTokensException" },
  { type: "error", inputs: [], name: "TooManyTokensException" },
  { type: "error", inputs: [], name: "TxExecutedOutsideTimeWindowException" },
  { type: "error", inputs: [], name: "TxExecutionRevertedException" },
  { type: "error", inputs: [], name: "TxNotQueuedException" },
  { type: "error", inputs: [], name: "UnexpectedPermissionsException" },
  { type: "error", inputs: [], name: "UnknownMethodException" },
  { type: "error", inputs: [], name: "UpdateQuotaOnZeroDebtAccountException" },
  { type: "error", inputs: [], name: "ValueOutOfRangeException" },
  { type: "error", inputs: [], name: "VotingContractNotAllowedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const;
