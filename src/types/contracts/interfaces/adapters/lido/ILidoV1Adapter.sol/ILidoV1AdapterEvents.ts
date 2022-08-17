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
} from "../../../../../common";

export interface ILidoV1AdapterEventsInterface extends utils.Interface {
  functions: {};

  events: {
    "NewLimit(uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewLimit"): EventFragment;
}

export interface NewLimitEventObject {
  _limit: BigNumber;
}
export type NewLimitEvent = TypedEvent<[BigNumber], NewLimitEventObject>;

export type NewLimitEventFilter = TypedEventFilter<NewLimitEvent>;

export interface ILidoV1AdapterEvents extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILidoV1AdapterEventsInterface;

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
    "NewLimit(uint256)"(_limit?: null): NewLimitEventFilter;
    NewLimit(_limit?: null): NewLimitEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
