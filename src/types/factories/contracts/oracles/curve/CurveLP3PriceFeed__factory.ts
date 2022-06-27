/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  CurveLP3PriceFeed,
  CurveLP3PriceFeedInterface,
} from "../../../../contracts/oracles/curve/CurveLP3PriceFeed";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "addressProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "_curvePool",
        type: "address",
      },
      {
        internalType: "address",
        name: "_priceFeed1",
        type: "address",
      },
      {
        internalType: "address",
        name: "_priceFeed2",
        type: "address",
      },
      {
        internalType: "address",
        name: "_priceFeed3",
        type: "address",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "CallerNotConfiguratorException",
    type: "error",
  },
  {
    inputs: [],
    name: "CallerNotPausableAdminException",
    type: "error",
  },
  {
    inputs: [],
    name: "CallerNotUnPausableAdminException",
    type: "error",
  },
  {
    inputs: [],
    name: "ChainPriceStaleException",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectLimitsException",
    type: "error",
  },
  {
    inputs: [],
    name: "NotImplementedException",
    type: "error",
  },
  {
    inputs: [],
    name: "PriceFeedRequiresAddressException",
    type: "error",
  },
  {
    inputs: [],
    name: "PriceOracleNotExistsException",
    type: "error",
  },
  {
    inputs: [],
    name: "ValueOutOfRangeExpcetion",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddressException",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroPriceException",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "lowerBound",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "upperBound",
        type: "uint256",
      },
    ],
    name: "NewLimiterParams",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "_acl",
    outputs: [
      {
        internalType: "contract ACL",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curvePool",
    outputs: [
      {
        internalType: "contract ICurvePool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimalsDivider",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "delta",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dependsOnAddress",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    name: "getRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lowerBound",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeed1",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeed2",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeed3",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeedType",
    outputs: [
      {
        internalType: "enum PriceFeedType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_lowerBound",
        type: "uint256",
      },
    ],
    name: "setLimiter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "skipPriceCheck",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "upperBound",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6101606040523480156200001257600080fd5b5060405162001852380380620018528339810160408190526200003591620003a3565b6000805460ff191690558585828260c882826001600160a01b0381166200006f57604051635919af9760e11b815260040160405180910390fd5b806001600160a01b031663087376956040518163ffffffff1660e01b8152600401602060405180830381865afa158015620000ae573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000d49190620004de565b6001600160a01b0316608052508051620000f6906002906020840190620002ca565b505060a052506001600160a01b0382166200012457604051635919af9760e11b815260040160405180910390fd5b6001600160a01b03821660c0819052670de0b6b3a764000060e05260408051630176f71760e71b815290516000929163bb7b8b809160048083019260209291908290030181865afa1580156200017e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001a4919062000503565b9050620001b1816200022a565b505050506001600160a01b0384161580620001d357506001600160a01b038316155b80620001e657506001600160a01b038216155b156200020557604051635919af9760e11b815260040160405180910390fd5b506001600160a01b039283166101005290821661012052166101405250620005d09050565b8062000249576040516309aadd6f60e41b815260040160405180910390fd5b60018190557f82e7ee47180a631312683eeb2a85ad264c9af490d54de5a75bbdb95b968c6de2816200027b8162000296565b6040805192835260208301919091520160405180910390a150565b60a05160009061271090620002ac908262000533565b620002b890846200054e565b620002c4919062000570565b92915050565b828054620002d89062000593565b90600052602060002090601f016020900481019282620002fc576000855562000347565b82601f106200031757805160ff191683800117855562000347565b8280016001018555821562000347579182015b82811115620003475782518255916020019190600101906200032a565b506200035592915062000359565b5090565b5b808211156200035557600081556001016200035a565b80516001600160a01b03811681146200038857600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60008060008060008060c08789031215620003bd57600080fd5b620003c88762000370565b95506020620003d981890162000370565b9550620003e96040890162000370565b9450620003f96060890162000370565b9350620004096080890162000370565b60a08901519093506001600160401b03808211156200042757600080fd5b818a0191508a601f8301126200043c57600080fd5b8151818111156200045157620004516200038d565b604051601f8201601f19908116603f011681019083821181831017156200047c576200047c6200038d565b816040528281528d868487010111156200049557600080fd5b600093505b82841015620004b957848401860151818501870152928501926200049a565b82841115620004cb5760008684830101525b8096505050505050509295509295509295565b600060208284031215620004f157600080fd5b620004fc8262000370565b9392505050565b6000602082840312156200051657600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b600082198211156200054957620005496200051d565b500190565b60008160001904831182151516156200056b576200056b6200051d565b500290565b6000826200058e57634e487b7160e01b600052601260045260246000fd5b500490565b600181811c90821680620005a857607f821691505b60208210811415620005ca57634e487b7160e01b600052602260045260246000fd5b50919050565b60805160a05160c05160e0516101005161012051610140516111e86200066a6000396000818161024001526108db015260008181610396015261081c01526000818161034c01526107750152600081816103250152610a360152600081816101bb015261099c0152600081816101810152610c280152600081816102fe015281816103ee0152818161056a01526106a201526111e86000f3fe608060405234801561001057600080fd5b50600436106101775760003560e01c8063975c19ab116100d8578063ab0ca0e11161008c578063d62ada1111610066578063d62ada1114610389578063e5693f4114610391578063feaf968c146103b857600080fd5b8063ab0ca0e114610347578063b09ad8a01461036e578063bc489a651461037657600080fd5b8063a384d6ff116100bd578063a384d6ff146102f0578063a50cf2c8146102f9578063a834559e1461032057600080fd5b8063975c19ab1461029e5780639a6fc8f5146102a657600080fd5b8063427cb6fe1161012f5780635c975abb116101145780635c975abb1461026a5780637284e416146102815780638456cb591461029657600080fd5b8063427cb6fe1461023b57806354fd4d501461026257600080fd5b8063313ce56711610160578063313ce567146102025780633f4ba83a1461021c5780633fd0875f1461022657600080fd5b806312b495a81461017c578063218751b2146101b6575b600080fd5b6101a37f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b6101dd7f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016101ad565b61020a600881565b60405160ff90911681526020016101ad565b6102246103c0565b005b61022e600381565b6040516101ad9190610dd7565b6101dd7f000000000000000000000000000000000000000000000000000000000000000081565b6101a3600181565b60005460ff165b60405190151581526020016101ad565b6102896104ae565b6040516101ad9190610e18565b61022461053c565b610271600081565b6102b96102b4366004610ea3565b610628565b6040805169ffffffffffffffffffff968716815260208101959095528401929092526060830152909116608082015260a0016101ad565b6101a360015481565b6101dd7f000000000000000000000000000000000000000000000000000000000000000081565b6101a37f000000000000000000000000000000000000000000000000000000000000000081565b6101dd7f000000000000000000000000000000000000000000000000000000000000000081565b6101a3610662565b610224610384366004610ec7565b610674565b610271600181565b6101dd7f000000000000000000000000000000000000000000000000000000000000000081565b6102b9610764565b6040517fd4eb5db00000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063d4eb5db090602401602060405180830381865afa15801561044a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061046e9190610ee0565b6104a4576040517f10332dee00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104ac610a78565b565b600280546104bb90610f02565b80601f01602080910402602001604051908101604052809291908181526020018280546104e790610f02565b80156105345780601f1061050957610100808354040283529160200191610534565b820191906000526020600020905b81548152906001019060200180831161051757829003601f168201915b505050505081565b6040517f3a41ec640000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690633a41ec6490602401602060405180830381865afa1580156105c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ea9190610ee0565b610620576040517fd794b1e700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104ac610b5e565b60008060008060006040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600061066f600154610c1e565b905090565b6040517f5f259aba0000000000000000000000000000000000000000000000000000000081523360048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690635f259aba90602401602060405180830381865afa1580156106fe573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107229190610ee0565b610758576040517f61081c1500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61076181610c67565b50565b6000806000806000806000806000807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa1580156107de573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108029190610f56565b939d50919b5099509750955061081a8a8a8989610ce9565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa158015610885573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108a99190610f56565b9398509196509450925090506108c185858484610ce9565b888412156108d9578499508398508297508196508095505b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa158015610944573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109689190610f56565b93985091965094509250905061098085858484610ce9565b88841215610998578499508398508297508196508095505b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663bb7b8b806040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a05573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a299190610fae565b9050610a3481610d84565b7f0000000000000000000000000000000000000000000000000000000000000000610a5f828c610ff6565b610a6991906110e1565b99505050505050509091929394565b60005460ff16610ae9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064015b60405180910390fd5b600080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390a1565b60005460ff1615610bcb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a20706175736564000000000000000000000000000000006044820152606401610ae0565b600080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610b343390565b6000612710610c4d7f000000000000000000000000000000000000000000000000000000000000000082611149565b610c579084611161565b610c61919061119e565b92915050565b80610c9e576040517f9aadd6f000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60018190557f82e7ee47180a631312683eeb2a85ad264c9af490d54de5a75bbdb95b968c6de281610cce81610c1e565b6040805192835260208301919091520160405180910390a150565b60008313610d23576040517f56e05d2b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8369ffffffffffffffffffff168169ffffffffffffffffffff161080610d47575081155b15610d7e576040517fb1cf675500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50505050565b60015480821080610d9c5750610d9981610c1e565b82115b15610dd3576040517fb416da7f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5050565b6020810160068310610e12577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b600060208083528351808285015260005b81811015610e4557858101830151858201604001528201610e29565b81811115610e57576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b69ffffffffffffffffffff8116811461076157600080fd5b600060208284031215610eb557600080fd5b8135610ec081610e8b565b9392505050565b600060208284031215610ed957600080fd5b5035919050565b600060208284031215610ef257600080fd5b81518015158114610ec057600080fd5b600181811c90821680610f1657607f821691505b60208210811415610f50577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b600080600080600060a08688031215610f6e57600080fd5b8551610f7981610e8b565b809550506020860151935060408601519250606086015191506080860151610fa081610e8b565b809150509295509295909350565b600060208284031215610fc057600080fd5b5051919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60008413600084138583048511828216161561103757611037610fc7565b7f8000000000000000000000000000000000000000000000000000000000000000600087128682058812818416161561107257611072610fc7565b6000871292508782058712848416161561108e5761108e610fc7565b878505871281841616156110a4576110a4610fc7565b505050929093029392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000826110f0576110f06110b2565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83147f80000000000000000000000000000000000000000000000000000000000000008314161561114457611144610fc7565b500590565b6000821982111561115c5761115c610fc7565b500190565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561119957611199610fc7565b500290565b6000826111ad576111ad6110b2565b50049056fea26469706673582212205704f1e6142653abbd3c1416976de9e82c5bb58efa7dc8ce910952437d08ca9064736f6c634300080a0033";

type CurveLP3PriceFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CurveLP3PriceFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CurveLP3PriceFeed__factory extends ContractFactory {
  constructor(...args: CurveLP3PriceFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    addressProvider: string,
    _curvePool: string,
    _priceFeed1: string,
    _priceFeed2: string,
    _priceFeed3: string,
    _description: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<CurveLP3PriceFeed> {
    return super.deploy(
      addressProvider,
      _curvePool,
      _priceFeed1,
      _priceFeed2,
      _priceFeed3,
      _description,
      overrides || {}
    ) as Promise<CurveLP3PriceFeed>;
  }
  override getDeployTransaction(
    addressProvider: string,
    _curvePool: string,
    _priceFeed1: string,
    _priceFeed2: string,
    _priceFeed3: string,
    _description: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      addressProvider,
      _curvePool,
      _priceFeed1,
      _priceFeed2,
      _priceFeed3,
      _description,
      overrides || {}
    );
  }
  override attach(address: string): CurveLP3PriceFeed {
    return super.attach(address) as CurveLP3PriceFeed;
  }
  override connect(signer: Signer): CurveLP3PriceFeed__factory {
    return super.connect(signer) as CurveLP3PriceFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CurveLP3PriceFeedInterface {
    return new utils.Interface(_abi) as CurveLP3PriceFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveLP3PriceFeed {
    return new Contract(address, _abi, signerOrProvider) as CurveLP3PriceFeed;
  }
}
