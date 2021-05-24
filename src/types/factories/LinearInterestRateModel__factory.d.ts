import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LinearInterestRateModel } from "../LinearInterestRateModel";
export declare class LinearInterestRateModel__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(U_optimal: BigNumberish, R_base: BigNumberish, R_slope1: BigNumberish, R_slope2: BigNumberish, overrides?: Overrides): Promise<LinearInterestRateModel>;
    getDeployTransaction(U_optimal: BigNumberish, R_base: BigNumberish, R_slope1: BigNumberish, R_slope2: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): LinearInterestRateModel;
    connect(signer: Signer): LinearInterestRateModel__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): LinearInterestRateModel;
}
