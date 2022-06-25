export interface MetamaskError {
    code: number;
    message: string;
    data: string;
}
export declare class NetworkError extends Error {
    constructor();
}
export declare class IncorrectEthAddressError extends Error {
    constructor();
}
export declare class PoolNotExistsError extends Error {
    constructor();
}
export declare class CreditManagerNotExistsError extends Error {
    constructor();
}
export declare class UserHasNotAccountError extends Error {
    constructor();
}
export declare class PathNotFoundError extends Error {
    constructor();
}
export declare class AccountsInAlllCreditManagersError extends Error {
    constructor();
}
