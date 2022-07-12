import type { BaseContract, BigNumber, BigNumberish, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../../common";
export interface IBaseRewardPoolMockEventsInterface extends utils.Interface {
    functions: {};
    events: {
        "Mock_BaseRewardPaid(uint256,address,uint256)": EventFragment;
        "Mock_BaseStaked(uint256,address,uint256)": EventFragment;
        "Mock_BaseWithdrawn(uint256,address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Mock_BaseRewardPaid"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_BaseStaked"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Mock_BaseWithdrawn"): EventFragment;
}
export interface Mock_BaseRewardPaidEventObject {
    index: BigNumber;
    user: string;
    reward: BigNumber;
}
export declare type Mock_BaseRewardPaidEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_BaseRewardPaidEventObject>;
export declare type Mock_BaseRewardPaidEventFilter = TypedEventFilter<Mock_BaseRewardPaidEvent>;
export interface Mock_BaseStakedEventObject {
    index: BigNumber;
    user: string;
    amount: BigNumber;
}
export declare type Mock_BaseStakedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_BaseStakedEventObject>;
export declare type Mock_BaseStakedEventFilter = TypedEventFilter<Mock_BaseStakedEvent>;
export interface Mock_BaseWithdrawnEventObject {
    index: BigNumber;
    user: string;
    amount: BigNumber;
}
export declare type Mock_BaseWithdrawnEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber
], Mock_BaseWithdrawnEventObject>;
export declare type Mock_BaseWithdrawnEventFilter = TypedEventFilter<Mock_BaseWithdrawnEvent>;
export interface IBaseRewardPoolMockEvents extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBaseRewardPoolMockEventsInterface;
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
        "Mock_BaseRewardPaid(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, reward?: null): Mock_BaseRewardPaidEventFilter;
        Mock_BaseRewardPaid(index?: BigNumberish | null, user?: string | null, reward?: null): Mock_BaseRewardPaidEventFilter;
        "Mock_BaseStaked(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_BaseStakedEventFilter;
        Mock_BaseStaked(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_BaseStakedEventFilter;
        "Mock_BaseWithdrawn(uint256,address,uint256)"(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_BaseWithdrawnEventFilter;
        Mock_BaseWithdrawn(index?: BigNumberish | null, user?: string | null, amount?: null): Mock_BaseWithdrawnEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
