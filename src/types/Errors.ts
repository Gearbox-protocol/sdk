/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface ErrorsInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "ACL_CALLER_NOT_CONFIGURATOR"
      | "ACL_CALLER_NOT_PAUSABLE_ADMIN"
      | "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK"
      | "AF_CREDIT_ACCOUNT_NOT_IN_STOCK"
      | "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN"
      | "AF_MINING_IS_FINISHED"
      | "AS_ADDRESS_NOT_FOUND"
      | "CA_CONNECTED_CREDIT_MANAGER_ONLY"
      | "CA_FACTORY_ONLY"
      | "CR_CREDIT_MANAGER_ALREADY_ADDED"
      | "CR_POOL_ALREADY_ADDED"
      | "INCORRECT_ARRAY_LENGTH"
      | "INCORRECT_PARAMETER"
      | "INCORRECT_PATH_LENGTH"
      | "MATH_ADDITION_OVERFLOW"
      | "MATH_DIVISION_BY_ZERO"
      | "MATH_MULTIPLICATION_OVERFLOW"
      | "NOT_IMPLEMENTED"
      | "POOL_CANT_ADD_CREDIT_MANAGER_TWICE"
      | "POOL_CONNECTED_CREDIT_MANAGERS_ONLY"
      | "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER"
      | "POOL_INCORRECT_WITHDRAW_FEE"
      | "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT"
      | "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY"
      | "REGISTERED_POOLS_ONLY"
      | "TD_CONTRIBUTOR_IS_NOT_REGISTERED"
      | "TD_INCORRECT_WEIGHTS"
      | "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION"
      | "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC"
      | "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE"
      | "WG_NOT_ENOUGH_FUNDS"
      | "WG_RECEIVE_IS_NOT_ALLOWED"
      | "ZERO_ADDRESS_IS_NOT_ALLOWED"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ACL_CALLER_NOT_CONFIGURATOR",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ACL_CALLER_NOT_PAUSABLE_ADMIN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AF_CREDIT_ACCOUNT_NOT_IN_STOCK",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AF_MINING_IS_FINISHED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AS_ADDRESS_NOT_FOUND",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "CA_CONNECTED_CREDIT_MANAGER_ONLY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "CA_FACTORY_ONLY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "CR_CREDIT_MANAGER_ALREADY_ADDED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "CR_POOL_ALREADY_ADDED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "INCORRECT_ARRAY_LENGTH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "INCORRECT_PARAMETER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "INCORRECT_PATH_LENGTH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MATH_ADDITION_OVERFLOW",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MATH_DIVISION_BY_ZERO",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MATH_MULTIPLICATION_OVERFLOW",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "NOT_IMPLEMENTED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POOL_CANT_ADD_CREDIT_MANAGER_TWICE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POOL_CONNECTED_CREDIT_MANAGERS_ONLY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POOL_INCORRECT_WITHDRAW_FEE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REGISTERED_POOLS_ONLY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TD_CONTRIBUTOR_IS_NOT_REGISTERED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TD_INCORRECT_WEIGHTS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "WG_NOT_ENOUGH_FUNDS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "WG_RECEIVE_IS_NOT_ALLOWED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ZERO_ADDRESS_IS_NOT_ALLOWED",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "ACL_CALLER_NOT_CONFIGURATOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ACL_CALLER_NOT_PAUSABLE_ADMIN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AF_CREDIT_ACCOUNT_NOT_IN_STOCK",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AF_MINING_IS_FINISHED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AS_ADDRESS_NOT_FOUND",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "CA_CONNECTED_CREDIT_MANAGER_ONLY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "CA_FACTORY_ONLY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "CR_CREDIT_MANAGER_ALREADY_ADDED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "CR_POOL_ALREADY_ADDED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "INCORRECT_ARRAY_LENGTH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "INCORRECT_PARAMETER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "INCORRECT_PATH_LENGTH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MATH_ADDITION_OVERFLOW",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MATH_DIVISION_BY_ZERO",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MATH_MULTIPLICATION_OVERFLOW",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "NOT_IMPLEMENTED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POOL_CANT_ADD_CREDIT_MANAGER_TWICE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POOL_CONNECTED_CREDIT_MANAGERS_ONLY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POOL_INCORRECT_WITHDRAW_FEE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REGISTERED_POOLS_ONLY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TD_CONTRIBUTOR_IS_NOT_REGISTERED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TD_INCORRECT_WEIGHTS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "WG_NOT_ENOUGH_FUNDS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "WG_RECEIVE_IS_NOT_ALLOWED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ZERO_ADDRESS_IS_NOT_ALLOWED",
    data: BytesLike
  ): Result;
}

