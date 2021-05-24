import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { TestCreditManager } from "../TestCreditManager";
export declare class TestCreditManager__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_addressProvider: string, _minAmount: BigNumberish, _maxAmount: BigNumberish, _maxLeverage: BigNumberish, _poolService: string, _creditFilterAddress: string, overrides?: Overrides): Promise<TestCreditManager>;
    getDeployTransaction(_addressProvider: string, _minAmount: BigNumberish, _maxAmount: BigNumberish, _maxLeverage: BigNumberish, _poolService: string, _creditFilterAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): TestCreditManager;
    connect(signer: Signer): TestCreditManager__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): TestCreditManager;
}
