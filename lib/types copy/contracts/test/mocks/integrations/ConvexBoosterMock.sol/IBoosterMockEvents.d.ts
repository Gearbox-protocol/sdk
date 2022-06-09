import type { BaseContract, BigNumber, BigNumberish, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IBoosterMockEventsInterface extends utils.Interface {
    functions: {};
    events: {
        "Mock_Deposited(uint256,address,uint256,uint256,bool)": EventFragment;
        "Mock_Withdrawn(uint256,address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Mock_Deposited"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_Withdrawn"): EventFragment;
}
export interface Mock_DepositedEventObject {
    index: BigNumber;
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
    _stake: boolean;
}
export declare type Mock_DepositedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    boolean
], Mock_DepositedEventObject>;
export declare type Mock_DepositedEventFilter = TypedEventFilter<Mock_DepositedEvent>;
export interface Mock_WithdrawnEventObject {
    index: BigNumber;
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
}
export declare type Mock_WithdrawnEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    BigNumber
], Mock_WithdrawnEventObject>;
export declare type Mock_WithdrawnEventFilter = TypedEventFilter<Mock_WithdrawnEvent>;
export interface IBoosterMockEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBoosterMockEventsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
    filters: {
        "Mock_Deposited(uint256,address,uint256,uint256,bool)"(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null, _stake?: null): Mock_DepositedEventFilter;
        Mock_Deposited(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null, _stake?: null): Mock_DepositedEventFilter;
        "Mock_Withdrawn(uint256,address,uint256,uint256)"(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null): Mock_WithdrawnEventFilter;
        Mock_Withdrawn(index?: null, user?: string | null, poolid?: BigNumberish | null, amount?: null): Mock_WithdrawnEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
