import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ICurvePool128Interface extends utils.Interface {
    functions: {
        "balances(int128)": FunctionFragment;
        "coins(int128)": FunctionFragment;
        "underlying_coins(int128)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balances" | "coins" | "underlying_coins"): FunctionFragment;
    encodeFunctionData(functionFragment: "balances", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "coins", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "underlying_coins", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "balances", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "coins", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying_coins", data: BytesLike): Result;
    events: {};
}
export interface ICurvePool128 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICurvePool128Interface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        balances(arg0: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        underlying_coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
    };
    balances(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
    underlying_coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        balances(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
        underlying_coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        balances(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        underlying_coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        balances(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        underlying_coins(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
