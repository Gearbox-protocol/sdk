import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
import { ierc4626AdapterAbi } from "../../../../abi/ierc4626Adapter.js";
import type { ParsedCallV2 } from "../../../base/index.js";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iERC4626Abi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = ierc4626AdapterAbi;
type abi = typeof abi;

const protocolAbi = iERC4626Abi;
type protocolAbi = typeof protocolAbi;

/** Resolved conversion: `amountIn` of `tokenIn` into `tokenOut`. */
interface WrapUnwrap {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
}

export class ERC4626AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vault?: Address;
  #asset?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version <= 311) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "asset" },
          ],
          args.baseParams.serializedParams,
        );

        this.#asset = decoded[2];
        this.#vault = zeroAddress;
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "vault" },
            { type: "address", name: "asset" },
          ],
          args.baseParams.serializedParams,
        );

        this.#vault = decoded[2];
        this.#asset = decoded[3];
      }
    }
  }

  get vault(): Address {
    if (!this.#vault) throw new MissingSerializedParamsError("vault");
    return this.#vault;
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  /**
   * Vault share token: the serialized `vault` when set; for v<=311 the
   * serialized vault is zeroAddress and the adapter targets the vault
   * directly, so the target contract is the share token.
   */
  get share(): Address {
    return this.#vault && this.#vault !== zeroAddress
      ? this.#vault
      : this.targetContract;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      vault: this.#vault ? this.labelAddress(this.#vault) : undefined,
      asset: this.#asset ? this.labelAddress(this.#asset) : undefined,
    };
  }

  /**
   * Charts_server maps `redeem(uint256,address,address)` → MakerRedeem.
   * Diff variants (`redeemDiff`) should also map to MakerRedeem.
   * Everything else (deposit, depositDiff, withdraw) falls to base class fallback → Swap.
   *
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L32-L38
   */
  public override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const fn = fnSigToName(parsed.functionName);
    if (fn === "redeem" || fn === "redeemDiff") {
      return { operation: "MakerRedeem", ...swapFromTransfers(transfers) };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }

  /**
   * Out-of-bracket calls are legal only on the RWA wrap/unwrap adapter (the
   * share converts 1:1 with the vault asset, so no on-chain preview or
   * slippage bracket is needed); a regular vault-strategy ERC4626 adapter
   * keeps the base behavior and returns false.
   */
  public override replayOutOfBracketCall(
    balances: AssetsMap,
    calldata: Hex,
  ): boolean {
    const meta = this.sdk.tokensMeta.get(this.share);
    if (!meta || !this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return false;
    }
    const resolved = this.#resolveWrapUnwrap(calldata, balances);
    if (resolved && resolved.amountIn > 0n) {
      balances.dec(resolved.tokenIn, resolved.amountIn);
      balances.inc(resolved.tokenOut, resolved.amountIn);
    }
    return true;
  }

  #resolveWrapUnwrap(
    calldata: Hex,
    balances: AssetsMap,
  ): WrapUnwrap | undefined {
    const decoded = decodeFunctionData({ abi, data: calldata });
    const { asset, share } = this;
    switch (decoded.functionName) {
      case "deposit":
        return { tokenIn: asset, tokenOut: share, amountIn: decoded.args[0] };
      case "depositDiff": {
        const [leftoverAmount] = decoded.args;
        const running = balances.getOrZero(asset);
        return {
          tokenIn: asset,
          tokenOut: share,
          amountIn: running > leftoverAmount ? running - leftoverAmount : 0n,
        };
      }
      case "redeem":
        return { tokenIn: share, tokenOut: asset, amountIn: decoded.args[0] };
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        const running = balances.getOrZero(share);
        return {
          tokenIn: share,
          tokenOut: asset,
          amountIn: running > leftoverAmount ? running - leftoverAmount : 0n,
        };
      }
      default:
        return undefined;
    }
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "depositDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.asset, leftoverAmount);
        break;
      }
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.share, leftoverAmount);
        break;
      }
      // no-op:
      // the only in-bracket producer of plain `redeem` is the
      // withdrawal compressor, and sdk now encodes the spent
      // shares as a negative storeExpectedBalances delta. The router never
      // emits plain `redeem` — its workers use `redeemDiff` only. If the
      // router (or another assembler) ever starts emitting in-bracket plain
      // `redeem` without the negative delta, this case must decrease `share`
      // by `shares` again (see commented-out lines). Out-of-bracket RWA
      // wrap/unwrap `redeem` goes through replayOutOfBracketCall, not here.
      case "redeem": {
        // const [shares] = decoded.args;
        // this.spendExact(balances, this.share, shares);
        break;
      }
      // `withdraw`/`deposit`/`mint` stay unsupported: they are not emitted
      // by the router (which uses diff variants) or the withdrawal compressor
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
