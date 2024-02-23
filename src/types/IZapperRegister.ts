/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
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
  PromiseOrValue,
} from "./common";

export interface IZapperRegisterInterface extends utils.Interface {
  functions: {
    "zappers(address)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "zappers"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "zappers",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "zappers", data: BytesLike): Result;

  events: {
    "AddZapper(address)": EventFragment;
    "RemoveZapper(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddZapper"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RemoveZapper"): EventFragment;
}

export interface AddZapperEventObject {
  arg0: string;
}
export type AddZapperEvent = TypedEvent<[string], AddZapperEventObject>;

export type AddZapperEventFilter = TypedEventFilter<AddZapperEvent>;

export interface RemoveZapperEventObject {
  arg0: string;
}
export type RemoveZapperEvent = TypedEvent<[string], RemoveZapperEventObject>;

export type RemoveZapperEventFilter = TypedEventFilter<RemoveZapperEvent>;

export interface IZapperRegister extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IZapperRegisterInterface;

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
    zappers(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;
  };

  zappers(
    pool: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  callStatic: {
    zappers(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;
  };

  filters: {
    "AddZapper(address)"(arg0?: null): AddZapperEventFilter;
    AddZapper(arg0?: null): AddZapperEventFilter;

    "RemoveZapper(address)"(arg0?: null): RemoveZapperEventFilter;
    RemoveZapper(arg0?: null): RemoveZapperEventFilter;
  };

  estimateGas: {
    zappers(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    zappers(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}