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

export interface IwstETHGateWayInterface extends utils.Interface {
  functions: {
    "addLiquidity(uint256,address,uint256)": FunctionFragment;
    "removeLiquidity(uint256,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "addLiquidity" | "removeLiquidity"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addLiquidity",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "removeLiquidity",
    values: [BigNumberish, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "addLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeLiquidity",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IwstETHGateWay extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IwstETHGateWayInterface;

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
    addLiquidity(
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    removeLiquidity(
      amount: BigNumberish,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addLiquidity(
    amount: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  removeLiquidity(
    amount: BigNumberish,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addLiquidity(
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    removeLiquidity(
      amount: BigNumberish,
      to: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    addLiquidity(
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    removeLiquidity(
      amount: BigNumberish,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addLiquidity(
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    removeLiquidity(
      amount: BigNumberish,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
