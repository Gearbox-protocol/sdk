/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../../../common";

export interface VirtualBalanceWrapperInterface extends utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "deposits()": FunctionFragment;
    "totalSupply()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "balanceOf" | "deposits" | "totalSupply"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(functionFragment: "deposits", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposits", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;

  events: {
    "Mock_ExtraRewardPaid(uint256,address,uint256)": EventFragment;
    "Mock_ExtraStaked(uint256,address,uint256)": EventFragment;
    "Mock_ExtraWithdrawn(uint256,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Mock_ExtraRewardPaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Mock_ExtraStaked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Mock_ExtraWithdrawn"): EventFragment;
}

export interface Mock_ExtraRewardPaidEventObject {
  index: BigNumber;
  user: string;
  reward: BigNumber;
}
export type Mock_ExtraRewardPaidEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  Mock_ExtraRewardPaidEventObject
>;

export type Mock_ExtraRewardPaidEventFilter =
  TypedEventFilter<Mock_ExtraRewardPaidEvent>;

export interface Mock_ExtraStakedEventObject {
  index: BigNumber;
  user: string;
  amount: BigNumber;
}
export type Mock_ExtraStakedEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  Mock_ExtraStakedEventObject
>;

export type Mock_ExtraStakedEventFilter =
  TypedEventFilter<Mock_ExtraStakedEvent>;

export interface Mock_ExtraWithdrawnEventObject {
  index: BigNumber;
  user: string;
  amount: BigNumber;
}
export type Mock_ExtraWithdrawnEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  Mock_ExtraWithdrawnEventObject
>;

export type Mock_ExtraWithdrawnEventFilter =
  TypedEventFilter<Mock_ExtraWithdrawnEvent>;

export interface VirtualBalanceWrapper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VirtualBalanceWrapperInterface;

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

  functions: {
    balanceOf(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    deposits(overrides?: CallOverrides): Promise<[string]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  deposits(overrides?: CallOverrides): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    deposits(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "Mock_ExtraRewardPaid(uint256,address,uint256)"(
      index?: BigNumberish | null,
      user?: string | null,
      reward?: null
    ): Mock_ExtraRewardPaidEventFilter;
    Mock_ExtraRewardPaid(
      index?: BigNumberish | null,
      user?: string | null,
      reward?: null
    ): Mock_ExtraRewardPaidEventFilter;

    "Mock_ExtraStaked(uint256,address,uint256)"(
      index?: BigNumberish | null,
      user?: string | null,
      amount?: null
    ): Mock_ExtraStakedEventFilter;
    Mock_ExtraStaked(
      index?: BigNumberish | null,
      user?: string | null,
      amount?: null
    ): Mock_ExtraStakedEventFilter;

    "Mock_ExtraWithdrawn(uint256,address,uint256)"(
      index?: BigNumberish | null,
      user?: string | null,
      amount?: null
    ): Mock_ExtraWithdrawnEventFilter;
    Mock_ExtraWithdrawn(
      index?: BigNumberish | null,
      user?: string | null,
      amount?: null
    ): Mock_ExtraWithdrawnEventFilter;
  };

  estimateGas: {
    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    deposits(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposits(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}