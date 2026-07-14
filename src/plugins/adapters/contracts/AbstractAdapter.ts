import {
  type Abi,
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
import {
  type CallTrace,
  resolveProtocolCall,
} from "../../../common-utils/utils/trace.js";
import type {
  AddressMap,
  AssetsMap,
  ConstructOptions,
  ParsedCallV2,
  RelaxedBaseParams,
} from "../../../sdk/index.js";
import {
  BaseContract,
  functionArgsToRecord,
  getFunctionSignature,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type {
  AdapterContractStateHuman,
  AdapterContractType,
  AdapterProtocolOperation,
  DiffLeftover,
} from "../types.js";

export interface ConcreteAdapterContractOptions {
  baseParams: RelaxedBaseParams;
}

export interface AbstractAdapterContractOptions<
  abi extends Abi | readonly unknown[],
  protocolAbi extends Abi | readonly unknown[],
> extends ConcreteAdapterContractOptions {
  abi: abi;
  /**
   * The ABI of targetContract
   */
  protocolAbi: protocolAbi;
}

export class AbstractAdapterContract<
  const abi extends Abi | readonly unknown[],
  const protocolAbi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  readonly #targetContract?: Address;
  readonly #creditManager?: Address;

  public readonly protocolAbi: protocolAbi;

  constructor(
    options: ConstructOptions,
    args: AbstractAdapterContractOptions<abi, protocolAbi>,
  ) {
    const { baseParams, protocolAbi, ...rest } = args;
    super(options, { ...rest, ...baseParams });
    this.protocolAbi = protocolAbi;

    if (baseParams.serializedParams) {
      const [cm, tc] = decodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        baseParams.serializedParams,
      );
      this.#creditManager = cm;
      this.#targetContract = tc;
    }
  }

  public get targetContract(): Address {
    if (this.#targetContract === undefined) {
      throw new MissingSerializedParamsError("targetContract");
    }
    return this.#targetContract;
  }

  public get creditManager(): Address {
    if (this.#creditManager === undefined) {
      throw new MissingSerializedParamsError("creditManager");
    }
    return this.#creditManager;
  }

  public get adapterType(): AdapterContractType {
    return this.contractType as AdapterContractType;
  }

  public override stateHuman(raw?: boolean): AdapterContractStateHuman {
    return {
      ...super.stateHuman(raw),
      creditManager: this.#creditManager
        ? this.labelAddress(this.#creditManager)
        : undefined,
      targetContract: this.#targetContract
        ? this.labelAddress(this.#targetContract)
        : undefined,
    };
  }

  /**
   * Decodes the protocol-level call (target contract + function name + args)
   * performed by this adapter, recovered from its adapter-level call trace.
   *
   * Both the `targetContract` and the protocol calldata are taken from the
   * execution trace.
   *
   * Returns `undefined` (in non-strict mode) when no external protocol call can
   * be recovered, in strict mode throws instead.
   *
   * @param trace Adapter-level call trace (a direct child of the facade trace)
   * @param strict When true, throws instead of returning `undefined`
   */
  public parseProtocolCall(
    trace: CallTrace,
    strict?: boolean,
  ): AdapterProtocolOperation | undefined {
    const resolved = resolveProtocolCall(trace);
    if (!resolved) {
      if (strict) {
        throw new Error("no external protocol call found in adapter trace");
      }
      return undefined;
    }
    const { contract, calldata } = resolved;
    const selector = calldata.slice(0, 10) as Hex;

    if (this.protocolAbi.length === 0) {
      if (strict) {
        throw new Error(`Protocol ABI is missing for selector ${selector}`);
      }
      return undefined;
    }

    try {
      const decoded = decodeFunctionData({
        abi: this.protocolAbi,
        data: calldata,
      });
      const functionName = getFunctionSignature(this.protocolAbi, calldata);
      const functionArgs = functionArgsToRecord(
        this.protocolAbi,
        decoded.functionName,
        decoded.args,
      );
      return { contract, functionName, functionArgs };
    } catch (e) {
      if (strict) {
        throw new Error(
          `Failed to decode protocol calldata for selector ${selector}`,
          { cause: e },
        );
      }
      return undefined;
    }
  }

  /**
   * Applies the balance changes implied by a router-generated diff-style
   * adapter call to a map of credit-account token balances.
   *
   * @param balances - Token balances before the call. Mutated in place.
   * @param calldata - Raw ABI-encoded adapter calldata.
   * @throws When the calldata cannot be decoded or the adapter (or the
   * specific function) has no balance-changes support.
   */
  public previewBalanceChanges(balances: AssetsMap, calldata: Hex): void {
    let decoded: DecodeFunctionDataReturnType<abi>;
    try {
      decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    } catch (e) {
      throw new Error(
        `previewBalanceChanges: cannot decode selector ${calldata.slice(0, 10)} on ${this.contractType} adapter at ${this.address}`,
        { cause: e },
      );
    }
    const leftovers = this.decodeDiffLeftovers(decoded, balances);
    for (const { tokenIn, leftoverAmount } of leftovers) {
      balances.upsert(tokenIn, leftoverAmount);
    }
  }

  /**
   * Resolves which tokens the diff-style call spends down to which leftovers.
   *
   * @param decoded - The viem-decoded adapter call
   * @param _balances - Token balances before the call
   * @throws When the adapter (or the specific function) has no balance-changes support
   */
  protected decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    _balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    throw new Error(
      `previewBalanceChanges is not supported for ${decoded.functionName} on ${this.contractType} adapter at ${this.address}`,
    );
  }

  /**
   * Leftover for an exact-input call: spends exactly `amount` of `tokenIn`
   * from the running balance, clamping at zero. Used for non-diff adapter
   * calls (e.g. those generated by the withdrawal compressor) whose spent
   * amount is present in calldata.
   */
  protected spendExact(
    tokenIn: Address,
    amount: bigint,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    const balance = balances.get(tokenIn) ?? 0n;
    return [
      { tokenIn, leftoverAmount: balance > amount ? balance - amount : 0n },
    ];
  }

  /**
   * Classifies an adapter call into a {@link LegacyAdapterOperation} using the
   * parsed call and credit-account transfer deltas.
   *
   * Default: replicates charts_server fallback —
   * - no positive transfers (swap.to is zero) → {@link MakerDeposit}
   * - otherwise → generic {@link Swap}
   *
   * Override in protocol-specific subclasses for richer classification.
   *
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L238-L264
   *
   * @deprecated Eventually will be gone, exists to produce output that legacy UI can display
   */
  public classifyLegacyOperation(
    _parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const swap = swapFromTransfers(transfers);
    if (swap.to === zeroAddress) {
      return {
        operation: "MakerDeposit",
        token: swap.from,
        amount: swap.fromAmount,
      };
    }
    return { operation: "Swap", ...swap };
  }
}
