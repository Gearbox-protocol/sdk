import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CurveV1StETHPoolGateway, CurveV1StETHPoolGatewayInterface } from "../../../../../contracts/adapters/curve/CurveV1_stETHGateway.sol/CurveV1StETHPoolGateway";
declare type CurveV1StETHPoolGatewayConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CurveV1StETHPoolGateway__factory extends ContractFactory {
    constructor(...args: CurveV1StETHPoolGatewayConstructorParams);
    deploy(_weth: string, _steth: string, _pool: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<CurveV1StETHPoolGateway>;
    getDeployTransaction(_weth: string, _steth: string, _pool: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): CurveV1StETHPoolGateway;
    connect(signer: Signer): CurveV1StETHPoolGateway__factory;
    static readonly bytecode = "0x6101006040523480156200001257600080fd5b5060405162001f9138038062001f918339810160408190526200003591620001ac565b6001600160a01b03831615806200005357506001600160a01b038216155b806200006657506001600160a01b038116155b156200008557604051635919af9760e11b815260040160405180910390fd5b6001600160a01b0380841660805282811660a052811660c081905260408051634163183360e11b815290516382c63066916004808201926020929091908290030181865afa158015620000dc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001029190620001f6565b6001600160a01b0390811660e05260a05160c05160405163095ea7b360e01b81529083166004820152600019602482015291169063095ea7b3906044016020604051808303816000875af11580156200015f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200018591906200021b565b505050506200023f565b80516001600160a01b0381168114620001a757600080fd5b919050565b600080600060608486031215620001c257600080fd5b620001cd846200018f565b9250620001dd602085016200018f565b9150620001ed604085016200018f565b90509250925092565b6000602082840312156200020957600080fd5b62000214826200018f565b9392505050565b6000602082840312156200022e57600080fd5b815180151581146200021457600080fd5b60805160a05160c05160e051611c156200037c600039600081816102b2015281816103a7015281816105f20152818161063401528181610cd60152818161108101526114440152600081816101de0152818161056f0152818161069c0152818161093401528181610a7c01528181610c3601528181610d3b01528181610ebb01528181610f7b01526110e601526000818161035601528181610506015281816107cd015281816109ae01528181610a0c01528181610e530152818161103e0152818161134f01526113f40152600081816101850152818161040e0152818161047f0152818161071b0152818161079f015281816108260152818161087d01528181610aef01528181610b7301528181610da601528181610e2a01528181611017015281816111710152818161121f01526112c60152611c156000f3fe6080604052600436106101125760003560e01c80635e0d443f116100a5578063bb7b8b8011610074578063d21220a711610059578063d21220a714610344578063e310327314610378578063fc0c546a1461039857600080fd5b8063bb7b8b801461030f578063c66106571461032457600080fd5b80635e0d443f1461028057806382c63066146102a0578063a6417ed6146102d4578063b9947eb0146102f457600080fd5b80631a4d01d2116100e15780631a4d01d2146102005780633df02124146102205780634903b0d1146102405780635b36389c1461026057600080fd5b806307211ef71461011e5780630b4c7e4d146101515780630dfe16811461017357806316f0115b146101cc57600080fd5b3661011957005b600080fd5b34801561012a57600080fd5b5061013e6101393660046118df565b6103cb565b6040519081526020015b60405180910390f35b34801561015d57600080fd5b5061017161016c3660046119b2565b6103ff565b005b34801561017f57600080fd5b506101a77f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610148565b3480156101d857600080fd5b506101a77f000000000000000000000000000000000000000000000000000000000000000081565b34801561020c57600080fd5b5061017161021b3660046119dd565b61061a565b34801561022c57600080fd5b5061017161023b366004611a02565b6107f1565b34801561024c57600080fd5b5061013e61025b366004611a44565b610c04565b34801561026c57600080fd5b5061017161027b366004611a5d565b610cbc565b34801561028c57600080fd5b5061013e61029b3660046118df565b610e77565b3480156102ac57600080fd5b506101a77f000000000000000000000000000000000000000000000000000000000000000081565b3480156102e057600080fd5b506101716102ef366004611a02565b610f45565b34801561030057600080fd5b506101a7610139366004611a44565b34801561031b57600080fd5b5061013e610f77565b34801561033057600080fd5b506101a761033f366004611a44565b61100d565b34801561035057600080fd5b506101a77f000000000000000000000000000000000000000000000000000000000000000081565b34801561038457600080fd5b506101716103933660046119b2565b611067565b3480156103a457600080fd5b507f00000000000000000000000000000000000000000000000000000000000000006101a7565b60006040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8151156104f157815161044d907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169033903090611468565b81516040517f2e1a7d4d00000000000000000000000000000000000000000000000000000000815260048101919091527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690632e1a7d4d90602401600060405180830381600087803b1580156104d857600080fd5b505af11580156104ec573d6000803e3d6000fd5b505050505b602082015115610545576020820151610545907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169033903090611468565b81516040517f0b4c7e4d0000000000000000000000000000000000000000000000000000000081527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1691630b4c7e4d916105bb9086908690600401611adc565b6000604051808303818588803b1580156105d457600080fd5b505af11580156105e8573d6000803e3d6000fd5b50505050506106167f0000000000000000000000000000000000000000000000000000000000000000611544565b5050565b61065c73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016333086611468565b6040517f1a4d01d200000000000000000000000000000000000000000000000000000000815260048101849052600f83900b6024820152604481018290527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690631a4d01d290606401600060405180830381600087803b1580156106f557600080fd5b505af1158015610709573d6000803e3d6000fd5b5050505081600f0b600014156107c8577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0476040518263ffffffff1660e01b81526004016000604051808303818588803b15801561078157600080fd5b505af1158015610795573d6000803e3d6000fd5b50505050506107c37f0000000000000000000000000000000000000000000000000000000000000000611544565b505050565b6107c37f0000000000000000000000000000000000000000000000000000000000000000611544565b83600f0b6000148015610807575082600f0b6001145b156109d75761084e73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016333085611468565b6040517f2e1a7d4d000000000000000000000000000000000000000000000000000000008152600481018390527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690632e1a7d4d90602401600060405180830381600087803b1580156108d657600080fd5b505af11580156108ea573d6000803e3d6000fd5b50506040517f3df02124000000000000000000000000000000000000000000000000000000008152600f87810b600483015286900b602482015260448101859052606481018490527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169250633df02124915084906084016000604051808303818588803b15801561099057600080fd5b505af11580156109a4573d6000803e3d6000fd5b50505050506109d27f0000000000000000000000000000000000000000000000000000000000000000611544565b610bfe565b83600f0b60011480156109ed575082600f0b6000145b15610b9757610a3473ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016333085611468565b6040517f3df02124000000000000000000000000000000000000000000000000000000008152600f85810b600483015284900b602482015260448101839052606481018290527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690633df0212490608401600060405180830381600087803b158015610ad557600080fd5b505af1158015610ae9573d6000803e3d6000fd5b505050507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0476040518263ffffffff1660e01b81526004016000604051808303818588803b158015610b5557600080fd5b505af1158015610b69573d6000803e3d6000fd5b50505050506109d27f0000000000000000000000000000000000000000000000000000000000000000611544565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f496e636f727265637420692c6a20706172616d6574657273000000000000000060448201526064015b60405180910390fd5b50505050565b6040517f4903b0d1000000000000000000000000000000000000000000000000000000008152600481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690634903b0d190602401602060405180830381865afa158015610c92573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cb69190611af7565b92915050565b610cfe73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016333085611468565b6040517f5b36389c00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690635b36389c90610d729085908590600401611b10565b600060405180830381600087803b158015610d8c57600080fd5b505af1158015610da0573d6000803e3d6000fd5b505050507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0476040518263ffffffff1660e01b81526004016000604051808303818588803b158015610e0c57600080fd5b505af1158015610e20573d6000803e3d6000fd5b5050505050610e4e7f0000000000000000000000000000000000000000000000000000000000000000611544565b6106167f0000000000000000000000000000000000000000000000000000000000000000611544565b6040517f5e0d443f000000000000000000000000000000000000000000000000000000008152600f84810b600483015283900b6024820152604481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690635e0d443f90606401602060405180830381865afa158015610f17573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f3b9190611af7565b90505b9392505050565b6040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663bb7b8b806040518163ffffffff1660e01b8152600401602060405180830381865afa158015610fe4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110089190611af7565b905090565b60008161103b57507f0000000000000000000000000000000000000000000000000000000000000000919050565b507f0000000000000000000000000000000000000000000000000000000000000000919050565b919050565b6110a973ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016333084611468565b6040517fe310327300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063e31032739061111d9085908590600401611adc565b600060405180830381600087803b15801561113757600080fd5b505af115801561114b573d6000803e3d6000fd5b5050505060018260006002811061116457611164611a8a565b60200201511115611311577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0476040518263ffffffff1660e01b81526004016000604051808303818588803b1580156111d757600080fd5b505af11580156111eb573d6000803e3d6000fd5b50506040517f70a08231000000000000000000000000000000000000000000000000000000008152306004820152600093507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1692506370a082319150602401602060405180830381865afa15801561127d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112a19190611af7565b9050600181111561130f5761130f73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016337fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff840161161f565b505b60208201516001101561143f576040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa1580156113ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113cf9190611af7565b9050600181111561143d5761143d73ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016337fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff840161161f565b505b6106167f0000000000000000000000000000000000000000000000000000000000000000611544565b60405173ffffffffffffffffffffffffffffffffffffffff80851660248301528316604482015260648101829052610bfe9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611675565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009073ffffffffffffffffffffffffffffffffffffffff8316906370a0823190602401602060405180830381865afa1580156115b1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115d59190611af7565b905060018111156106165761061673ffffffffffffffffffffffffffffffffffffffff8316337fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff84015b60405173ffffffffffffffffffffffffffffffffffffffff83166024820152604481018290526107c39084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064016114c2565b60006116d7826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166117819092919063ffffffff16565b8051909150156107c357808060200190518101906116f59190611b24565b6107c3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610bf5565b6060610f3b848460008585843b6117f4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610bf5565b6000808673ffffffffffffffffffffffffffffffffffffffff16858760405161181d9190611b72565b60006040518083038185875af1925050503d806000811461185a576040519150601f19603f3d011682016040523d82523d6000602084013e61185f565b606091505b509150915061186f82828661187a565b979650505050505050565b60608315611889575081610f3e565b8251156118995782518084602001fd5b816040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bf59190611b8e565b8035600f81900b811461106257600080fd5b6000806000606084860312156118f457600080fd5b6118fd846118cd565b925061190b602085016118cd565b9150604084013590509250925092565b600082601f83011261192c57600080fd5b6040516040810181811067ffffffffffffffff82111715611976577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b806040525080604084018581111561198d57600080fd5b845b818110156119a757803583526020928301920161198f565b509195945050505050565b600080606083850312156119c557600080fd5b6119cf848461191b565b946040939093013593505050565b6000806000606084860312156119f257600080fd5b8335925061190b602085016118cd565b60008060008060808587031215611a1857600080fd5b611a21856118cd565b9350611a2f602086016118cd565b93969395505050506040820135916060013590565b600060208284031215611a5657600080fd5b5035919050565b60008060608385031215611a7057600080fd5b82359150611a81846020850161191b565b90509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b8060005b6002811015610bfe578151845260209384019390910190600101611abd565b60608101611aea8285611ab9565b8260408301529392505050565b600060208284031215611b0957600080fd5b5051919050565b82815260608101610f3e6020830184611ab9565b600060208284031215611b3657600080fd5b81518015158114610f3e57600080fd5b60005b83811015611b61578181015183820152602001611b49565b83811115610bfe5750506000910152565b60008251611b84818460208701611b46565b9190910192915050565b6020815260008251806020840152611bad816040850160208701611b46565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016919091016040019291505056fea2646970667358221220b5e709786469dd37350cad496ee3ce683a059204ed494d4e25b34a5a9db8d98364736f6c634300080a0033";
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        name?: undefined;
        outputs?: undefined;
    } | {
        inputs: never[];
        name: string;
        type: string;
        stateMutability?: undefined;
        outputs?: undefined;
    } | {
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
    } | {
        stateMutability: string;
        type: string;
        inputs?: undefined;
        name?: undefined;
        outputs?: undefined;
    })[];
    static createInterface(): CurveV1StETHPoolGatewayInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveV1StETHPoolGateway;
}
export {};