import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CurveV1AdapterStETH, CurveV1AdapterStETHInterface } from "../../../../../contracts/adapters/curve/CurveV1_stETH.sol/CurveV1AdapterStETH";
declare type CurveV1AdapterStETHConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CurveV1AdapterStETH__factory extends ContractFactory {
    constructor(...args: CurveV1AdapterStETHConstructorParams);
    deploy(_creditManager: string, _curveStETHPoolGateway: string, _lp_token: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<CurveV1AdapterStETH>;
    getDeployTransaction(_creditManager: string, _curveStETHPoolGateway: string, _lp_token: string, overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): CurveV1AdapterStETH;
    connect(signer: Signer): CurveV1AdapterStETH__factory;
    static readonly bytecode = "0x6101806040523480156200001257600080fd5b50604051620047ca380380620047ca8339810160408190526200003591620004bf565b82828260008383838383836001600160a01b03821615806200005e57506001600160a01b038116155b156200007d57604051635919af9760e11b815260040160405180910390fd5b6001600160a01b038216608081905260408051632f7a188160e01b81529051632f7a1881916004808201926020929091908290030181865afa158015620000c8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000ee919062000509565b6001600160a01b0390811660a05290811660c05260016000558416159050806200011f57506001600160a01b038216155b156200013e57604051635919af9760e11b815260040160405180910390fd5b608051604051630f67c5bd60e41b81526001600160a01b0384811660048301529091169063f67c5bd090602401602060405180830381865afa15801562000189573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001af91906200052e565b620001dd57604051634c607af960e11b81526001600160a01b03831660048201526024015b60405180910390fd5b6001600160a01b0391821660e0819052610100521661012052506200020590506000620003bb565b6001600160a01b0316610140526200021e6001620003bb565b6001600160a01b039081166101605261014051161580620002495750610160516001600160a01b0316155b156200026857604051635919af9760e11b815260040160405180910390fd5b60805161014051604051630f67c5bd60e41b81526001600160a01b03918216600482015291169063f67c5bd090602401602060405180830381865afa158015620002b6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620002dc91906200052e565b6200030b5761014051604051634c607af960e11b81526001600160a01b039091166004820152602401620001d4565b60805161016051604051630f67c5bd60e41b81526001600160a01b03918216600482015291169063f67c5bd090602401602060405180830381865afa15801562000359573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200037f91906200052e565b620003ae5761016051604051634c607af960e11b81526001600160a01b039091166004820152602401620001d4565b5050505050505062000548565b60c05160405163c661065760e01b8152600481018390526000916001600160a01b03169063c661065790602401602060405180830381865afa92505050801562000424575060408051601f3d908101601f19168201909252620004219181019062000509565b60015b6200049c5760c05160405163046e8dd760e31b8152600f84900b60048201526001600160a01b03909116906323746eb890602401602060405180830381865afa15801562000476573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200049c919062000509565b92915050565b919050565b80516001600160a01b0381168114620004a257600080fd5b600080600060608486031215620004d557600080fd5b620004e084620004a7565b9250620004f060208501620004a7565b91506200050060408501620004a7565b90509250925092565b6000602082840312156200051c57600080fd5b6200052782620004a7565b9392505050565b6000602082840312156200054157600080fd5b5051919050565b60805160a05160c05160e05161010051610120516101405161016051613fbb6200080f60003960008181610405015281816107fd01528181610b4501528181612b16015281816134f401526137120152600081816101f3015281816106dd01528181610a2501528181612b3c0152818161342d015261363b0152600081816102eb01528181611ef4015261359e015260008181610340015281816108ed01528181610cd801528181610e3b015281816112b9015281816113e6015281816123680152818161257c0152818161282601528181612c190152818161316b01526132090152600081816104520152818161187001526119d5015260008181610395015281816104b8015281816106b5015281816107d5015281816109fd01528181610b1d01528181610cb001528181610e1301528181611291015281816113be0152818161158c0152818161165801528181611848015281816119ad01528181611a9601528181611f6601528181612032015281816120b70152818161217b0152818161224701528181612340015281816125540152818161291401528181612d3c01528181612fb00152613805015260008181610265015281816129bd01528181612e0a01526138ae0152600081816103bc015281816105e80152818161072b0152818161084b0152818161091501528181610a7301528181610b9301528181610d2601528181610e8901528181610f92015281816113070152818161143401528181611785015281816118c101528181611a2301528181611b7c015281816123b601528181612442015281816125ca015281816126bf015281816128e501528181612a2701528181612b9201528181612c9001528181612d9201528181613006015281816130a001528181613362015281816134550152818161351c015281816136630152818161373a015281816137d60152818161393e01526139ec0152613fbb6000f3fe608060405234801561001057600080fd5b50600436106101ae5760003560e01c806379bea664116100ee578063c12c21c011610097578063d21220a711610071578063d21220a714610400578063e310327314610427578063ec026ca71461043a578063fc0c546a1461044d57600080fd5b8063c12c21c0146103b7578063c6610657146103de578063ce30bbdb146103f157600080fd5b8063b9947eb0116100c8578063b9947eb014610375578063bb7b8b8014610388578063bd90df701461039057600080fd5b806379bea6641461032857806382c630661461033b578063a6417ed61461036257600080fd5b806333d2ebf21161015b5780635b36389c116101355780635b36389c146102c05780635e0d443f146102d357806364a89bca146102e657806378aa73a41461030d57600080fd5b806333d2ebf2146102875780633df021241461029a5780634903b0d1146102ad57600080fd5b80631a4d01d21161018c5780631a4d01d21461023a5780631af4de831461024d5780632f7a18811461026057600080fd5b806307211ef7146101b35780630b4c7e4d146101d95780630dfe1681146101ee575b600080fd5b6101c66101c1366004613a83565b610474565b6040519081526020015b60405180910390f35b6101ec6101e7366004613b5e565b610541565b005b6102157f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016101d0565b6101ec610248366004613b89565b610bfb565b6101ec61025b366004613a83565b610ef0565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6101ec610295366004613bae565b6111dc565b6101ec6102a8366004613bd8565b611463565b6101c66102bb366004613c1a565b61155a565b6101ec6102ce366004613c33565b6116e3565b6101c66102e1366004613a83565b611a52565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b610315600281565b60405161ffff90911681526020016101d0565b6101ec610336366004613a83565b611ada565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6101ec610370366004613bd8565b611dfb565b610215610383366004613c1a565b611ef0565b6101c66120b3565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6102156103ec366004613c1a565b612149565b60076040516101d09190613c60565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6101ec610435366004613b5e565b61228b565b6101ec610448366004613bae565b6125f9565b6102157f000000000000000000000000000000000000000000000000000000000000000081565b6040517f07211ef7000000000000000000000000000000000000000000000000000000008152600f84810b600483015283900b6024820152604481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906307211ef7906064015b602060405180830381865afa158015610515573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105399190613ca1565b949350505050565b600260005414156105b3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064015b60405180910390fd5b600260009081556040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa158015610644573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106689190613cba565b835190915015610788576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b15801561076f57600080fd5b505af1158015610783573d6000803e3d6000fd5b505050505b6020830151156108a8576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b15801561088f57600080fd5b505af11580156108a3573d6000803e3d6000fd5b505050505b6040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff82811660048301527f0000000000000000000000000000000000000000000000000000000000000000811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b15801561095957600080fd5b505af115801561096d573d6000803e3d6000fd5b505050506109b2816000368080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506128a592505050565b50825115610ad0576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b158015610ab757600080fd5b505af1158015610acb573d6000803e3d6000fd5b505050505b602083015115610bf1576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d906084015b600060405180830381600087803b158015610bd857600080fd5b505af1158015610bec573d6000803e3d6000fd5b505050505b5050600160005550565b60026000541415610c68576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b60026000556040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b158015610d6a57600080fd5b505af1158015610d7e573d6000803e3d6000fd5b505050506000610d8d83612a89565b9050610dd0816000368080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250612b6192505050565b6040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b158015610ecd57600080fd5b505af1158015610ee1573d6000803e3d6000fd5b50506001600055505050505050565b60026000541415610f5d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b600260009081556040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa158015610fee573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110129190613cba565b90506000611031856fffffffffffffffffffffffffffffffff16611ef0565b90506000611050856fffffffffffffffffffffffffffffffff16611ef0565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85811660048301529192506000918416906370a0823190602401602060405180830381865afa1580156110c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110e69190613ca1565b905060018111156111ce577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0160006b033b2e3c9fd0803ce800000061112c8784613d55565b6111369190613d92565b60408051600f8b810b60248301528a900b60448201526064810185905260848082018490528251808303909101815260a49091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa6417ed6000000000000000000000000000000000000000000000000000000001790529091506111cb9086908690869060016000612cf1565b50505b505060016000555050505050565b60026000541415611249576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b60026000556040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b15801561134b57600080fd5b505af115801561135f573d6000803e3d6000fd5b50505050600061136e83612a89565b905061137b83828461306f565b6040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401610bbe565b600260005414156114d0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b600260009081556114f26fffffffffffffffffffffffffffffffff8616612149565b90506000611511856fffffffffffffffffffffffffffffffff16612149565b90506111ce82826000368080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250600192508291506133199050565b6040517f4903b0d1000000000000000000000000000000000000000000000000000000008152600481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690634903b0d190602401602060405180830381865afa925050508015611622575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261161f91810190613ca1565b60015b6116d8576040517f065a80d8000000000000000000000000000000000000000000000000000000008152600f83900b60048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063065a80d890602401602060405180830381865afa1580156116b4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116d89190613ca1565b92915050565b919050565b60026000541415611750576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b600260009081556040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa1580156117e1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118059190613cba565b6040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301529192507f0000000000000000000000000000000000000000000000000000000000000000909116906346fb371d90608401600060405180830381600087803b15801561190757600080fd5b505af115801561191b573d6000803e3d6000fd5b50505050611928816133e8565b611969816000368080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506128a592505050565b506040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401610bbe565b6040517f5e0d443f000000000000000000000000000000000000000000000000000000008152600f84810b600483015283900b6024820152604481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690635e0d443f906064016104f8565b60026000541415611b47576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b600260009081556040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa158015611bd8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bfc9190613cba565b90506000611c1b856fffffffffffffffffffffffffffffffff16612149565b90506000611c3a856fffffffffffffffffffffffffffffffff16612149565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85811660048301529192506000918416906370a0823190602401602060405180830381865afa158015611cac573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cd09190613ca1565b905060018111156111ce577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0160006b033b2e3c9fd0803ce8000000611d168784613d55565b611d209190613d92565b604051600f8a810b602483015289900b604482015260648101849052608481018290529091506111cb908690869086907f3df02124000000000000000000000000000000000000000000000000000000009060a4015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152600180612cf1565b60026000541415611e68576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b60026000908155611e8a6fffffffffffffffffffffffffffffffff8616611ef0565b90506000611ea9856fffffffffffffffffffffffffffffffff16611ef0565b90506111ce82826000368080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201829052506001935091506133199050565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1615611f37576116d882613576565b6040517fb9947eb0000000000000000000000000000000000000000000000000000000008152600481018390527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063b9947eb090602401602060405180830381865afa925050508015611ffc575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201909252611ff991810190613cba565b60015b6116d8576040517fb739953e000000000000000000000000000000000000000000000000000000008152600f83900b60048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063b739953e906024015b602060405180830381865afa15801561208f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116d89190613cba565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663bb7b8b806040518163ffffffff1660e01b8152600401602060405180830381865afa158015612120573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121449190613ca1565b905090565b6040517fc6610657000000000000000000000000000000000000000000000000000000008152600481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063c661065790602401602060405180830381865afa925050508015612211575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261220e91810190613cba565b60015b6116d8576040517f23746eb8000000000000000000000000000000000000000000000000000000008152600f83900b60048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906323746eb890602401612072565b600260005414156122f8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b60026000556040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b1580156123fa57600080fd5b505af115801561240e573d6000803e3d6000fd5b50506040517fe958b704000000000000000000000000000000000000000000000000000000008152336004820152600092507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16915063e958b70490602401602060405180830381865afa15801561249f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124c39190613cba565b90506124cf81846135ec565b612510816000368080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506128a592505050565b506040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000811660248301527f0000000000000000000000000000000000000000000000000000000000000000811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401610bbe565b60026000541415612666576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016105aa565b6002600090815561267683612a89565b6040517fe958b70400000000000000000000000000000000000000000000000000000000815233600482015290915060009073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063e958b70490602401602060405180830381865afa158015612706573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061272a9190613cba565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff80831660048301529192506000918416906370a0823190602401602060405180830381865afa15801561279c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906127c09190613ca1565b90506001811115612899577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff016127f5613a53565b8181876fffffffffffffffffffffffffffffffff166002811061281a5761281a613cf7565b6020020152610bec83857f00000000000000000000000000000000000000000000000000000000000000007f0b4c7e4d00000000000000000000000000000000000000000000000000000000856b033b2e3c9fd0803ce800000061287e8c8a613d55565b6128889190613d92565b604051602401611d76929190613dcd565b50506001600055505050565b6040517f6ce4074a00000000000000000000000000000000000000000000000000000000815260609073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690636ce4074a9061293e9033907f0000000000000000000000000000000000000000000000000000000000000000908790600401613e35565b6000604051808303816000875af115801561295d573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01682016040526129a39190810190613eae565b90503373ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016146116d8576040517f9537301800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84811660048301527f00000000000000000000000000000000000000000000000000000000000000001690639537301890602401600060405180830381600087803b158015612a6b57600080fd5b505af1158015612a7f573d6000803e3d6000fd5b5050505092915050565b60006002600f83900b128015612aa35750600082600f0b12155b612b09576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600f60248201527f496e636f727265637420696e646578000000000000000000000000000000000060448201526064016105aa565b81600f0b600014612b3a577f00000000000000000000000000000000000000000000000000000000000000006116d8565b7f000000000000000000000000000000000000000000000000000000000000000092915050565b6040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa158015612bee573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612c129190613cba565b9050612c427f00000000000000000000000000000000000000000000000000000000000000008484600080613319565b506040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff828116600483015284811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b158015612cd457600080fd5b505af1158015612ce8573d6000803e3d6000fd5b50505050505050565b60608215612def576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000008116602483015287811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b158015612dd657600080fd5b505af1158015612dea573d6000803e3d6000fd5b505050505b6000803373ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001614612f56576040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8a811660048301528916906370a0823190602401602060405180830381865afa158015612e9b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612ebf9190613ca1565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8b81166004830152919350908816906370a0823190602401602060405180830381865afa158015612f2f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612f539190613ca1565b90505b612f658989898986868a613796565b92508415613063576040517f46fb371d00000000000000000000000000000000000000000000000000000000815233600482015273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000008116602483015289811660448301527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60648301527f000000000000000000000000000000000000000000000000000000000000000016906346fb371d90608401600060405180830381600087803b15801561304a57600080fd5b505af115801561305e573d6000803e3d6000fd5b505050505b50509695505050505050565b6040517fe958b7040000000000000000000000000000000000000000000000000000000081523360048201526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063e958b70490602401602060405180830381865afa1580156130fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906131209190613cba565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff80831660048301529192506000917f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa1580156131b2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906131d69190613ca1565b90506001811115613312577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01613310827f0000000000000000000000000000000000000000000000000000000000000000867f1a4d01d200000000000000000000000000000000000000000000000000000000858a6b033b2e3c9fd0803ce80000006132638b84613d55565b61326d9190613d92565b6040516024810193909352600f9190910b60448301526064820152608401604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152600080612cf1565b505b5050505050565b6040517fe958b70400000000000000000000000000000000000000000000000000000000815233600482015260609060009073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063e958b70490602401602060405180830381865afa1580156133a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906133cd9190613cba565b90506133dd818888888888612cf1565b979650505050505050565b6040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff82811660048301527f0000000000000000000000000000000000000000000000000000000000000000811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b15801561349957600080fd5b505af11580156134ad573d6000803e3d6000fd5b50506040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff84811660048301527f0000000000000000000000000000000000000000000000000000000000000000811660248301527f00000000000000000000000000000000000000000000000000000000000000001692506351e3f1609150604401600060405180830381600087803b15801561356257600080fd5b505af1158015613312573d6000803e3d6000fd5b600081613587576116d86000612149565b73ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001663c66106576135ce600185613f6e565b6040518263ffffffff1660e01b815260040161207291815260200190565b8051600110156136c0576040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff83811660048301527f0000000000000000000000000000000000000000000000000000000000000000811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b1580156136a757600080fd5b505af11580156136bb573d6000803e3d6000fd5b505050505b602081015160011015613792576040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff83811660048301527f0000000000000000000000000000000000000000000000000000000000000000811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b15801561377e57600080fd5b505af1158015613310573d6000803e3d6000fd5b5050565b6040517f6ce4074a00000000000000000000000000000000000000000000000000000000815260609073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690636ce4074a9061382f9033907f0000000000000000000000000000000000000000000000000000000000000000908a90600401613e35565b6000604051808303816000875af115801561384e573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01682016040526138949190810190613eae565b90503373ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000161461399f576040517ffcb2ffbe00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff898116600483015288811660248301528781166044830152606482018690526084820185905283151560a48301527f0000000000000000000000000000000000000000000000000000000000000000169063fcb2ffbe9060c401600060405180830381600087803b15801561398257600080fd5b505af1158015613996573d6000803e3d6000fd5b505050506133dd565b6040517f51e3f16000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff898116600483015287811660248301527f000000000000000000000000000000000000000000000000000000000000000016906351e3f16090604401600060405180830381600087803b158015613a3057600080fd5b505af1158015613a44573d6000803e3d6000fd5b50505050979650505050505050565b60405180604001604052806002906020820280368337509192915050565b8035600f81900b81146116de57600080fd5b600080600060608486031215613a9857600080fd5b613aa184613a71565b9250613aaf60208501613a71565b9150604084013590509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600082601f830112613aff57600080fd5b6040516040810181811067ffffffffffffffff82111715613b2257613b22613abf565b8060405250806040840185811115613b3957600080fd5b845b81811015613b53578035835260209283019201613b3b565b509195945050505050565b60008060608385031215613b7157600080fd5b613b7b8484613aee565b946040939093013593505050565b600080600060608486031215613b9e57600080fd5b83359250613aaf60208501613a71565b60008060408385031215613bc157600080fd5b613bca83613a71565b946020939093013593505050565b60008060008060808587031215613bee57600080fd5b613bf785613a71565b9350613c0560208601613a71565b93969395505050506040820135916060013590565b600060208284031215613c2c57600080fd5b5035919050565b60008060608385031215613c4657600080fd5b82359150613c578460208501613aee565b90509250929050565b60208101600f8310613c9b577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b600060208284031215613cb357600080fd5b5051919050565b600060208284031215613ccc57600080fd5b815173ffffffffffffffffffffffffffffffffffffffff81168114613cf057600080fd5b9392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615613d8d57613d8d613d26565b500290565b600082613dc8577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b60608101818460005b6002811015613df5578151835260209283019290910190600101613dd6565b5050508260408301529392505050565b60005b83811015613e20578181015183820152602001613e08565b83811115613e2f576000848401525b50505050565b600073ffffffffffffffffffffffffffffffffffffffff8086168352808516602084015250606060408301528251806060840152613e7a816080850160208701613e05565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01691909101608001949350505050565b600060208284031215613ec057600080fd5b815167ffffffffffffffff80821115613ed857600080fd5b818401915084601f830112613eec57600080fd5b815181811115613efe57613efe613abf565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715613f4457613f44613abf565b81604052828152876020848701011115613f5d57600080fd5b6133dd836020830160208801613e05565b600082821015613f8057613f80613d26565b50039056fea26469706673582212209a42ffd8f4597e08a7f936b11a4cfbcb3939ef77ea6091e272989cb30c3f6ecb64736f6c634300080a0033";
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
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
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
    })[];
    static createInterface(): CurveV1AdapterStETHInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveV1AdapterStETH;
}
export {};