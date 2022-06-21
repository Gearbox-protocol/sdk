/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  CurveV1Mock_2Assets,
  CurveV1Mock_2AssetsInterface,
} from "../../../../../contracts/test/mocks/integrations/CurveV1Mock_2Assets";

const _abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_coins",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "_underlying_coins",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "amounts",
        type: "uint256[2]",
      },
      {
        internalType: "uint256",
        name: "min_mint_amount",
        type: "uint256",
      },
    ],
    name: "add_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "balances",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "coins",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "min_dy",
        type: "uint256",
      },
    ],
    name: "exchange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "min_dy",
        type: "uint256",
      },
    ],
    name: "exchange_underlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
    ],
    name: "get_dy",
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
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
    ],
    name: "get_dy_underlying",
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
    name: "get_virtual_price",
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
    name: "lp_token",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mintLP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256[2]",
        name: "min_amounts",
        type: "uint256[2]",
      },
    ],
    name: "remove_liquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "amounts",
        type: "uint256[2]",
      },
      {
        internalType: "uint256",
        name: "max_burn_amount",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_imbalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_token_amount",
        type: "uint256",
      },
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "min_amount",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "rate_RAY",
        type: "uint256",
      },
    ],
    name: "setRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "rate_RAY",
        type: "uint256",
      },
    ],
    name: "setRateUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "set_virtual_price",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "underlying_coins",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "virtualPrice",
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
  "0x60806040523480156200001157600080fd5b506040516200343f3803806200343f8339810160408190526200003491620002a2565b8151829082906200004d90600290602085019062000133565b5080516200006390600390602084019062000133565b506000601260405162000076906200019d565b6060808252600790820152664352564d6f636b60c81b608082015260a0602082018190526015908201527f43525620666f72204375727665506f6f6c4d6f636b000000000000000000000060c082015260ff909116604082015260e001604051809103906000f080158015620000f0573d6000803e3d6000fd5b50600080546001600160a01b039092166001600160a01b03199283168117909155600180549092161790555050670de0b6b3a7640000600655506200030c915050565b8280548282559060005260206000209081019282156200018b579160200282015b828111156200018b57825182546001600160a01b0319166001600160a01b0390911617825560209092019160019091019062000154565b5062000199929150620001ab565b5090565b6117588062001ce783390190565b5b80821115620001995760008155600101620001ac565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b0381168114620001f057600080fd5b919050565b600082601f8301126200020757600080fd5b815160206001600160401b0380831115620002265762000226620001c2565b8260051b604051601f19603f830116810181811084821117156200024e576200024e620001c2565b6040529384528581018301938381019250878511156200026d57600080fd5b83870191505b8482101562000297576200028782620001d8565b8352918301919083019062000273565b979650505050505050565b60008060408385031215620002b657600080fd5b82516001600160401b0380821115620002ce57600080fd5b620002dc86838701620001f5565b93506020850151915080821115620002f357600080fd5b506200030285828601620001f5565b9150509250929050565b6119cb806200031c6000396000f3fe608060405234801561001057600080fd5b50600436106101515760003560e01c806382c63066116100cd578063b9947eb011610081578063c661065711610066578063c6610657146102b8578063e3103273146102cb578063fc0c546a146102de57600080fd5b8063b9947eb01461029d578063bb7b8b80146102b057600080fd5b806399bd2ba5116100b257806399bd2ba514610264578063a6417ed614610277578063b91434d11461028a57600080fd5b806382c63066146102165780638ea875f31461025b57600080fd5b80634903b0d1116101245780635b36389c116101095780635b36389c146101dd5780635e0d443f146101f0578063710354181461020357600080fd5b80634903b0d1146101b757806356ac3503146101ca57600080fd5b806307211ef7146101565780630b4c7e4d1461017c5780631a4d01d2146101915780633df02124146101a4575b600080fd5b610169610164366004611565565b6102fe565b6040519081526020015b60405180910390f35b61018f61018a366004611638565b61034e565b005b61018f61019f366004611663565b61051f565b61018f6101b2366004611688565b61060e565b6101696101c53660046116ca565b610738565b61018f6101d8366004611565565b6107ee565b61018f6101eb3660046116e3565b61084f565b6101696101fe366004611565565b6109d2565b61018f6102113660046116ca565b600655565b6001546102369073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610173565b61016960065481565b61018f610272366004611710565b610a0e565b61018f610285366004611688565b610a6d565b61018f610298366004611565565b610e2d565b6102366102ab3660046116ca565b610e8e565b600654610169565b6102366102c63660046116ca565b610ec5565b61018f6102d9366004611755565b610ed5565b6000546102369073ffffffffffffffffffffffffffffffffffffffff1681565b600f83810b60009081526005602090815260408083209386900b8352929052908120546b033b2e3c9fd0803ce80000009061033a9084906117b2565b61034491906117ef565b90505b9392505050565b60005b600281101561047d57600083826002811061036e5761036e61182a565b6020020151111561046b576002818154811061038c5761038c61182a565b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff166323b872dd33308685600281106103c7576103c761182a565b60200201516040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b16815273ffffffffffffffffffffffffffffffffffffffff938416600482015292909116602483015260448201526064016020604051808303816000875af1158015610445573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104699190611859565b505b806104758161187b565b915050610351565b506000546040517f40c10f190000000000000000000000000000000000000000000000000000000081523360048201526024810183905273ffffffffffffffffffffffffffffffffffffffff909116906340c10f19906044015b6020604051808303816000875af11580156104f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051a9190611859565b505050565b6000546040517f79cc67900000000000000000000000000000000000000000000000000000000081523360048201526024810185905273ffffffffffffffffffffffffffffffffffffffff909116906379cc6790906044016020604051808303816000875af1158015610596573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ba9190611859565b5061051a33826002856fffffffffffffffffffffffffffffffff16815481106105e5576105e561182a565b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff169190611058565b600061061b8585856109d2565b9050818110156106b2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602760248201527f437572766556314d6f636b3a20494e53554646494349454e545f4f555450555460448201527f5f414d4f554e540000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6107073330856002896fffffffffffffffffffffffffffffffff16815481106106dd576106dd61182a565b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff1692919061112c565b61073133826002876fffffffffffffffffffffffffffffffff16815481106105e5576105e561182a565b5050505050565b60006002828154811061074d5761074d61182a565b6000918252602090912001546040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff909116906370a0823190602401602060405180830381865afa1580156107c4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107e891906118b4565b92915050565b600f83810b60009081526005602090815260408083209386900b8352929052208190556108276b033b2e3c9fd0803ce800000082611190565b600f92830b60009081526005602090815260408083209690950b825294909452919092205550565b60005b600281101561097457600082826002811061086f5761086f61182a565b60200201511115610962576002818154811061088d5761088d61182a565b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff1663a9059cbb338484600281106108c7576108c761182a565b60200201516040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b16815273ffffffffffffffffffffffffffffffffffffffff909216600483015260248201526044016020604051808303816000875af115801561093c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109609190611859565b505b8061096c8161187b565b915050610852565b506000546040517f79cc67900000000000000000000000000000000000000000000000000000000081523360048201526024810184905273ffffffffffffffffffffffffffffffffffffffff909116906379cc6790906044016104d7565b600f83810b60009081526004602090815260408083209386900b8352929052908120546b033b2e3c9fd0803ce80000009061033a9084906117b2565b6000546040517f40c10f1900000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff848116600483015260248201849052909116906340c10f19906044016104d7565b60006002856fffffffffffffffffffffffffffffffff1681548110610a9457610a9461182a565b60009182526020822001546003805473ffffffffffffffffffffffffffffffffffffffff9092169350906fffffffffffffffffffffffffffffffff8816908110610ae057610ae061182a565b60009182526020822001546002805473ffffffffffffffffffffffffffffffffffffffff9092169350906fffffffffffffffffffffffffffffffff8816908110610b2c57610b2c61182a565b60009182526020822001546003805473ffffffffffffffffffffffffffffffffffffffff9092169350906fffffffffffffffffffffffffffffffff8916908110610b7857610b7861182a565b600091825260208220015473ffffffffffffffffffffffffffffffffffffffff169150610ba68989896102fe565b905085811015610c38576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602760248201527f437572766556314d6f636b3a20494e53554646494349454e545f4f555450555460448201527f5f414d4f554e540000000000000000000000000000000000000000000000000060648201526084016106a9565b610c5a73ffffffffffffffffffffffffffffffffffffffff851633308a61112c565b6040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff86811660048301526024820189905285169063095ea7b3906044016020604051808303816000875af1158015610ccf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cf39190611859565b506040517f40c10f190000000000000000000000000000000000000000000000000000000081523060048201526024810188905273ffffffffffffffffffffffffffffffffffffffff8616906340c10f1990604401600060405180830381600087803b158015610d6257600080fd5b505af1158015610d76573d6000803e3d6000fd5b50506040517f1e9a69500000000000000000000000000000000000000000000000000000000081523060048201526024810184905273ffffffffffffffffffffffffffffffffffffffff86169250631e9a69509150604401600060405180830381600087803b158015610de857600080fd5b505af1158015610dfc573d6000803e3d6000fd5b50610e229250505073ffffffffffffffffffffffffffffffffffffffff83163383611058565b505050505050505050565b600f83810b60009081526004602090815260408083209386900b835292905220819055610e666b033b2e3c9fd0803ce800000082611190565b600f92830b60009081526004602090815260408083209690950b825294909452919092205550565b60038181548110610e9e57600080fd5b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff16905081565b60028181548110610e9e57600080fd5b60005b6002811015610ffa576000838260028110610ef557610ef561182a565b60200201351115610fe85760028181548110610f1357610f1361182a565b60009182526020909120015473ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33858460028110610f4d57610f4d61182a565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b16815273ffffffffffffffffffffffffffffffffffffffff9093166004840152602002013560248201526044016020604051808303816000875af1158015610fc2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fe69190611859565b505b80610ff28161187b565b915050610ed8565b506000546040517f79cc67900000000000000000000000000000000000000000000000000000000081523360048201526024810183905273ffffffffffffffffffffffffffffffffffffffff909116906379cc6790906044016104d7565b60405173ffffffffffffffffffffffffffffffffffffffff831660248201526044810182905261051a9084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526112f6565b60405173ffffffffffffffffffffffffffffffffffffffff8085166024830152831660448201526064810182905261118a9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084016110aa565b50505050565b60408051808201909152600281527f4d330000000000000000000000000000000000000000000000000000000000006020820152600090826111ff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106a991906118f9565b50600061120d6002846117ef565b90506b033b2e3c9fd0803ce8000000611246827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61194a565b61125091906117ef565b8411156040518060400160405280600281526020017f4d31000000000000000000000000000000000000000000000000000000000000815250906112c1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106a991906118f9565b5082816112da6b033b2e3c9fd0803ce8000000876117b2565b6112e49190611961565b6112ee91906117ef565b949350505050565b6000611358826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166114029092919063ffffffff16565b80519091501561051a57808060200190518101906113769190611859565b61051a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016106a9565b6060610344848460008585843b611475576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016106a9565b6000808673ffffffffffffffffffffffffffffffffffffffff16858760405161149e9190611979565b60006040518083038185875af1925050503d80600081146114db576040519150601f19603f3d011682016040523d82523d6000602084013e6114e0565b606091505b50915091506114f08282866114fb565b979650505050505050565b6060831561150a575081610347565b82511561151a5782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106a991906118f9565b8035600f81900b811461156057600080fd5b919050565b60008060006060848603121561157a57600080fd5b6115838461154e565b92506115916020850161154e565b9150604084013590509250925092565b600082601f8301126115b257600080fd5b6040516040810181811067ffffffffffffffff821117156115fc577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b806040525080604084018581111561161357600080fd5b845b8181101561162d578035835260209283019201611615565b509195945050505050565b6000806060838503121561164b57600080fd5b61165584846115a1565b946040939093013593505050565b60008060006060848603121561167857600080fd5b833592506115916020850161154e565b6000806000806080858703121561169e57600080fd5b6116a78561154e565b93506116b56020860161154e565b93969395505050506040820135916060013590565b6000602082840312156116dc57600080fd5b5035919050565b600080606083850312156116f657600080fd5b8235915061170784602085016115a1565b90509250929050565b6000806040838503121561172357600080fd5b823573ffffffffffffffffffffffffffffffffffffffff8116811461174757600080fd5b946020939093013593505050565b6000806060838503121561176857600080fd5b604083018481111561177957600080fd5b9294923593505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156117ea576117ea611783565b500290565b600082611825577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60006020828403121561186b57600080fd5b8151801515811461034757600080fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156118ad576118ad611783565b5060010190565b6000602082840312156118c657600080fd5b5051919050565b60005b838110156118e85781810151838201526020016118d0565b8381111561118a5750506000910152565b60208152600082518060208401526119188160408501602087016118cd565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b60008282101561195c5761195c611783565b500390565b6000821982111561197457611974611783565b500190565b6000825161198b8184602087016118cd565b919091019291505056fea2646970667358221220f37499621af37cc48d72b1fef331cd7e866ad73efcf0024179ea0f3b811c2afd64736f6c634300080a003360a06040523480156200001157600080fd5b506040516200175838038062001758833981016040819052620000349162000269565b8251839083906200004d906003906020850190620000f6565b50805162000063906004906020840190620000f6565b505050620000806200007a620000a060201b60201c565b620000a4565b60ff166080525050600680546001600160a01b031916331790556200032b565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b8280546200010490620002ee565b90600052602060002090601f01602090048101928262000128576000855562000173565b82601f106200014357805160ff191683800117855562000173565b8280016001018555821562000173579182015b828111156200017357825182559160200191906001019062000156565b506200018192915062000185565b5090565b5b8082111562000181576000815560010162000186565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620001c457600080fd5b81516001600160401b0380821115620001e157620001e16200019c565b604051601f8301601f19908116603f011681019082821181831017156200020c576200020c6200019c565b816040528381526020925086838588010111156200022957600080fd5b600091505b838210156200024d57858201830151818301840152908201906200022e565b838211156200025f5760008385830101525b9695505050505050565b6000806000606084860312156200027f57600080fd5b83516001600160401b03808211156200029757600080fd5b620002a587838801620001b2565b94506020860151915080821115620002bc57600080fd5b50620002cb86828701620001b2565b925050604084015160ff81168114620002e357600080fd5b809150509250925092565b600181811c908216806200030357607f821691505b602082108114156200032557634e487b7160e01b600052602260045260246000fd5b50919050565b60805161141162000347600039600061025f01526114116000f3fe608060405234801561001057600080fd5b50600436106101515760003560e01c806370a08231116100cd5780639dc29fac11610081578063a9059cbb11610066578063a9059cbb1461034c578063dd62ed3e1461035f578063f2fde38b146103a557600080fd5b80639dc29fac14610326578063a457c2d71461033957600080fd5b806379cc6790116100b257806379cc6790146102ed5780638da5cb5b1461030057806395d89b411461031e57600080fd5b806370a08231146102af578063715018a6146102e557600080fd5b806318160ddd11610124578063313ce56711610109578063313ce56714610258578063395093511461028957806340c10f191461029c57600080fd5b806318160ddd1461023357806323b872dd1461024557600080fd5b806306fdde03146101565780630754617214610174578063095ea7b3146101b95780631652e9fc146101dc575b600080fd5b61015e6103b8565b60405161016b91906111d2565b60405180910390f35b6006546101949073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161016b565b6101cc6101c736600461126e565b61044a565b604051901515815260200161016b565b6102316101ea366004611298565b600680547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b005b6002545b60405190815260200161016b565b6101cc6102533660046112ba565b610460565b60405160ff7f000000000000000000000000000000000000000000000000000000000000000016815260200161016b565b6101cc61029736600461126e565b61054b565b6101cc6102aa36600461126e565b610594565b6102376102bd366004611298565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6102316106a3565b6101cc6102fb36600461126e565b610730565b60055473ffffffffffffffffffffffffffffffffffffffff16610194565b61015e6107be565b6101cc61033436600461126e565b6107cd565b6101cc61034736600461126e565b6107d9565b6101cc61035a36600461126e565b6108b1565b61023761036d3660046112f6565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b6102316103b3366004611298565b6108be565b6060600380546103c790611329565b80601f01602080910402602001604051908101604052809291908181526020018280546103f390611329565b80156104405780601f1061041557610100808354040283529160200191610440565b820191906000526020600020905b81548152906001019060200180831161042357829003601f168201915b5050505050905090565b60006104573384846109ee565b50600192915050565b600061046d848484610ba2565b73ffffffffffffffffffffffffffffffffffffffff8416600090815260016020908152604080832033845290915290205482811015610533576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206160448201527f6c6c6f77616e636500000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b61054085338584036109ee565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909161045791859061058f9086906113ac565b6109ee565b60065460009073ffffffffffffffffffffffffffffffffffffffff163314610618576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f4d696e7465722063616c6c73206f6e6c79000000000000000000000000000000604482015260640161052a565b60065473ffffffffffffffffffffffffffffffffffffffff163314610699576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f4d696e7465722063616c6c73206f6e6c79000000000000000000000000000000604482015260640161052a565b6104578383610e56565b60055473ffffffffffffffffffffffffffffffffffffffff163314610724576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161052a565b61072e6000610f76565b565b60065460009073ffffffffffffffffffffffffffffffffffffffff1633146107b4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f4d696e7465722063616c6c73206f6e6c79000000000000000000000000000000604482015260640161052a565b6104578383610fed565b6060600480546103c790611329565b60006104578383610fed565b33600090815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff861684529091528120548281101561089a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f000000000000000000000000000000000000000000000000000000606482015260840161052a565b6108a733858584036109ee565b5060019392505050565b6000610457338484610ba2565b60055473ffffffffffffffffffffffffffffffffffffffff16331461093f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161052a565b73ffffffffffffffffffffffffffffffffffffffff81166109e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f6464726573730000000000000000000000000000000000000000000000000000606482015260840161052a565b6109eb81610f76565b50565b73ffffffffffffffffffffffffffffffffffffffff8316610a90576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff8216610b33576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f7373000000000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316610c45576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f6472657373000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff8216610ce8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f6573730000000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610d9e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e63650000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff808516600090815260208190526040808220858503905591851681529081208054849290610de29084906113ac565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610e4891815260200190565b60405180910390a350505050565b73ffffffffffffffffffffffffffffffffffffffff8216610ed3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640161052a565b8060026000828254610ee591906113ac565b909155505073ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604081208054839290610f1f9084906113ac565b909155505060405181815273ffffffffffffffffffffffffffffffffffffffff8316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6005805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b73ffffffffffffffffffffffffffffffffffffffff8216611090576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f7300000000000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604090205481811015611146576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f6365000000000000000000000000000000000000000000000000000000000000606482015260840161052a565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604081208383039055600280548492906111829084906113c4565b909155505060405182815260009073ffffffffffffffffffffffffffffffffffffffff8516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610b95565b600060208083528351808285015260005b818110156111ff578581018301518582016040015282016111e3565b81811115611211576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461126957600080fd5b919050565b6000806040838503121561128157600080fd5b61128a83611245565b946020939093013593505050565b6000602082840312156112aa57600080fd5b6112b382611245565b9392505050565b6000806000606084860312156112cf57600080fd5b6112d884611245565b92506112e660208501611245565b9150604084013590509250925092565b6000806040838503121561130957600080fd5b61131283611245565b915061132060208401611245565b90509250929050565b600181811c9082168061133d57607f821691505b60208210811415611377577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600082198211156113bf576113bf61137d565b500190565b6000828210156113d6576113d661137d565b50039056fea26469706673582212203aca2c6f89034594a4c9be0759a151cd353681fd7e5092c7dafec71460ca6caf64736f6c634300080a0033";

type CurveV1Mock_2AssetsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CurveV1Mock_2AssetsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CurveV1Mock_2Assets__factory extends ContractFactory {
  constructor(...args: CurveV1Mock_2AssetsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _coins: string[],
    _underlying_coins: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<CurveV1Mock_2Assets> {
    return super.deploy(
      _coins,
      _underlying_coins,
      overrides || {}
    ) as Promise<CurveV1Mock_2Assets>;
  }
  override getDeployTransaction(
    _coins: string[],
    _underlying_coins: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _coins,
      _underlying_coins,
      overrides || {}
    );
  }
  override attach(address: string): CurveV1Mock_2Assets {
    return super.attach(address) as CurveV1Mock_2Assets;
  }
  override connect(signer: Signer): CurveV1Mock_2Assets__factory {
    return super.connect(signer) as CurveV1Mock_2Assets__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CurveV1Mock_2AssetsInterface {
    return new utils.Interface(_abi) as CurveV1Mock_2AssetsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveV1Mock_2Assets {
    return new Contract(address, _abi, signerOrProvider) as CurveV1Mock_2Assets;
  }
}