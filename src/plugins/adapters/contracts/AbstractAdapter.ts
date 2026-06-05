import {
  type Abi,
  type Address,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
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
   * from the raw calldata the adapter sent to its target contract.
   *
   * `targetContract` is taken from the execution trace (the authoritative
   * CALL target) rather than `this.targetContract`, because adapters parsed
   * from on-chain state may not carry `serializedParams`. Consumers build the
   * full adapter `Execute` operation around this result (adding transfers /
   * legacy).
   *
   * @param calldata Raw calldata of the actual CALL to targetContract, extracted from trace
   * @param contract Address of the target (protocol) contract, from the trace
   * @param strict When true, throws if protocol ABI is missing or decode fails
   */
  public parseProtocolCall(
    calldata: Hex,
    contract: Address,
    strict?: boolean,
  ): AdapterProtocolOperation {
    const selector = calldata.slice(0, 10) as Hex;

    if (this.protocolAbi.length === 0) {
      if (strict) {
        throw new Error(`Protocol ABI is missing for selector ${selector}`);
      }
      return {
        contract,
        functionName: `unknown function ${selector}`,
        functionArgs: {},
      };
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
      return {
        contract,
        functionName: `unknown function ${selector}`,
        functionArgs: {},
      };
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
