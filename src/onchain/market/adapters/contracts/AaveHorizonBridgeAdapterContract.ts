import {
  type Address,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
  type Hex,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { MultiCall } from "../../../types/index.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iAaveHorizonBridgeAbi } from "../abi/aave/index.js";
import { iAaveHorizonBridgeAdapterAbi } from "../abi/adapters/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iAaveHorizonBridgeAdapterAbi;
type abi = typeof abi;

const protocolAbi = iAaveHorizonBridgeAbi;
type protocolAbi = typeof protocolAbi;

export class AaveHorizonBridgeAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #bridge?: Address;
  #allowedATokens?: Address[];
  #allowedDebtTokens?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "bridge" },
          { type: "address[]", name: "allowedATokens" },
          { type: "address[]", name: "allowedDebtTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#bridge = decoded[2];
      this.#allowedATokens = [...decoded[3]];
      this.#allowedDebtTokens = [...decoded[4]];
    }
  }

  get bridge(): Address {
    if (!this.#bridge) throw new MissingSerializedParamsError("bridge");
    return this.#bridge;
  }

  get allowedATokens(): Address[] {
    if (!this.#allowedATokens)
      throw new MissingSerializedParamsError("allowedATokens");
    return this.#allowedATokens;
  }

  get allowedDebtTokens(): Address[] {
    if (!this.#allowedDebtTokens)
      throw new MissingSerializedParamsError("allowedDebtTokens");
    return this.#allowedDebtTokens;
  }

  public isATokenAllowed(token: Address): boolean {
    return includes(this.allowedATokens, token);
  }

  public isDebtTokenAllowed(token: Address): boolean {
    return includes(this.allowedDebtTokens, token);
  }

  /**
   * Facade call handing `aTokenAmount` of `aToken` to the account owner and
   * borrowing `borrowAmount` of `debtToken` on the owner's behalf into the
   * account.
   */
  public openPositionCall(
    aToken: Address,
    debtToken: Address,
    aTokenAmount: bigint,
    borrowAmount: bigint,
  ): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi,
        functionName: "openPosition",
        args: [aToken, debtToken, aTokenAmount, borrowAmount],
      }),
    };
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      bridge: this.#bridge ? this.labelAddress(this.#bridge) : undefined,
      allowedATokens: this.#allowedATokens?.map(a => this.labelAddress(a)),
      allowedDebtTokens: this.#allowedDebtTokens?.map(a =>
        this.labelAddress(a),
      ),
    };
  }

  /**
   * Opening and closing a position are legal outside a bracket: both amounts
   * are named in the calldata and the bridge moves exactly those, so there is
   * nothing for an on-chain comparison to enforce.
   *
   * Opening hands `aTokenAmount` of the aToken to the account owner and brings
   * `borrowAmount` of the debt token in; closing sends `repayAmount` of the
   * debt token out and brings the aTokens back.
   */
  public override replayOutOfBracketCall(
    balances: AssetsMap,
    calldata: Hex,
  ): boolean {
    const decoded = decodeFunctionData({ abi, data: calldata });
    switch (decoded.functionName) {
      case "openPosition": {
        const [aToken, debtToken, aTokenAmount, borrowAmount] = decoded.args;
        balances.dec(aToken, aTokenAmount);
        balances.inc(debtToken, borrowAmount);
        return true;
      }
      case "closePosition": {
        const [aToken, debtToken, repayAmount, aTokenAmount] = decoded.args;
        balances.dec(debtToken, repayAmount);
        balances.inc(aToken, aTokenAmount);
        return true;
      }
      default:
        return false;
    }
  }
}

const includes = (list: Address[], token: Address): boolean =>
  list.some(a => a.toLowerCase() === token.toLowerCase());
