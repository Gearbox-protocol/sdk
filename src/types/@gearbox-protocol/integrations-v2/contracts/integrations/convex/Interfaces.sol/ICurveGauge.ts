/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../../../../common";

export interface ICurveGaugeInterface extends utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "claim_rewards()": FunctionFragment;
    "deposit(uint256)": FunctionFragment;
    "lp_token()": FunctionFragment;
    "reward_tokens(uint256)": FunctionFragment;
    "rewarded_token()": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "balanceOf"
      | "claim_rewards"
      | "deposit"
      | "lp_token"
      | "reward_tokens"
      | "rewarded_token"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "claim_rewards",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "lp_token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "reward_tokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "rewarded_token",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claim_rewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lp_token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "reward_tokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewarded_token",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface ICurveGauge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICurveGaugeInterface;

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
    balanceOf(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    claim_rewards(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    deposit(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lp_token(overrides?: CallOverrides): Promise<[string]>;

    reward_tokens(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    rewarded_token(overrides?: CallOverrides): Promise<[string]>;

    withdraw(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  balanceOf(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  claim_rewards(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  deposit(
    arg0: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lp_token(overrides?: CallOverrides): Promise<string>;

  reward_tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  rewarded_token(overrides?: CallOverrides): Promise<string>;

  withdraw(
    arg0: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    claim_rewards(overrides?: CallOverrides): Promise<void>;

    deposit(arg0: BigNumberish, overrides?: CallOverrides): Promise<void>;

    lp_token(overrides?: CallOverrides): Promise<string>;

    reward_tokens(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    rewarded_token(overrides?: CallOverrides): Promise<string>;

    withdraw(arg0: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    balanceOf(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    claim_rewards(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    deposit(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lp_token(overrides?: CallOverrides): Promise<BigNumber>;

    reward_tokens(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    rewarded_token(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claim_rewards(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    deposit(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lp_token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    reward_tokens(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewarded_token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      arg0: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
