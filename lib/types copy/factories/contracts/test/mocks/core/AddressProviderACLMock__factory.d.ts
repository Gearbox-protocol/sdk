import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AddressProviderACLMock, AddressProviderACLMockInterface } from "../../../../../contracts/test/mocks/core/AddressProviderACLMock";
declare type AddressProviderACLMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AddressProviderACLMock__factory extends ContractFactory {
    constructor(...args: AddressProviderACLMockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<AddressProviderACLMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): AddressProviderACLMock;
    connect(signer: Signer): AddressProviderACLMock__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b50600080546001600160a01b03191630178155338152600160208190526040909120805460ff1916909117905560ab8061004a6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80630873769514602d575b600080fd5b600054604c9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f3fea2646970667358221220519a51ac0f171e21baa175b9450b5f9a6f38cf4c001073c480039dc27e2be3b364736f6c634300080a0033";
    static readonly abi: ({
        inputs: never[];
        stateMutability: string;
        type: string;
        name?: undefined;
        outputs?: undefined;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): AddressProviderACLMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AddressProviderACLMock;
}
export {};
