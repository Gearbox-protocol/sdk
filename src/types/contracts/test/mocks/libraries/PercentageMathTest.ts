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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../../common";

export interface PercentageMathTestInterface extends utils.Interface {
  functions: {
    "percentDiv(uint256,uint256)": FunctionFragment;
    "percentMul(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "percentDiv" | "percentMul"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "percentDiv",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "percentMul",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "percentDiv", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "percentMul", data: BytesLike): Result;

  events: {};
}

export interface PercentageMathTest extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PercentageMathTestInterface;

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
    percentDiv(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    percentMul(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  percentDiv(
    value: BigNumberish,
    percentage: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  percentMul(
    value: BigNumberish,
    percentage: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    percentDiv(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    percentMul(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    percentDiv(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    percentMul(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    percentDiv(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    percentMul(
      value: BigNumberish,
      percentage: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