export interface Errors extends BaseContract {
  connect(runner?: ContractRunner | null): Errors;
  waitForDeployment(): Promise<this>;

  interface: ErrorsInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  ACL_CALLER_NOT_CONFIGURATOR: TypedContractMethod<[], [string], "view">;

  ACL_CALLER_NOT_PAUSABLE_ADMIN: TypedContractMethod<[], [string], "view">;

  AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  AF_CREDIT_ACCOUNT_NOT_IN_STOCK: TypedContractMethod<[], [string], "view">;

  AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN: TypedContractMethod<[], [string], "view">;

  AF_MINING_IS_FINISHED: TypedContractMethod<[], [string], "view">;

  AS_ADDRESS_NOT_FOUND: TypedContractMethod<[], [string], "view">;

  CA_CONNECTED_CREDIT_MANAGER_ONLY: TypedContractMethod<[], [string], "view">;

  CA_FACTORY_ONLY: TypedContractMethod<[], [string], "view">;

  CR_CREDIT_MANAGER_ALREADY_ADDED: TypedContractMethod<[], [string], "view">;

  CR_POOL_ALREADY_ADDED: TypedContractMethod<[], [string], "view">;

  INCORRECT_ARRAY_LENGTH: TypedContractMethod<[], [string], "view">;

  INCORRECT_PARAMETER: TypedContractMethod<[], [string], "view">;

  INCORRECT_PATH_LENGTH: TypedContractMethod<[], [string], "view">;

  MATH_ADDITION_OVERFLOW: TypedContractMethod<[], [string], "view">;

  MATH_DIVISION_BY_ZERO: TypedContractMethod<[], [string], "view">;

  MATH_MULTIPLICATION_OVERFLOW: TypedContractMethod<[], [string], "view">;

  NOT_IMPLEMENTED: TypedContractMethod<[], [string], "view">;

  POOL_CANT_ADD_CREDIT_MANAGER_TWICE: TypedContractMethod<[], [string], "view">;

  POOL_CONNECTED_CREDIT_MANAGERS_ONLY: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  POOL_INCORRECT_WITHDRAW_FEE: TypedContractMethod<[], [string], "view">;

  POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  REGISTERED_POOLS_ONLY: TypedContractMethod<[], [string], "view">;

  TD_CONTRIBUTOR_IS_NOT_REGISTERED: TypedContractMethod<[], [string], "view">;

  TD_INCORRECT_WEIGHTS: TypedContractMethod<[], [string], "view">;

  TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  TD_WALLET_IS_ALREADY_CONNECTED_TO_VC: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  WG_DESTINATION_IS_NOT_WETH_COMPATIBLE: TypedContractMethod<
    [],
    [string],
    "view"
  >;

  WG_NOT_ENOUGH_FUNDS: TypedContractMethod<[], [string], "view">;

  WG_RECEIVE_IS_NOT_ALLOWED: TypedContractMethod<[], [string], "view">;

  ZERO_ADDRESS_IS_NOT_ALLOWED: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ACL_CALLER_NOT_CONFIGURATOR"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ACL_CALLER_NOT_PAUSABLE_ADMIN"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "AF_CREDIT_ACCOUNT_NOT_IN_STOCK"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "AF_MINING_IS_FINISHED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "AS_ADDRESS_NOT_FOUND"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "CA_CONNECTED_CREDIT_MANAGER_ONLY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "CA_FACTORY_ONLY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "CR_CREDIT_MANAGER_ALREADY_ADDED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "CR_POOL_ALREADY_ADDED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "INCORRECT_ARRAY_LENGTH"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "INCORRECT_PARAMETER"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "INCORRECT_PATH_LENGTH"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "MATH_ADDITION_OVERFLOW"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "MATH_DIVISION_BY_ZERO"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "MATH_MULTIPLICATION_OVERFLOW"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "NOT_IMPLEMENTED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "POOL_CANT_ADD_CREDIT_MANAGER_TWICE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "POOL_CONNECTED_CREDIT_MANAGERS_ONLY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "POOL_INCORRECT_WITHDRAW_FEE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "REGISTERED_POOLS_ONLY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "TD_CONTRIBUTOR_IS_NOT_REGISTERED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "TD_INCORRECT_WEIGHTS"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "WG_NOT_ENOUGH_FUNDS"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "WG_RECEIVE_IS_NOT_ALLOWED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ZERO_ADDRESS_IS_NOT_ALLOWED"
  ): TypedContractMethod<[], [string], "view">;

  filters: {};
}
