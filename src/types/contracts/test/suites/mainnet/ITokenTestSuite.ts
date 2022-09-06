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

export interface ITokenTestSuiteInterface extends utils.Interface {
  functions: {
    "addressOf(uint8)": FunctionFragment;
    "priceFeeds(uint8)": FunctionFragment;
    "priceFeeds(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addressOf"
      | "priceFeeds(uint8)"
      | "priceFeeds(address)"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addressOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeeds(uint8)",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "priceFeeds(address)",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "addressOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "priceFeeds(uint8)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "priceFeeds(address)",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ITokenTestSuite extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ITokenTestSuiteInterface;

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
    addressOf(t: BigNumberish, overrides?: CallOverrides): Promise<[string]>;

    "priceFeeds(uint8)"(
      t: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    "priceFeeds(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  addressOf(t: BigNumberish, overrides?: CallOverrides): Promise<string>;

  "priceFeeds(uint8)"(
    t: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "priceFeeds(address)"(
    token: string,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    addressOf(t: BigNumberish, overrides?: CallOverrides): Promise<string>;

    "priceFeeds(uint8)"(
      t: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "priceFeeds(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    addressOf(t: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    "priceFeeds(uint8)"(
      t: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "priceFeeds(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addressOf(
      t: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "priceFeeds(uint8)"(
      t: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "priceFeeds(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}