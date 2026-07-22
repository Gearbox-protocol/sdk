import type { Address } from "viem";
import { iWithdrawalCompressorV313Abi } from "../../../abi/IWithdrawalCompressorV313.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { OnchainRequestableWithdrawal } from "./AbstractWithdrawalCompressorContract.js";
import {
  AbstractWithdrawalCompressorContract,
  iCreditAccountAbi,
  toClaimableWithdrawal,
  toPendingWithdrawal,
  toRequestableWithdrawal,
} from "./AbstractWithdrawalCompressorContract.js";
import { encodeDelayedIntent } from "./intent-codec.js";
import type {
  CurrentWithdrawals,
  GetWithdrawalRequestResultProps,
  RequestableWithdrawal,
  WithdrawalStatus,
} from "./types.js";
import { toWithdrawalStatus } from "./types.js";

const abi = iWithdrawalCompressorV313Abi;
type abi = typeof abi;

/**
 * Batch overload of `getExternalAccountCurrentWithdrawals` as a standalone
 * ABI: the v313 ABI declares both single-token and token-array overloads with
 * the same arity, which viem's type-level overload resolution cannot
 * disambiguate.
 **/
const iExternalWithdrawalsBatchAbi = [
  {
    type: "function",
    name: "getExternalAccountCurrentWithdrawals",
    inputs: [
      {
        name: "withdrawalTokens",
        type: "address[]",
        internalType: "address[]",
      },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct ClaimableWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "withdrawalTokenSpent",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "outputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "claimCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "extraData", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "",
        type: "tuple[]",
        internalType: "struct PendingWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "expectedOutputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          { name: "claimableAt", type: "uint256", internalType: "uint256" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

/**
 * Batch overload of `getWithdrawalStatus` as a standalone ABI: the v313 ABI
 * declares both single-address and address-array overloads with the same
 * arity, which viem's type-level overload resolution cannot disambiguate.
 **/
const iWithdrawalStatusBatchAbi = [
  {
    type: "function",
    name: "getWithdrawalStatus",
    inputs: [
      { name: "redeemers", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      { name: "", type: "uint8[]", internalType: "enum WithdrawalStatus[]" },
    ],
    stateMutability: "view",
  },
] as const;

/**
 * V3.13 implementation of the {@link IWithdrawalCompressorContract} interface.
 * Overrides the legacy fallbacks of the base class with features introduced
 * in v313: withdrawal intents, withdrawal config selection, external account
 * withdrawals and withdrawal statuses.
 **/
export class WithdrawalCompressorV313Contract extends AbstractWithdrawalCompressorContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "WithdrawalCompressorV313",
      abi,
      version: 313,
    });
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getExternalAccountCurrentWithdrawals}
   **/
  public override async getExternalAccountCurrentWithdrawals(
    account: Address,
    ...withdrawalTokens: Address[]
  ): Promise<CurrentWithdrawals> {
    if (withdrawalTokens.length === 0) {
      return { claimable: [], pending: [] };
    }
    const [claimable, pending] = await this.client.readContract({
      address: this.address,
      abi: iExternalWithdrawalsBatchAbi,
      functionName: "getExternalAccountCurrentWithdrawals",
      args: [withdrawalTokens, account],
    });
    // intents are not decoded: they reference credit account operations,
    // which are not applicable to external accounts
    return {
      claimable: claimable.map(w => toClaimableWithdrawal(w, undefined)),
      pending: pending
        .map(w => toPendingWithdrawal(w, undefined))
        .sort((a, b) => (a.claimableAt < b.claimableAt ? -1 : 1)),
    };
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalStatus}
   **/
  public override async getWithdrawalStatus(
    ...redeemers: Address[]
  ): Promise<WithdrawalStatus[]> {
    if (redeemers.length === 0) {
      return [];
    }
    const resp = await this.client.readContract({
      address: this.address,
      abi: iWithdrawalStatusBatchAbi,
      functionName: "getWithdrawalStatus",
      args: [redeemers],
    });
    return resp.map(s => toWithdrawalStatus(s));
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalRequestResult}
   *
   * When an intent is provided, it is abi-encoded and attached to the request
   * as `extraData`. The contract overload accepting `extraData` also requires
   * the withdrawal phantom token; when not provided by the caller, it is
   * resolved the same way the 3-arg overload does it internally: via the
   * withdrawable assets of the account's credit manager.
   **/
  public override async getWithdrawalRequestResult({
    creditAccount,
    token,
    amount,
    withdrawalPhantomToken,
    intent,
  }: GetWithdrawalRequestResultProps): Promise<RequestableWithdrawal> {
    let resp: OnchainRequestableWithdrawal;
    if (intent) {
      const extraData = encodeDelayedIntent(intent);
      let phantomToken = withdrawalPhantomToken;
      if (!phantomToken) {
        const creditManager = await this.client.readContract({
          address: creditAccount,
          abi: iCreditAccountAbi,
          functionName: "creditManager",
        });
        phantomToken = await this.getWithdrawalPhantomToken(
          creditManager,
          token,
        );
      }
      resp = await this.contract.read.getWithdrawalRequestResult([
        creditAccount,
        token,
        phantomToken,
        amount,
        extraData,
      ]);
    } else if (withdrawalPhantomToken) {
      resp = await this.contract.read.getWithdrawalRequestResult([
        creditAccount,
        token,
        withdrawalPhantomToken,
        amount,
      ]);
    } else {
      resp = await this.contract.read.getWithdrawalRequestResult([
        creditAccount,
        token,
        amount,
      ]);
    }
    return toRequestableWithdrawal(resp);
  }
}
