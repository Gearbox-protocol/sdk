/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  LinearInterestRateModel,
  LinearInterestRateModelInterface,
} from "../../../contracts/pool/LinearInterestRateModel";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "U_optimal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_base",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_slope1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_slope2",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "_R_base_RAY",
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
    name: "_R_slope1_RAY",
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
    name: "_R_slope2_RAY",
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
    name: "_U_Optimal_WAD",
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
    name: "_U_Optimal_inverted_WAD",
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
        name: "expectedLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
    ],
    name: "calcBorrowRate",
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
    name: "getModelParameters",
    outputs: [
      {
        internalType: "uint256",
        name: "U_optimal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_base",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_slope1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "R_slope2",
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
  "0x6101206040523480156200001257600080fd5b5060405162000b1238038062000b1283398101604081905262000035916200021f565b604080518082019091526002815261049560f41b602082015261271085106200007c5760405162461bcd60e51b815260040162000073919062000256565b60405180910390fd5b50604080518082019091526002815261049560f41b6020820152612710841115620000bc5760405162461bcd60e51b815260040162000073919062000256565b50604080518082019091526002815261049560f41b6020820152612710831115620000fc5760405162461bcd60e51b815260040162000073919062000256565b5060006200012185670de0b6b3a7640000620001c160201b6200043c1790919060201c565b608081905290506200013c81670de0b6b3a7640000620002c4565b60a052620001636b033b2e3c9fd0803ce800000085620001c1602090811b6200043c17901c565b60c0526200018a6b033b2e3c9fd0803ce800000084620001c1602090811b6200043c17901c565b60e052620001b16b033b2e3c9fd0803ce800000083620001c1602090811b6200043c17901c565b61010052506200036c9350505050565b6000821580620001cf575081155b15620001de5750600062000219565b612710620001ee600282620002f4565b61ffff16620001fe848662000318565b6200020a91906200033a565b62000216919062000355565b90505b92915050565b600080600080608085870312156200023657600080fd5b505082516020840151604085015160609095015191969095509092509050565b600060208083528351808285015260005b81811015620002855785810183015185820160400152820162000267565b8181111562000298576000604083870101525b50601f01601f1916929092016040019392505050565b634e487b7160e01b600052601160045260246000fd5b600082821015620002d957620002d9620002ae565b500390565b634e487b7160e01b600052601260045260246000fd5b600061ffff808416806200030c576200030c620002de565b92169190910492915050565b6000816000190483118215151615620003355762000335620002ae565b500290565b60008219821115620003505762000350620002ae565b500190565b600082620003675762000367620002de565b500490565b60805160a05160c05160e0516101005161070162000411600039600081816101840152818161030b015261041701526000818160e70152818161025a0152818161033e01526103f401526000818161010e015281816101bc0152818161028e0152818161035f01526103d101526000818161015d01526102bc01526000818160b80152818161020d01528181610235015281816102e001526103a101526107016000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80639cd3fdb51161005b5780639cd3fdb514610109578063c8284e6d14610130578063f81d438114610158578063fc4b2b781461017f57600080fd5b806342568d441461008d57806350ced104146100b357806354fd4d50146100da5780639aec06ea146100e2575b600080fd5b6100a061009b366004610537565b6101a6565b6040519081526020015b60405180910390f35b6100a07f000000000000000000000000000000000000000000000000000000000000000081565b6100a0600181565b6100a07f000000000000000000000000000000000000000000000000000000000000000081565b6100a07f000000000000000000000000000000000000000000000000000000000000000081565b610138610397565b6040805194855260208501939093529183015260608201526080016100aa565b6100a07f000000000000000000000000000000000000000000000000000000000000000081565b6100a07f000000000000000000000000000000000000000000000000000000000000000081565b60008215806101b457508183105b156101e057507f0000000000000000000000000000000000000000000000000000000000000000610391565b6000836101ed8482610588565b6101ff90670de0b6b3a764000061059f565b610209919061060b565b90507f00000000000000000000000000000000000000000000000000000000000000008110156102ba577f000000000000000000000000000000000000000000000000000000000000000061027e827f000000000000000000000000000000000000000000000000000000000000000061059f565b610288919061060b565b6102b2907f000000000000000000000000000000000000000000000000000000000000000061061f565b915050610391565b7f00000000000000000000000000000000000000000000000000000000000000006103057f000000000000000000000000000000000000000000000000000000000000000083610588565b61032f907f000000000000000000000000000000000000000000000000000000000000000061059f565b610339919061060b565b6103837f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000061061f565b61038d919061061f565b9150505b92915050565b60008080806103ce7f0000000000000000000000000000000000000000000000000000000000000000670de0b6b3a764000061048d565b947f000000000000000000000000000000000000000000000000000000000000000094507f000000000000000000000000000000000000000000000000000000000000000093507f000000000000000000000000000000000000000000000000000000000000000092509050565b6000821580610449575081155b1561045657506000610391565b612710610464600282610637565b61ffff16610472848661059f565b61047c919061061f565b610486919061060b565b9392505050565b60408051808201909152600281527f4d33000000000000000000000000000000000000000000000000000000000000602082015260009082610505576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104fc9190610658565b60405180910390fd5b50600061051360028461060b565b905082816105236127108761059f565b61052d919061061f565b61038d919061060b565b6000806040838503121561054a57600080fd5b50508035926020909101359150565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008282101561059a5761059a610559565b500390565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156105d7576105d7610559565b500290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60008261061a5761061a6105dc565b500490565b6000821982111561063257610632610559565b500190565b600061ffff8084168061064c5761064c6105dc565b92169190910492915050565b600060208083528351808285015260005b8181101561068557858101830151858201604001528201610669565b81811115610697576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01692909201604001939250505056fea26469706673582212205428f2a5431c3c1928793ca5c2c8825fc467250326c6d5ae84382a87d1e80b2164736f6c634300080a0033";

type LinearInterestRateModelConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LinearInterestRateModelConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LinearInterestRateModel__factory extends ContractFactory {
  constructor(...args: LinearInterestRateModelConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    U_optimal: BigNumberish,
    R_base: BigNumberish,
    R_slope1: BigNumberish,
    R_slope2: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<LinearInterestRateModel> {
    return super.deploy(
      U_optimal,
      R_base,
      R_slope1,
      R_slope2,
      overrides || {},
    ) as Promise<LinearInterestRateModel>;
  }
  override getDeployTransaction(
    U_optimal: BigNumberish,
    R_base: BigNumberish,
    R_slope1: BigNumberish,
    R_slope2: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(
      U_optimal,
      R_base,
      R_slope1,
      R_slope2,
      overrides || {},
    );
  }
  override attach(address: string): LinearInterestRateModel {
    return super.attach(address) as LinearInterestRateModel;
  }
  override connect(signer: Signer): LinearInterestRateModel__factory {
    return super.connect(signer) as LinearInterestRateModel__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LinearInterestRateModelInterface {
    return new utils.Interface(_abi) as LinearInterestRateModelInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): LinearInterestRateModel {
    return new Contract(
      address,
      _abi,
      signerOrProvider,
    ) as LinearInterestRateModel;
  }
}
