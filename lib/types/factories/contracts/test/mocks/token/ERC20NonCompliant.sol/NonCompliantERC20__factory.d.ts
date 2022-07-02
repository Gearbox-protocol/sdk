import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { NonCompliantERC20, NonCompliantERC20Interface } from "../../../../../../contracts/test/mocks/token/ERC20NonCompliant.sol/NonCompliantERC20";
declare type NonCompliantERC20ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class NonCompliantERC20__factory extends ContractFactory {
    constructor(...args: NonCompliantERC20ConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<NonCompliantERC20>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): NonCompliantERC20;
    connect(signer: Signer): NonCompliantERC20__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5060cd8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063095ea7b314602d575b600080fd5b604060383660046054565b600092915050565b604051901515815260200160405180910390f35b60008060408385031215606657600080fd5b823573ffffffffffffffffffffffffffffffffffffffff81168114608957600080fd5b94602093909301359350505056fea2646970667358221220efc54dde003b323b5557889b52b8139bf30ed15a931ae5c4bd867527348a59bc64736f6c634300080a0033";
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): NonCompliantERC20Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): NonCompliantERC20;
}
export {};
