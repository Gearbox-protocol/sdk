import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface LidoV1GatewayInterface extends utils.Interface {
    functions: {
        "stETH()": FunctionFragment;
        "submit(uint256,address)": FunctionFragment;
        "weth()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "stETH" | "submit" | "weth"): FunctionFragment;
    encodeFunctionData(functionFragment: "stETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "submit", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "weth", values?: undefined): string;
    decodeFunctionResult(functionFragment: "stETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "submit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "weth", data: BytesLike): Result;
    events: {};
}
export interface LidoV1Gateway extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: LidoV1GatewayInterface;
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
        stETH(overrides?: CallOverrides): Promise<[string]>;
        submit(amount: BigNumberish, _referral: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        weth(overrides?: CallOverrides): Promise<[string]>;
    };
    stETH(overrides?: CallOverrides): Promise<string>;
    submit(amount: BigNumberish, _referral: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    weth(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        stETH(overrides?: CallOverrides): Promise<string>;
        submit(amount: BigNumberish, _referral: string, overrides?: CallOverrides): Promise<BigNumber>;
        weth(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        stETH(overrides?: CallOverrides): Promise<BigNumber>;
        submit(amount: BigNumberish, _referral: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        weth(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        stETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        submit(amount: BigNumberish, _referral: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        weth(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
