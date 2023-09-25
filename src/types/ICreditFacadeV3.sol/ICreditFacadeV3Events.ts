/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface ICreditFacadeV3EventsInterface extends utils.Interface {
  functions: {};

  events: {
    "AddCollateral(address,address,uint256)": EventFragment;
    "CloseCreditAccount(address,address,address)": EventFragment;
    "DecreaseDebt(address,uint256)": EventFragment;
    "Execute(address,address)": EventFragment;
    "FinishMultiCall()": EventFragment;
    "IncreaseDebt(address,uint256)": EventFragment;
    "LiquidateCreditAccount(address,address,address,address,uint8,uint256)": EventFragment;
    "OpenCreditAccount(address,address,address,uint16)": EventFragment;
    "SetEnabledTokensMask(address,uint256)": EventFragment;
    "StartMultiCall(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddCollateral"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CloseCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DecreaseDebt"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Execute"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FinishMultiCall"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncreaseDebt"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidateCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OpenCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetEnabledTokensMask"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StartMultiCall"): EventFragment;
}

export interface AddCollateralEventObject {
  creditAccount: string;
  token: string;
  value: BigNumber;
}
export type AddCollateralEvent = TypedEvent<
  [string, string, BigNumber],
  AddCollateralEventObject
>;

export type AddCollateralEventFilter = TypedEventFilter<AddCollateralEvent>;

export interface CloseCreditAccountEventObject {
  creditAccount: string;
  borrower: string;
  to: string;
}
export type CloseCreditAccountEvent = TypedEvent<
  [string, string, string],
  CloseCreditAccountEventObject
>;

export type CloseCreditAccountEventFilter =
  TypedEventFilter<CloseCreditAccountEvent>;

export interface DecreaseDebtEventObject {
  creditAccount: string;
  amount: BigNumber;
}
export type DecreaseDebtEvent = TypedEvent<
  [string, BigNumber],
  DecreaseDebtEventObject
>;

export type DecreaseDebtEventFilter = TypedEventFilter<DecreaseDebtEvent>;

export interface ExecuteEventObject {
  creditAccount: string;
  targetContract: string;
}
export type ExecuteEvent = TypedEvent<[string, string], ExecuteEventObject>;

export type ExecuteEventFilter = TypedEventFilter<ExecuteEvent>;

export interface FinishMultiCallEventObject {}
export type FinishMultiCallEvent = TypedEvent<[], FinishMultiCallEventObject>;

export type FinishMultiCallEventFilter = TypedEventFilter<FinishMultiCallEvent>;

export interface IncreaseDebtEventObject {
  creditAccount: string;
  amount: BigNumber;
}
export type IncreaseDebtEvent = TypedEvent<
  [string, BigNumber],
  IncreaseDebtEventObject
>;

export type IncreaseDebtEventFilter = TypedEventFilter<IncreaseDebtEvent>;

export interface LiquidateCreditAccountEventObject {
  creditAccount: string;
  borrower: string;
  liquidator: string;
  to: string;
  closureAction: number;
  remainingFunds: BigNumber;
}
export type LiquidateCreditAccountEvent = TypedEvent<
  [string, string, string, string, number, BigNumber],
  LiquidateCreditAccountEventObject
>;

export type LiquidateCreditAccountEventFilter =
  TypedEventFilter<LiquidateCreditAccountEvent>;

export interface OpenCreditAccountEventObject {
  creditAccount: string;
  onBehalfOf: string;
  caller: string;
  referralCode: number;
}
export type OpenCreditAccountEvent = TypedEvent<
  [string, string, string, number],
  OpenCreditAccountEventObject
>;

export type OpenCreditAccountEventFilter =
  TypedEventFilter<OpenCreditAccountEvent>;

export interface SetEnabledTokensMaskEventObject {
  creditAccount: string;
  enabledTokensMask: BigNumber;
}
export type SetEnabledTokensMaskEvent = TypedEvent<
  [string, BigNumber],
  SetEnabledTokensMaskEventObject
>;

