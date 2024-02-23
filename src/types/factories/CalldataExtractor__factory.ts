/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  CalldataExtractor,
  CalldataExtractorInterface,
} from "../CalldataExtractor";

const _abi = [
  {
    type: "function",
    name: "extractTimestampsAndAssertAllAreEqual",
    inputs: [],
    outputs: [
      {
        name: "extractedTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "error",
    name: "CalldataMustHaveValidPayload",
    inputs: [],
  },
  {
    type: "error",
    name: "CalldataOverOrUnderFlow",
    inputs: [],
  },
  {
    type: "error",
    name: "DataPackageTimestampMustNotBeZero",
    inputs: [],
  },
  {
    type: "error",
    name: "DataPackageTimestampsMustBeEqual",
    inputs: [],
  },
  {
    type: "error",
    name: "EachSignerMustProvideTheSameValue",
    inputs: [],
  },
  {
    type: "error",
    name: "EmptyCalldataPointersArr",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectUnsignedMetadataSize",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientNumberOfUniqueSigners",
    inputs: [
      {
        name: "receivedSignersCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "requiredSignersCount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidCalldataPointer",
    inputs: [],
  },
  {
    type: "error",
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
    inputs: [],
  },
  {
    type: "error",
    name: "SignerNotAuthorised",
    inputs: [
      {
        name: "receivedSigner",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506104b7806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c806355a547d514610030575b600080fd5b61003861004a565b60405190815260200160405180910390f35b6000806100556101ad565b90506000610062826102e2565b61ffff169050806000036100a2576040517f8552ff3c00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6100ad60028361040c565b915060005b818110156101a75760006100c584610335565b90506000806100d560688761040c565b905060006100e3823661041f565b9050803592508265ffffffffffff1660000361012b576040517f336dc9d000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b87600003610143578265ffffffffffff169750610184565b878365ffffffffffff1614610184576040517fd9d1f46500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61018e848861040c565b965050505050808061019f90610432565b9150506100b2565b50505090565b60006602ed57011e00007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe036013581161480610215576040517fe7764c9e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60003660291115610252576040517f5796f78a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd73601356000600961028b600362ffffff851661040c565b610295919061040c565b9050366102a360028361040c565b11156102db576040517fc30a7bd700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b9392505050565b6000806102f060208461040c565b90503681111561032c576040517f5796f78a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b36033592915050565b600080600061034384610371565b9092509050604e61035582602061040c565b61035f908461046a565b610369919061040c565b949350505050565b60008080808061038260418761040c565b9050600061039b61039460208461040c565b36906103c8565b8035945090506103ac8160036103c8565b62ffffff9490941697933563ffffffff16965092945050505050565b60006103d4828461041f565b90505b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b808201808211156103d7576103d76103dd565b818103818111156103d7576103d76103dd565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610463576104636103dd565b5060010190565b80820281158282048414176103d7576103d76103dd56fea26469706673582212200c8cf363a34f56630ab2f1396b79389f83dba2498c9ffbce953e050f90996f7e64736f6c63430008110033";

type CalldataExtractorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CalldataExtractorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CalldataExtractor__factory extends ContractFactory {
  constructor(...args: CalldataExtractorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CalldataExtractor> {
    return super.deploy(overrides || {}) as Promise<CalldataExtractor>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CalldataExtractor {
    return super.attach(address) as CalldataExtractor;
  }
  override connect(signer: Signer): CalldataExtractor__factory {
    return super.connect(signer) as CalldataExtractor__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CalldataExtractorInterface {
    return new utils.Interface(_abi) as CalldataExtractorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CalldataExtractor {
    return new Contract(address, _abi, signerOrProvider) as CalldataExtractor;
  }
}