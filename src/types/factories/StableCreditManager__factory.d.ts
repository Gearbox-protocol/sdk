import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { StableCreditManager } from "../StableCreditManager";
export declare class StableCreditManager__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_addressProvider: string, _minAmount: BigNumberish, _maxAmount: BigNumberish, _maxLeverage: BigNumberish, _poolService: string, _creditFilterAddress: string, _curvePool: string, _nCoins: BigNumberish, overrides?: Overrides): Promise<StableCreditManager>;
    getDeployTransaction(_addressProvider: string, _minAmount: BigNumberish, _maxAmount: BigNumberish, _maxLeverage: BigNumberish, _poolService: string, _creditFilterAddress: string, _curvePool: string, _nCoins: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): StableCreditManager;
    connect(signer: Signer): StableCreditManager__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): StableCreditManager;
}
