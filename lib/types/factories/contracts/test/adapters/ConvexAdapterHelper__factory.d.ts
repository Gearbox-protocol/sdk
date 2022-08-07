import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ConvexAdapterHelper, ConvexAdapterHelperInterface } from "../../../../contracts/test/adapters/ConvexAdapterHelper";
declare type ConvexAdapterHelperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ConvexAdapterHelper__factory extends ContractFactory {
    constructor(...args: ConvexAdapterHelperConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<ConvexAdapterHelper>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): ConvexAdapterHelper;
    connect(signer: Signer): ConvexAdapterHelper__factory;
    static readonly bytecode = "0x60806040526000805460ff1916600190811790915580546001600160a01b031916737109709ecfa91a80626ff3989d68f67f5b1dd12d17905534801561004457600080fd5b506106ee806100546000396000f3fe608060405234801561001057600080fd5b50600436106101985760003560e01c80637a24edf6116100e3578063c09654731161008c578063f9aa028a11610066578063f9aa028a1461045f578063fa7626d41461047f578063fc99a9731461048c57600080fd5b8063c0965473146103ff578063c12c21c01461041f578063df5144331461043f57600080fd5b8063a8577e88116100bd578063a8577e88146103a7578063aa30240e146103c7578063ba414fa6146103e757600080fd5b80637a24edf614610347578063923c1d6114610367578063a7ea33941461038757600080fd5b80634194a9f81161014557806364243fc31161011f57806364243fc3146102e75780636a4874a1146103075780636f307dc31461032757600080fd5b80634194a9f8146102875780635c91172f146102a7578063614fa6c2146102c757600080fd5b8063278e660911610176578063278e6609146102275780632f7a18811461024757806337a7b7d81461026757600080fd5b80630ae2904a1461019d578063170aa96d146101e75780632630c12f14610207575b600080fd5b6017546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6010546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6008546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600d546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6003546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6007546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600f546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6014546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6015546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6011546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6009546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6006546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6012546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600a546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600e546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600b546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b600c546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6103ef6104ac565b60405190151581526020016101de565b6013546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6002546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6005546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6004546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b6000546103ef9060ff1681565b6016546101bd9073ffffffffffffffffffffffffffffffffffffffff1681565b60008054610100900460ff16156104cc5750600054610100900460ff1690565b6000737109709ecfa91a80626ff3989d68f67f5b1dd12d3b156106075760408051737109709ecfa91a80626ff3989d68f67f5b1dd12d602082018190527f6661696c6564000000000000000000000000000000000000000000000000000082840152825180830384018152606083019093526000929091610571917f667f9d70ca411d70ead50d8d5c22070dafc36ad75f3dcf5e7237b22ade9aecc491608001610647565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290526105a991610683565b6000604051808303816000865af19150503d80600081146105e6576040519150601f19603f3d011682016040523d82523d6000602084013e6105eb565b606091505b50915050808060200190518101906106039190610696565b9150505b919050565b6000815160005b8181101561062d5760208185018101518683015201610613565b8181111561063c576000828601525b509290920192915050565b7fffffffff0000000000000000000000000000000000000000000000000000000083168152600061067b600483018461060c565b949350505050565b600061068f828461060c565b9392505050565b6000602082840312156106a857600080fd5b8151801515811461068f57600080fdfea2646970667358221220661accf2826fc074bad337a75d75a0e99b9ea3ed13c5fc0d14f0466a8021a26264736f6c634300080a0033";
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        anonymous?: undefined;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
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
        anonymous?: undefined;
    })[];
    static createInterface(): ConvexAdapterHelperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ConvexAdapterHelper;
}
export {};