export type SetEnabledTokensMaskEventFilter =
  TypedEventFilter<SetEnabledTokensMaskEvent>;

export interface StartMultiCallEventObject {
  creditAccount: string;
  caller: string;
}
export type StartMultiCallEvent = TypedEvent<
  [string, string],
  StartMultiCallEventObject
>;

export type StartMultiCallEventFilter = TypedEventFilter<StartMultiCallEvent>;

export interface ICreditFacadeV3Events extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICreditFacadeV3EventsInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {};

  callStatic: {};

  filters: {
    "AddCollateral(address,address,uint256)"(
      creditAccount?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      value?: null
    ): AddCollateralEventFilter;
    AddCollateral(
      creditAccount?: PromiseOrValue<string> | null,
      token?: PromiseOrValue<string> | null,
      value?: null
    ): AddCollateralEventFilter;

    "CloseCreditAccount(address,address,address)"(
      creditAccount?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null
    ): CloseCreditAccountEventFilter;
    CloseCreditAccount(
      creditAccount?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null
    ): CloseCreditAccountEventFilter;

    "DecreaseDebt(address,uint256)"(
      creditAccount?: PromiseOrValue<string> | null,
      amount?: null
    ): DecreaseDebtEventFilter;
    DecreaseDebt(
      creditAccount?: PromiseOrValue<string> | null,
      amount?: null
    ): DecreaseDebtEventFilter;

    "Execute(address,address)"(
      creditAccount?: PromiseOrValue<string> | null,
      targetContract?: PromiseOrValue<string> | null
    ): ExecuteEventFilter;
    Execute(
      creditAccount?: PromiseOrValue<string> | null,
      targetContract?: PromiseOrValue<string> | null
    ): ExecuteEventFilter;

    "FinishMultiCall()"(): FinishMultiCallEventFilter;
    FinishMultiCall(): FinishMultiCallEventFilter;

    "IncreaseDebt(address,uint256)"(
      creditAccount?: PromiseOrValue<string> | null,
      amount?: null
    ): IncreaseDebtEventFilter;
    IncreaseDebt(
      creditAccount?: PromiseOrValue<string> | null,
      amount?: null
    ): IncreaseDebtEventFilter;

    "LiquidateCreditAccount(address,address,address,address,uint8,uint256)"(
      creditAccount?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      liquidator?: PromiseOrValue<string> | null,
      to?: null,
      closureAction?: null,
      remainingFunds?: null
    ): LiquidateCreditAccountEventFilter;
    LiquidateCreditAccount(
      creditAccount?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      liquidator?: PromiseOrValue<string> | null,
      to?: null,
      closureAction?: null,
      remainingFunds?: null
    ): LiquidateCreditAccountEventFilter;

    "OpenCreditAccount(address,address,address,uint16)"(
      creditAccount?: PromiseOrValue<string> | null,
      onBehalfOf?: PromiseOrValue<string> | null,
      caller?: PromiseOrValue<string> | null,
      referralCode?: null
    ): OpenCreditAccountEventFilter;
    OpenCreditAccount(
      creditAccount?: PromiseOrValue<string> | null,
      onBehalfOf?: PromiseOrValue<string> | null,
      caller?: PromiseOrValue<string> | null,
      referralCode?: null
    ): OpenCreditAccountEventFilter;

    "SetEnabledTokensMask(address,uint256)"(
      creditAccount?: PromiseOrValue<string> | null,
      enabledTokensMask?: null
    ): SetEnabledTokensMaskEventFilter;
    SetEnabledTokensMask(
      creditAccount?: PromiseOrValue<string> | null,
      enabledTokensMask?: null
    ): SetEnabledTokensMaskEventFilter;

    "StartMultiCall(address,address)"(
      creditAccount?: PromiseOrValue<string> | null,
      caller?: PromiseOrValue<string> | null
    ): StartMultiCallEventFilter;
    StartMultiCall(
      creditAccount?: PromiseOrValue<string> | null,
      caller?: PromiseOrValue<string> | null
    ): StartMultiCallEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
