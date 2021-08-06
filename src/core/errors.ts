export type NetworkError = "NetworkError";
export type IncorrectEthAddressError = "IncorrectEthAddressError"

export type CommonError = IncorrectEthAddressError | NetworkError | undefined;

export type PoolError = CommonError | "PoolDoesntExistsError";

export type CreditAccountsError = NetworkError | undefined;

export type CreditAccountError =
  | CommonError
  | "CreditManagerDoesntExistsError"
  | "NoOpenedAccountsError";

export type CardCollectionError = NetworkError | undefined;
export type CardCustomisationError = CommonError;
