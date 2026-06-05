import {
  type Abi,
  type Address,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
import type { CallTrace } from "../../../history/internal-types.js";
import { resolveProtocolCall } from "../../../history/trace-utils.js";
import type {
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
