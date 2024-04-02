/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { Errors, ErrorsInterface } from "../Errors";

const _abi = [
  {
    type: "function",
    name: "ACL_CALLER_NOT_CONFIGURATOR",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ACL_CALLER_NOT_PAUSABLE_ADMIN",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AF_CANT_CLOSE_CREDIT_ACCOUNT_IN_THE_SAME_BLOCK",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AF_CREDIT_ACCOUNT_NOT_IN_STOCK",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AF_EXTERNAL_ACCOUNTS_ARE_FORBIDDEN",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AF_MINING_IS_FINISHED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AS_ADDRESS_NOT_FOUND",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CA_CONNECTED_CREDIT_MANAGER_ONLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CA_FACTORY_ONLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CR_CREDIT_MANAGER_ALREADY_ADDED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CR_POOL_ALREADY_ADDED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "INCORRECT_ARRAY_LENGTH",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "INCORRECT_PARAMETER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "INCORRECT_PATH_LENGTH",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MATH_ADDITION_OVERFLOW",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MATH_DIVISION_BY_ZERO",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MATH_MULTIPLICATION_OVERFLOW",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "NOT_IMPLEMENTED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POOL_CANT_ADD_CREDIT_MANAGER_TWICE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POOL_CONNECTED_CREDIT_MANAGERS_ONLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POOL_INCOMPATIBLE_CREDIT_ACCOUNT_MANAGER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POOL_INCORRECT_WITHDRAW_FEE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POOL_MORE_THAN_EXPECTED_LIQUIDITY_LIMIT",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "REGISTERED_CREDIT_ACCOUNT_MANAGERS_ONLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "REGISTERED_POOLS_ONLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TD_CONTRIBUTOR_IS_NOT_REGISTERED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TD_INCORRECT_WEIGHTS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TD_NON_ZERO_BALANCE_AFTER_DISTRIBUTION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TD_WALLET_IS_ALREADY_CONNECTED_TO_VC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WG_DESTINATION_IS_NOT_WETH_COMPATIBLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WG_NOT_ENOUGH_FUNDS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WG_RECEIVE_IS_NOT_ALLOWED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ZERO_ADDRESS_IS_NOT_ALLOWED",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
] as const;

const _bytecode =
  "0x6080806040523461001a5761100f9081610020823930815050f35b600080fdfe604060808152600436101561001357600080fd5b600090813560e01c8063029d234414610e715780630a2b1d3a14610e0a5780630afeee9714610da35780630c9409e714610d3c5780630f5ee48214610cd5578063119427c514610c6e5780632357f36214610c0757806328432c2214610ba05780633647c9f914610b395780633df46fe514610ad25780633f3153b214610a6b5780634349e3d814610a0457806343f6e4ab1461099d578063447d8e421461093657806353278911146108cf57806376d9ebb81461086857806387f88ef41461080157806394391a4a1461079a57806399a98c9914610733578063a27c0370146106cc578063a988ac6014610665578063abc3d254146105fe578063ac75713914610597578063b563b30014610530578063bdcb2576146104c9578063beea5ec214610462578063ccbf9278146103fb578063d1a65a3814610394578063de63cd401461032d578063e7f3be0c146102c6578063ebbd977f1461025f578063fe32e65d146101f85763ff2a04e31461018a57600080fd5b817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906101bf610f2b565b907f434131000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b0390f35b5080fd5b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f09061022e610f2b565b907f544432000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610295610f4f565b907f41434c320000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906102fc610ed8565b907f435200000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610363610f2b565b907f415031000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906103ca610f2b565b907f414634000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610431610f2b565b907f505334000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610498610f2b565b907f574733000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906104ff610ed8565b907f495000000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610566610f2b565b907f544434000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906105cd610f2b565b907f414633000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610634610f2b565b907f544433000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f09061069b610f4f565b907f41434c310000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610702610f2b565b907f505331000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610769610f2b565b907f435232000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906107d0610ed8565b907f435000000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610837610f2b565b907f414632000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f09061089e610f2b565b907f505330000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610905610f2b565b907f544431000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f09061096c610f2b565b907f574732000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f0906109d3610ed8565b907f4e4900000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610a3a610ed8565b907f4d3300000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610aa1610ed8565b907f5a3000000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610b08610ed8565b907f504c00000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610b6f610f2b565b907f574731000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610bd6610f2b565b907f505333000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610c3d610f2b565b907f434132000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610ca4610f2b565b907f505332000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610d0b610ed8565b907f4d3200000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610d72610f2b565b907f414631000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610dd9610ed8565b907f525000000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610e40610f2b565b907f435231000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b50817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101f4576101f090610ea7610ed8565b907f4d3100000000000000000000000000000000000000000000000000000000000060208301525191829182610f73565b604051906040820182811067ffffffffffffffff821117610efc5760405260028252565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051906040820182811067ffffffffffffffff821117610efc5760405260038252565b604051906040820182811067ffffffffffffffff821117610efc5760405260048252565b60208082528251818301819052939260005b858110610fc5575050507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8460006040809697860101520116010190565b818101830151848201604001528201610f8556fea2646970667358221220ad315b5f149cffc99f1566a4bd70cecf084e19a40fa144c6b23eed5eeba0a0dd64736f6c63430008110033";

type ErrorsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ErrorsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Errors__factory extends ContractFactory {
  constructor(...args: ErrorsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Errors> {
    return super.deploy(overrides || {}) as Promise<Errors>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Errors {
    return super.attach(address) as Errors;
  }
  override connect(signer: Signer): Errors__factory {
    return super.connect(signer) as Errors__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ErrorsInterface {
    return new utils.Interface(_abi) as ErrorsInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Errors {
    return new Contract(address, _abi, signerOrProvider) as Errors;
  }
}
