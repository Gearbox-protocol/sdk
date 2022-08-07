import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PlaygroundTest, PlaygroundTestInterface } from "../../../../contracts/test/Playground.t.sol/PlaygroundTest";
declare type PlaygroundTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class PlaygroundTest__factory extends ContractFactory {
    constructor(...args: PlaygroundTestConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<PlaygroundTest>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): PlaygroundTest;
    connect(signer: Signer): PlaygroundTest__factory;
    static readonly bytecode = "0x60806040526000805461ff01600160b01b031916757109709ecfa91a80626ff3989d68f67f5b1dd12d0001179055600560015534801561003e57600080fd5b5061032c8061004e6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80630a9254e4146100515780639319393e14610085578063ba414fa6146100c1578063fa7626d4146100dd575b600080fd5b61008360008052600260205260377fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b005b6100836001805460061790556000805260026020526115a97fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b6100c96100ea565b604051901515815260200160405180910390f35b6000546100c99060ff1681565b60008054610100900460ff161561010a5750600054610100900460ff1690565b6000737109709ecfa91a80626ff3989d68f67f5b1dd12d3b156102455760408051737109709ecfa91a80626ff3989d68f67f5b1dd12d602082018190527f6661696c65640000000000000000000000000000000000000000000000000000828401528251808303840181526060830190935260009290916101af917f667f9d70ca411d70ead50d8d5c22070dafc36ad75f3dcf5e7237b22ade9aecc491608001610285565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290526101e7916102c1565b6000604051808303816000865af19150503d8060008114610224576040519150601f19603f3d011682016040523d82523d6000602084013e610229565b606091505b509150508080602001905181019061024191906102d4565b9150505b919050565b6000815160005b8181101561026b5760208185018101518683015201610251565b8181111561027a576000828601525b509290920192915050565b7fffffffff000000000000000000000000000000000000000000000000000000008316815260006102b9600483018461024a565b949350505050565b60006102cd828461024a565b9392505050565b6000602082840312156102e657600080fd5b815180151581146102cd57600080fdfea2646970667358221220fa3fa692c6956abc3a8d742bb8b31609f9731858c226161c4269f10a9f477a6064736f6c634300080a0033";
    static readonly abi: ({
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
    static createInterface(): PlaygroundTestInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): PlaygroundTest;
}
export {};
