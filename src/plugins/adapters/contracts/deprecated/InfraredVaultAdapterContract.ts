import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../../legacyAdapterOperations.js";
import type { ConcreteAdapterContractOptions } from "../AbstractAdapter.js";
import { AbstractAdapterContract } from "../AbstractAdapter.js";

export const iInfraredVaultAdapterAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositPhantomToken",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exit",
    inputs: [],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getReward",
    inputs: [],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "serialize",
    inputs: [],
    outputs: [{ name: "serializedData", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stake",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeDiff",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakedPhantomToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakingToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawDiff",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawPhantomToken",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  { type: "error", name: "IncorrectStakedPhantomTokenException", inputs: [] },
] as const;

export const iInfraredVaultAbi = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "earned",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "_rewardsToken", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exit",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllRewardTokens",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllRewardsForUser",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct UserReward[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReward",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRewardForUser",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "infrared",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardsVault",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stake",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakingToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const abi = iInfraredVaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iInfraredVaultAbi;
type protocolAbi = typeof protocolAbi;

export class InfraredVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #stakingToken?: Address;
  #stakedPhantomToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "stakingToken" },
          { type: "address", name: "stakedPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#stakingToken = decoded[2];
      this.#stakedPhantomToken = decoded[3];
    }
  }

  get stakingToken(): Address {
    if (!this.#stakingToken)
      throw new MissingSerializedParamsError("stakingToken");
    return this.#stakingToken;
  }

  get stakedPhantomToken(): Address {
    if (!this.#stakedPhantomToken)
      throw new MissingSerializedParamsError("stakedPhantomToken");
    return this.#stakedPhantomToken;
  }

  /** Legacy adapter not present in integrations-v3. */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    _transfers: Transfers,
  ): LegacyAdapterOperation {
    throw new Error(
      `classifyLegacyOperation is not supported for legacy adapter: ${this.contractType}`,
    );
  }
}
