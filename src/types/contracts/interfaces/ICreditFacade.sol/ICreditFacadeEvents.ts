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
} from "../../../common";

export interface ICreditFacadeEventsInterface extends utils.Interface {
  functions: {};

  events: {
    "AddCollateral(address,address,uint256)": EventFragment;
    "CloseCreditAccount(address,address)": EventFragment;
    "DecreaseBorrowedAmount(address,uint256)": EventFragment;
    "IncreaseBorrowedAmount(address,uint256)": EventFragment;
    "LiquidateCreditAccount(address,address,address,uint256)": EventFragment;
    "LiquidateExpiredCreditAccount(address,address,address,uint256)": EventFragment;
    "MultiCallFinished()": EventFragment;
    "MultiCallStarted(address)": EventFragment;
    "OpenCreditAccount(address,address,uint256,uint16)": EventFragment;
    "TokenDisabled(address,address)": EventFragment;
    "TokenEnabled(address,address)": EventFragment;
    "TransferAccount(address,address)": EventFragment;
    "TransferAccountAllowed(address,address,bool)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddCollateral"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CloseCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DecreaseBorrowedAmount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncreaseBorrowedAmount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidateCreditAccount"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "LiquidateExpiredCreditAccount",
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MultiCallFinished"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MultiCallStarted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OpenCreditAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TokenDisabled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TokenEnabled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferAccount"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferAccountAllowed"): EventFragment;
}

export interface AddCollateralEventObject {
  onBehalfOf: string;
  token: string;
  value: BigNumber;
}
export type AddCollateralEvent = TypedEvent<
  [string, string, BigNumber],
  AddCollateralEventObject
>;

export type AddCollateralEventFilter = TypedEventFilter<AddCollateralEvent>;

export interface CloseCreditAccountEventObject {
  owner: string;
  to: string;
}
export type CloseCreditAccountEvent = TypedEvent<
  [string, string],
  CloseCreditAccountEventObject
>;

export type CloseCreditAccountEventFilter =
  TypedEventFilter<CloseCreditAccountEvent>;

export interface DecreaseBorrowedAmountEventObject {
  borrower: string;
  amount: BigNumber;
}
export type DecreaseBorrowedAmountEvent = TypedEvent<
  [string, BigNumber],
  DecreaseBorrowedAmountEventObject
>;

export type DecreaseBorrowedAmountEventFilter =
  TypedEventFilter<DecreaseBorrowedAmountEvent>;

export interface IncreaseBorrowedAmountEventObject {
  borrower: string;
  amount: BigNumber;
}
export type IncreaseBorrowedAmountEvent = TypedEvent<
  [string, BigNumber],
  IncreaseBorrowedAmountEventObject
>;

export type IncreaseBorrowedAmountEventFilter =
  TypedEventFilter<IncreaseBorrowedAmountEvent>;

export interface LiquidateCreditAccountEventObject {
  owner: string;
  liquidator: string;
  to: string;
  remainingFunds: BigNumber;
}
export type LiquidateCreditAccountEvent = TypedEvent<
  [string, string, string, BigNumber],
  LiquidateCreditAccountEventObject
>;

export type LiquidateCreditAccountEventFilter =
  TypedEventFilter<LiquidateCreditAccountEvent>;

export interface LiquidateExpiredCreditAccountEventObject {
  owner: string;
  liquidator: string;
  to: string;
  remainingFunds: BigNumber;
}
export type LiquidateExpiredCreditAccountEvent = TypedEvent<
  [string, string, string, BigNumber],
  LiquidateExpiredCreditAccountEventObject
>;

export type LiquidateExpiredCreditAccountEventFilter =
  TypedEventFilter<LiquidateExpiredCreditAccountEvent>;

export interface MultiCallFinishedEventObject {}
export type MultiCallFinishedEvent = TypedEvent<
  [],
  MultiCallFinishedEventObject
>;

export type MultiCallFinishedEventFilter =
  TypedEventFilter<MultiCallFinishedEvent>;

export interface MultiCallStartedEventObject {
  borrower: string;
}
export type MultiCallStartedEvent = TypedEvent<
  [string],
  MultiCallStartedEventObject
>;

export type MultiCallStartedEventFilter =
  TypedEventFilter<MultiCallStartedEvent>;

export interface OpenCreditAccountEventObject {
  onBehalfOf: string;
  creditAccount: string;
  borrowAmount: BigNumber;
  referralCode: number;
}
export type OpenCreditAccountEvent = TypedEvent<
  [string, string, BigNumber, number],
  OpenCreditAccountEventObject
>;

export type OpenCreditAccountEventFilter =
  TypedEventFilter<OpenCreditAccountEvent>;

export interface TokenDisabledEventObject {
  creditAccount: string;
  token: string;
}
export type TokenDisabledEvent = TypedEvent<
  [string, string],
  TokenDisabledEventObject
>;

export type TokenDisabledEventFilter = TypedEventFilter<TokenDisabledEvent>;

export interface TokenEnabledEventObject {
  creditAccount: string;
  token: string;
}
export type TokenEnabledEvent = TypedEvent<
  [string, string],
  TokenEnabledEventObject
>;

export type TokenEnabledEventFilter = TypedEventFilter<TokenEnabledEvent>;

export interface TransferAccountEventObject {
  oldOwner: string;
  newOwner: string;
}
export type TransferAccountEvent = TypedEvent<
  [string, string],
  TransferAccountEventObject
>;

export type TransferAccountEventFilter = TypedEventFilter<TransferAccountEvent>;

export interface TransferAccountAllowedEventObject {
  from: string;
  to: string;
  state: boolean;
}
export type TransferAccountAllowedEvent = TypedEvent<
  [string, string, boolean],
  TransferAccountAllowedEventObject
>;

export type TransferAccountAllowedEventFilter =
  TypedEventFilter<TransferAccountAllowedEvent>;

export interface ICreditFacadeEvents extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICreditFacadeEventsInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>,
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
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
      onBehalfOf?: string | null,
      token?: string | null,
      value?: null,
    ): AddCollateralEventFilter;
    AddCollateral(
      onBehalfOf?: string | null,
      token?: string | null,
      value?: null,
    ): AddCollateralEventFilter;

    "CloseCreditAccount(address,address)"(
      owner?: string | null,
      to?: string | null,
    ): CloseCreditAccountEventFilter;
    CloseCreditAccount(
      owner?: string | null,
      to?: string | null,
    ): CloseCreditAccountEventFilter;

    "DecreaseBorrowedAmount(address,uint256)"(
      borrower?: string | null,
      amount?: null,
    ): DecreaseBorrowedAmountEventFilter;
    DecreaseBorrowedAmount(
      borrower?: string | null,
      amount?: null,
    ): DecreaseBorrowedAmountEventFilter;

    "IncreaseBorrowedAmount(address,uint256)"(
      borrower?: string | null,
      amount?: null,
    ): IncreaseBorrowedAmountEventFilter;
    IncreaseBorrowedAmount(
      borrower?: string | null,
      amount?: null,
    ): IncreaseBorrowedAmountEventFilter;

    "LiquidateCreditAccount(address,address,address,uint256)"(
      owner?: string | null,
      liquidator?: string | null,
      to?: string | null,
      remainingFunds?: null,
    ): LiquidateCreditAccountEventFilter;
    LiquidateCreditAccount(
      owner?: string | null,
      liquidator?: string | null,
      to?: string | null,
      remainingFunds?: null,
    ): LiquidateCreditAccountEventFilter;

    "LiquidateExpiredCreditAccount(address,address,address,uint256)"(
      owner?: string | null,
      liquidator?: string | null,
      to?: string | null,
      remainingFunds?: null,
    ): LiquidateExpiredCreditAccountEventFilter;
    LiquidateExpiredCreditAccount(
      owner?: string | null,
      liquidator?: string | null,
      to?: string | null,
      remainingFunds?: null,
    ): LiquidateExpiredCreditAccountEventFilter;

    "MultiCallFinished()"(): MultiCallFinishedEventFilter;
    MultiCallFinished(): MultiCallFinishedEventFilter;

    "MultiCallStarted(address)"(
      borrower?: string | null,
    ): MultiCallStartedEventFilter;
    MultiCallStarted(borrower?: string | null): MultiCallStartedEventFilter;

    "OpenCreditAccount(address,address,uint256,uint16)"(
      onBehalfOf?: string | null,
      creditAccount?: string | null,
      borrowAmount?: null,
      referralCode?: null,
    ): OpenCreditAccountEventFilter;
    OpenCreditAccount(
      onBehalfOf?: string | null,
      creditAccount?: string | null,
      borrowAmount?: null,
      referralCode?: null,
    ): OpenCreditAccountEventFilter;

    "TokenDisabled(address,address)"(
      creditAccount?: null,
      token?: null,
    ): TokenDisabledEventFilter;
    TokenDisabled(creditAccount?: null, token?: null): TokenDisabledEventFilter;

    "TokenEnabled(address,address)"(
      creditAccount?: null,
      token?: null,
    ): TokenEnabledEventFilter;
    TokenEnabled(creditAccount?: null, token?: null): TokenEnabledEventFilter;

    "TransferAccount(address,address)"(
      oldOwner?: string | null,
      newOwner?: string | null,
    ): TransferAccountEventFilter;
    TransferAccount(
      oldOwner?: string | null,
      newOwner?: string | null,
    ): TransferAccountEventFilter;

    "TransferAccountAllowed(address,address,bool)"(
      from?: string | null,
      to?: string | null,
      state?: null,
    ): TransferAccountAllowedEventFilter;
    TransferAccountAllowed(
      from?: string | null,
      to?: string | null,
      state?: null,
    ): TransferAccountAllowedEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
