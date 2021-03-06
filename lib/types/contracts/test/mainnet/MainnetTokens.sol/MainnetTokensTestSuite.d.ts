import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface MainnetTokensTestSuiteInterface extends utils.Interface {
    functions: {
        "allowance(uint8,address,address)": FunctionFragment;
        "approve(uint8,address,address,uint256)": FunctionFragment;
        "approve(uint8,address,address)": FunctionFragment;
        "balanceOf(uint8,address)": FunctionFragment;
        "tokens(uint8)": FunctionFragment;
        "topUpWETH()": FunctionFragment;
        "transfer(uint8,address,uint256)": FunctionFragment;
        "wethToken()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "allowance" | "approve(uint8,address,address,uint256)" | "approve(uint8,address,address)" | "balanceOf" | "tokens" | "topUpWETH" | "transfer" | "wethToken"): FunctionFragment;
    encodeFunctionData(functionFragment: "allowance", values: [BigNumberish, string, string]): string;
    encodeFunctionData(functionFragment: "approve(uint8,address,address,uint256)", values: [BigNumberish, string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "approve(uint8,address,address)", values: [BigNumberish, string, string]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "tokens", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "topUpWETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [BigNumberish, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "wethToken", values?: undefined): string;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve(uint8,address,address,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve(uint8,address,address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "topUpWETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "wethToken", data: BytesLike): Result;
    events: {};
}
export interface MainnetTokensTestSuite extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MainnetTokensTestSuiteInterface;
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
        allowance(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<[BigNumber]>;
        "approve(uint8,address,address,uint256)"(t: BigNumberish, holder: string, targetContract: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        "approve(uint8,address,address)"(t: BigNumberish, holder: string, targetContract: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        balanceOf(t: BigNumberish, holder: string, overrides?: CallOverrides): Promise<[BigNumber] & {
            balance: BigNumber;
        }>;
        tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
        topUpWETH(overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        transfer(t: BigNumberish, to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<ContractTransaction>;
        wethToken(overrides?: CallOverrides): Promise<[string]>;
    };
    allowance(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<BigNumber>;
    "approve(uint8,address,address,uint256)"(t: BigNumberish, holder: string, targetContract: string, amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    "approve(uint8,address,address)"(t: BigNumberish, holder: string, targetContract: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    balanceOf(t: BigNumberish, holder: string, overrides?: CallOverrides): Promise<BigNumber>;
    tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
    topUpWETH(overrides?: PayableOverrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    transfer(t: BigNumberish, to: string, amount: BigNumberish, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ContractTransaction>;
    wethToken(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        allowance(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<BigNumber>;
        "approve(uint8,address,address,uint256)"(t: BigNumberish, holder: string, targetContract: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        "approve(uint8,address,address)"(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<void>;
        balanceOf(t: BigNumberish, holder: string, overrides?: CallOverrides): Promise<BigNumber>;
        tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
        topUpWETH(overrides?: CallOverrides): Promise<void>;
        transfer(t: BigNumberish, to: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        wethToken(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        allowance(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<BigNumber>;
        "approve(uint8,address,address,uint256)"(t: BigNumberish, holder: string, targetContract: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        "approve(uint8,address,address)"(t: BigNumberish, holder: string, targetContract: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        balanceOf(t: BigNumberish, holder: string, overrides?: CallOverrides): Promise<BigNumber>;
        tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        topUpWETH(overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        transfer(t: BigNumberish, to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<BigNumber>;
        wethToken(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        allowance(t: BigNumberish, holder: string, targetContract: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "approve(uint8,address,address,uint256)"(t: BigNumberish, holder: string, targetContract: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        "approve(uint8,address,address)"(t: BigNumberish, holder: string, targetContract: string, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(t: BigNumberish, holder: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokens(arg0: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        topUpWETH(overrides?: PayableOverrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        transfer(t: BigNumberish, to: string, amount: BigNumberish, overrides?: Overrides & {
            from?: string | Promise<string>;
        }): Promise<PopulatedTransaction>;
        wethToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
