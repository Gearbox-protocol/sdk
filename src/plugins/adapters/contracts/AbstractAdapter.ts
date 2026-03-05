import {
  type Abi,
  type Address,
  decodeFunctionData,
  type Hex,
  type PartialBy,
  zeroAddress,
} from "viem";
import type {
  ConstructOptions,
  ParsedCallV2,
  TypedVersionedAddress,
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
import { swapFromTransfers, toNetTransfers } from "../transferHelpers.js";
import type {
  AdapterContractType,
  AdapterOperation,
  TokenTransfer,
} from "../types.js";

export interface ConcreteAdapterContractOptions {
  baseParams: TypedVersionedAddress;
  // TODO: v300 legacy/deprecated: serializedParams always contain targetContract and creditManager
  targetContract?: Address;
  name?: string;
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
  #targetContract?: Address;
  public readonly protocolAbi: protocolAbi;

  constructor(
    options: ConstructOptions,
    args: AbstractAdapterContractOptions<abi, protocolAbi>,
  ) {
    const { baseParams, targetContract, protocolAbi, ...rest } = args;
    super(options, { ...rest, ...baseParams });
    this.#targetContract = targetContract;
    this.protocolAbi = protocolAbi;
  }

  get targetContract(): Address {
    if (this.#targetContract === undefined) {
      throw new MissingSerializedParamsError("targetContract");
    }
    return this.#targetContract;
  }

  public get adapterType(): AdapterContractType {
    return this.contractType as AdapterContractType;
  }

  /**
   * Builds an {@link AdapterOperation} from a parsed call and ordered transfer entries.
   *
   * Returns `PartialBy<AdapterOperation, "targetContract">` because the adapter
   * may not have `targetContract` (adapters created without SDK do not have serializedParams)
   *
   * @param protocolCalldata Raw calldata of the actual CALL to targetContract, extracted from trace
   * @param strict When true, throws if protocol ABI is missing or decode fails
   */
  public parseAdapterOperation(
    parsed: ParsedCallV2,
    transfers: TokenTransfer[],
    creditAccount: Address,
    protocolCalldata: Hex,
    strict?: boolean,
  ): PartialBy<AdapterOperation, "protocol"> {
    const netTransfers = toNetTransfers(transfers, creditAccount);
    const protocol = this.parseProtocolCall(protocolCalldata, strict);
    return {
      operation: "Execute",
      adapter: this.address,
      protocol: this.#targetContract,
      adapterType: this.adapterType,
      version: this.version,
      label: parsed.label,
      adapterFunctionName: parsed.functionName,
      adapterArgs: parsed.rawArgs,
      ...protocol,
      transfers,
      legacy: this.classifyLegacyOperation(parsed, netTransfers),
    };
  }

  /**
   * Decodes protocol-level function name and args from the raw calldata
   * sent to targetContract.
   */
  protected parseProtocolCall(calldata: Hex, strict?: boolean) {
    const selector = calldata.slice(0, 10) as Hex;

    if (this.protocolAbi.length === 0) {
      if (strict) {
        throw new Error(`Protocol ABI is missing for selector ${selector}`);
      }
      return {
        protocolFunctionName: `unknown function ${selector}`,
        protocolArgs: {},
      };
    }

    try {
      const decoded = decodeFunctionData({
        abi: this.protocolAbi,
        data: calldata,
      });
      const functionName = getFunctionSignature(this.protocolAbi, calldata);
      const protocolArgs = functionArgsToRecord(
        this.protocolAbi,
        decoded.functionName,
        decoded.args,
      );
      return { protocolFunctionName: functionName, protocolArgs };
    } catch (e) {
      if (strict) {
        throw new Error(
          `Failed to decode protocol calldata for selector ${selector}`,
          { cause: e },
        );
      }
      return {
        protocolFunctionName: `unknown function ${selector}`,
        protocolArgs: {},
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
   */
  protected classifyLegacyOperation(
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
