import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
  type Hex,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { MultiCall } from "../../../types/index.js";
import { AddressMap, type AssetsMap } from "../../../utils/index.js";
import { iAaveV3PoolAbi } from "../abi/aave/index.js";
import { iAaveV3PoolAdapterAbi } from "../abi/adapters/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iAaveV3PoolAdapterAbi;
type abi = typeof abi;

const protocolAbi = iAaveV3PoolAbi;
type protocolAbi = typeof protocolAbi;

interface SupplyOrWithdraw {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
}

export class AaveV3PoolAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #pool?: Address;
  #referralCode?: number;
  #allowedAssets?: Address[];
  readonly #aTokenReads = new AddressMap<Promise<Address>>(
    undefined,
    "aTokenReads",
  );
  readonly #aTokens = new AddressMap<Address>(undefined, "aTokens");

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "pool" },
          { type: "uint16", name: "referralCode" },
          { type: "address[]", name: "allowedAssets" },
        ],
        args.baseParams.serializedParams,
      );

      this.#pool = decoded[2];
      this.#referralCode = decoded[3];
      this.#allowedAssets = [...decoded[4]];
    }
  }

  get pool(): Address {
    if (!this.#pool) throw new MissingSerializedParamsError("pool");
    return this.#pool;
  }

  get referralCode(): number {
    if (this.#referralCode === undefined)
      throw new MissingSerializedParamsError("referralCode");
    return this.#referralCode;
  }

  get allowedAssets(): Address[] {
    if (!this.#allowedAssets)
      throw new MissingSerializedParamsError("allowedAssets");
    return this.#allowedAssets;
  }

  public isAssetAllowed(asset: Address): boolean {
    return this.allowedAssets.some(
      a => a.toLowerCase() === asset.toLowerCase(),
    );
  }

  /**
   * aToken the pool mints for `asset`. A reserve's aToken never changes, so
   * the first read is reused.
   */
  public async aToken(asset: Address): Promise<Address> {
    let read = this.#aTokenReads.get(asset);
    if (!read) {
      read = this.client
        .readContract({
          address: this.pool,
          abi: this.protocolAbi,
          functionName: "getReserveAToken",
          args: [asset],
        })
        .then(aToken => {
          this.#aTokens.upsert(asset, aToken);
          return aToken;
        });
      this.#aTokenReads.upsert(asset, read);
    }
    return read;
  }

  /**
   * Facade call supplying every `asset` the credit account holds above
   * `leftoverAmount`.
   */
  public supplyDiffCall(asset: Address, leftoverAmount: bigint): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi,
        functionName: "supplyDiff",
        args: [asset, leftoverAmount],
      }),
    };
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      pool: this.#pool ? this.labelAddress(this.#pool) : undefined,
      referralCode: this.#referralCode,
      allowedAssets: this.#allowedAssets?.map(a => this.labelAddress(a)),
    };
  }

  /**
   * Calldata that does not decode is left for the replay to refuse.
   */
  public override async loadReplayState(calldata: Hex): Promise<void> {
    let decoded: DecodeFunctionDataReturnType<abi>;
    try {
      decoded = decodeFunctionData({ abi, data: calldata });
    } catch {
      return;
    }
    switch (decoded.functionName) {
      case "supply":
      case "supplyDiff":
      case "withdraw":
      case "withdrawDiff":
        await this.aToken(decoded.args[0]);
        break;
      default:
        break;
    }
  }

  /**
   * Supply and withdraw are legal outside a bracket: an aToken is minted and
   * burned one for one with the asset it stands for, so the outcome is fixed
   * by the calldata and needs no on-chain comparison.
   *
   * @throws when the aToken of the asset has not been read, see
   * {@link loadReplayState}
   */
  public override replayOutOfBracketCall(
    balances: AssetsMap,
    calldata: Hex,
  ): boolean {
    const resolved = this.#resolveSupplyOrWithdraw(calldata, balances);
    if (!resolved) {
      return false;
    }
    if (resolved.amountIn > 0n) {
      balances.dec(resolved.tokenIn, resolved.amountIn);
      balances.inc(resolved.tokenOut, resolved.amountIn);
    }
    return true;
  }

  #resolveSupplyOrWithdraw(
    calldata: Hex,
    balances: AssetsMap,
  ): SupplyOrWithdraw | undefined {
    const decoded = decodeFunctionData({ abi, data: calldata });
    switch (decoded.functionName) {
      case "supply": {
        const [asset, amount] = decoded.args;
        return {
          tokenIn: asset,
          tokenOut: this.#loadedAToken(asset),
          amountIn: amount,
        };
      }
      case "supplyDiff": {
        const [asset, leftoverAmount] = decoded.args;
        return {
          tokenIn: asset,
          tokenOut: this.#loadedAToken(asset),
          amountIn: above(balances.getOrZero(asset), leftoverAmount),
        };
      }
      case "withdraw": {
        const [asset, amount] = decoded.args;
        return {
          tokenIn: this.#loadedAToken(asset),
          tokenOut: asset,
          amountIn: amount,
        };
      }
      case "withdrawDiff": {
        const [asset, leftoverAmount] = decoded.args;
        const aToken = this.#loadedAToken(asset);
        return {
          tokenIn: aToken,
          tokenOut: asset,
          amountIn: above(balances.getOrZero(aToken), leftoverAmount),
        };
      }
      default:
        return undefined;
    }
  }

  #loadedAToken(asset: Address): Address {
    const aToken = this.#aTokens.get(asset);
    if (!aToken) {
      throw new Error(
        `aToken of ${asset} on ${this.contractType} adapter at ${this.address} is not loaded`,
      );
    }
    return aToken;
  }
}

const above = (balance: bigint, leftover: bigint): bigint =>
  balance > leftover ? balance - leftover : 0n;
