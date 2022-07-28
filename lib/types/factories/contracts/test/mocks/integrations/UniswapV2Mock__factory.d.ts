import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { UniswapV2Mock, UniswapV2MockInterface } from "../../../../../contracts/test/mocks/integrations/UniswapV2Mock";
declare type UniswapV2MockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class UniswapV2Mock__factory extends ContractFactory {
    constructor(...args: UniswapV2MockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<UniswapV2Mock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): UniswapV2Mock;
    connect(signer: Signer): UniswapV2Mock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061187f806100206000396000f3fe6080604052600436106101a15760003560e01c80638803dbee116100e1578063baa2abde1161008a578063ded9382a11610064578063ded9382a14610417578063e8e3370014610444578063f305d7191461048c578063fb3bdb411461032257600080fd5b8063baa2abde146103cd578063c45a015514610375578063d06ca61f146103f757600080fd5b8063ad615dec116100bb578063ad615dec146101e9578063af2979eb14610391578063b6f9de95146103b857600080fd5b80638803dbee1461033557806397edd4fa14610355578063ad5c46481461037557600080fd5b80634a25d94a1161014e5780635c11d795116101285780635c11d795146102ff578063791ac947146102ff5780637ff36ab51461032257806385f8c259146101e957600080fd5b80634a25d94a146102175780635911fb9a146102b25780635b0d5984146102d457600080fd5b80631f00ca741161017f5780631f00ca74146102445780632195995c1461026457806338ed17391461029257600080fd5b806302751cec146101a6578063054d50d4146101e957806318cbafe514610217575b600080fd5b3480156101b257600080fd5b506101cf6101c1366004611189565b600080965096945050505050565b604080519283526020830191909152015b60405180910390f35b3480156101f557600080fd5b506102096102043660046111e1565b6104aa565b6040519081526020016101e0565b34801561022357600080fd5b50610237610232366004611259565b6104b4565b6040516101e091906112c9565b34801561025057600080fd5b5061023761025f36600461130d565b6104e4565b34801561027057600080fd5b506101cf61027f36600461137b565b6000809b509b9950505050505050505050565b34801561029e57600080fd5b506102376102ad366004611259565b610511565b3480156102be57600080fd5b506102d26102cd36600461141f565b610748565b005b3480156102e057600080fd5b506102096102ef36600461145b565b60009a9950505050505050505050565b34801561030b57600080fd5b506102d261031a366004611259565b505050505050565b6102376103303660046114ed565b6107ca565b34801561034157600080fd5b50610237610350366004611259565b6107f9565b34801561036157600080fd5b50610209610370366004611553565b610a48565b34801561038157600080fd5b50604051600081526020016101e0565b34801561039d57600080fd5b506102096103ac366004611189565b60009695505050505050565b6102d26103c63660046114ed565b5050505050565b3480156103d957600080fd5b506101cf6103e8366004611595565b60008097509795505050505050565b34801561040357600080fd5b5061023761041236600461130d565b610b4c565b34801561042357600080fd5b506101cf61043236600461145b565b6000809a509a98505050505050505050565b34801561045057600080fd5b5061047161045f3660046115ff565b60008080985098509895505050505050565b604080519384526020840192909252908201526060016101e0565b61047161049a366004611189565b6000808096509650969350505050565b60005b9392505050565b60408051600180825281830190925260609160009190602080830190803683370190505098975050505050505050565b60408051600180825281830190925260609160009190602080830190803683370190505095945050505050565b60608142811015610583576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f556e69737761705632526f757465723a2045585049524544000000000000000060448201526064015b60405180910390fd5b6000610590898888610b4c565b61059b6001886116a2565b815181106105ab576105ab6116b9565b6020026020010151905087811015610645576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602b60248201527f556e69737761705632526f757465723a20494e53554646494349454e545f4f5560448201527f545055545f414d4f554e54000000000000000000000000000000000000000000606482015260840161057a565b61069133308b8a8a600081811061065e5761065e6116b9565b905060200201602081019061067391906116e8565b73ffffffffffffffffffffffffffffffffffffffff16929190610c65565b6106db8582898960018181106106a9576106a96116b9565b90506020020160208101906106be91906116e8565b73ffffffffffffffffffffffffffffffffffffffff169190610d47565b6040805160028082526060820183526000926020830190803683370190505090508981600081518110610710576107106116b9565b6020026020010181815250508181600181518110610730576107306116b9565b60209081029190910101529998505050505050505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152602081815260408083209386168352929052208190556107916b033b2e3c9fd0803ce800000082610da2565b73ffffffffffffffffffffffffffffffffffffffff92831660009081526020818152604080832096909516825294909452919092205550565b604080516001808252818301909252606091600091906020808301908036833701905050979650505050505050565b60608142811015610866576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f556e69737761705632526f757465723a20455850495245440000000000000000604482015260640161057a565b60006108728787610a48565b9050806108db576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f556e69737761704d6f636b3a2052617465206973206e6f742073657475700000604482015260640161057a565b60006103e5826108f76b033b2e3c9fd0803ce80000008d611703565b6109019190611740565b61090d906103e8611703565b6109179190611740565b9050888111156109a9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602760248201527f556e69737761705632526f757465723a204558434553534956455f494e50555460448201527f5f414d4f554e5400000000000000000000000000000000000000000000000000606482015260840161057a565b6109c23330838b8b600081811061065e5761065e6116b9565b6109da868b8a8a60018181106106a9576106a96116b9565b6040805160028082526060820183526000926020830190803683370190505090508181600081518110610a0f57610a0f6116b9565b6020026020010181815250508a81600181518110610a2f57610a2f6116b9565b60209081029190910101529a9950505050505050505050565b60008083836000818110610a5e57610a5e6116b9565b9050602002016020810190610a7391906116e8565b905060008484610a846001826116a2565b818110610a9357610a936116b9565b9050602002016020810190610aa891906116e8565b73ffffffffffffffffffffffffffffffffffffffff808416600090815260208181526040808320938516835292905220549350905082610b44576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f546f6b656e2070616972206e6f7420666f756e64000000000000000000000000604482015260640161057a565b505092915050565b60606000610b5a8484610a48565b905080610bc3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f556e69737761704d6f636b3a2052617465206973206e6f742073657475700000604482015260640161057a565b6040805160028082526060820183526000926020830190803683370190505090508581600081518110610bf857610bf86116b9565b60209081029190910101526103e86103e56b033b2e3c9fd0803ce8000000610c20858a611703565b610c2a9190611740565b610c349190611703565b610c3e9190611740565b81600181518110610c5157610c516116b9565b602090810291909101015295945050505050565b60405173ffffffffffffffffffffffffffffffffffffffff80851660248301528316604482015260648101829052610d419085907f23b872dd00000000000000000000000000000000000000000000000000000000906084015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152610f08565b50505050565b60405173ffffffffffffffffffffffffffffffffffffffff8316602482015260448101829052610d9d9084907fa9059cbb0000000000000000000000000000000000000000000000000000000090606401610cbf565b505050565b60408051808201909152600281527f4d33000000000000000000000000000000000000000000000000000000000000602082015260009082610e11576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057a91906117a7565b506000610e1f600284611740565b90506b033b2e3c9fd0803ce8000000610e58827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6116a2565b610e629190611740565b8411156040518060400160405280600281526020017f4d3100000000000000000000000000000000000000000000000000000000000081525090610ed3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057a91906117a7565b508281610eec6b033b2e3c9fd0803ce800000087611703565b610ef691906117f8565b610f009190611740565b949350505050565b6000610f6a826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166110149092919063ffffffff16565b805190915015610d9d5780806020019051810190610f889190611810565b610d9d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f74207375636365656400000000000000000000000000000000000000000000606482015260840161057a565b6060610f00848460008585843b611087576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161057a565b6000808673ffffffffffffffffffffffffffffffffffffffff1685876040516110b0919061182d565b60006040518083038185875af1925050503d80600081146110ed576040519150601f19603f3d011682016040523d82523d6000602084013e6110f2565b606091505b509150915061110282828661110d565b979650505050505050565b6060831561111c5750816104ad565b82511561112c5782518084602001fd5b816040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057a91906117a7565b803573ffffffffffffffffffffffffffffffffffffffff8116811461118457600080fd5b919050565b60008060008060008060c087890312156111a257600080fd5b6111ab87611160565b95506020870135945060408701359350606087013592506111ce60808801611160565b915060a087013590509295509295509295565b6000806000606084860312156111f657600080fd5b505081359360208301359350604090920135919050565b60008083601f84011261121f57600080fd5b50813567ffffffffffffffff81111561123757600080fd5b6020830191508360208260051b850101111561125257600080fd5b9250929050565b60008060008060008060a0878903121561127257600080fd5b8635955060208701359450604087013567ffffffffffffffff81111561129757600080fd5b6112a389828a0161120d565b90955093506112b6905060608801611160565b9150608087013590509295509295509295565b6020808252825182820181905260009190848201906040850190845b81811015611301578351835292840192918401916001016112e5565b50909695505050505050565b60008060006040848603121561132257600080fd5b83359250602084013567ffffffffffffffff81111561134057600080fd5b61134c8682870161120d565b9497909650939450505050565b801515811461136757600080fd5b50565b803560ff8116811461118457600080fd5b60008060008060008060008060008060006101608c8e03121561139d57600080fd5b6113a68c611160565b9a506113b460208d01611160565b995060408c0135985060608c0135975060808c013596506113d760a08d01611160565b955060c08c0135945060e08c01356113ee81611359565b93506113fd6101008d0161136a565b92506101208c013591506101408c013590509295989b509295989b9093969950565b60008060006060848603121561143457600080fd5b61143d84611160565b925061144b60208501611160565b9150604084013590509250925092565b6000806000806000806000806000806101408b8d03121561147b57600080fd5b6114848b611160565b995060208b0135985060408b0135975060608b013596506114a760808c01611160565b955060a08b0135945060c08b01356114be81611359565b93506114cc60e08c0161136a565b92506101008b013591506101208b013590509295989b9194979a5092959850565b60008060008060006080868803121561150557600080fd5b85359450602086013567ffffffffffffffff81111561152357600080fd5b61152f8882890161120d565b9095509350611542905060408701611160565b949793965091946060013592915050565b6000806020838503121561156657600080fd5b823567ffffffffffffffff81111561157d57600080fd5b6115898582860161120d565b90969095509350505050565b600080600080600080600060e0888a0312156115b057600080fd5b6115b988611160565b96506115c760208901611160565b95506040880135945060608801359350608088013592506115ea60a08901611160565b915060c0880135905092959891949750929550565b600080600080600080600080610100898b03121561161c57600080fd5b61162589611160565b975061163360208a01611160565b965060408901359550606089013594506080890135935060a0890135925061165d60c08a01611160565b915060e089013590509295985092959890939650565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000828210156116b4576116b4611673565b500390565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000602082840312156116fa57600080fd5b6104ad82611160565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561173b5761173b611673565b500290565b600082611776577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b60005b8381101561179657818101518382015260200161177e565b83811115610d415750506000910152565b60208152600082518060208401526117c681604085016020870161177b565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b6000821982111561180b5761180b611673565b500190565b60006020828403121561182257600080fd5b81516104ad81611359565b6000825161183f81846020870161177b565b919091019291505056fea2646970667358221220a0cbca16333b991752d525742c5626af06989d2afecc9a730e27bf22d00d52d964736f6c634300080a0033";
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
    static createInterface(): UniswapV2MockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): UniswapV2Mock;
}
export {};