import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ChainlinkPriceFeedMock } from "../ChainlinkPriceFeedMock";
export declare class ChainlinkPriceFeedMock__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_price: BigNumberish, _decimals: BigNumberish, overrides?: Overrides): Promise<ChainlinkPriceFeedMock>;
    getDeployTransaction(_price: BigNumberish, _decimals: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): ChainlinkPriceFeedMock;
    connect(signer: Signer): ChainlinkPriceFeedMock__factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ChainlinkPriceFeedMock;
}
