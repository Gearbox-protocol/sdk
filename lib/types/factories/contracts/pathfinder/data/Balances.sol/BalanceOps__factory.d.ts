import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BalanceOps, BalanceOpsInterface } from "../../../../../contracts/pathfinder/data/Balances.sol/BalanceOps";
declare type BalanceOpsConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class BalanceOps__factory extends ContractFactory {
    constructor(...args: BalanceOpsConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<BalanceOps>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): BalanceOps;
    connect(signer: Signer): BalanceOps__factory;
    static readonly bytecode = "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212201608ac7086cfacea82ef965c8cbbdd2812c1890764216102141f544a710aa4e364736f6c634300080a0033";
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): BalanceOpsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): BalanceOps;
}
export {};
