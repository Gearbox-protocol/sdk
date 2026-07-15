import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iDaiUsdsAdapterAbi } from "../abi/adapters/index.js";
import { iDaiUsdsAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iDaiUsdsAdapterAbi;
type abi = typeof abi;

const protocolAbi = iDaiUsdsAbi;
type protocolAbi = typeof protocolAbi;

export class DaiUsdsAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dai?: Address;
  #usds?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dai" },
          { type: "address", name: "usds" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dai = decoded[2];
      this.#usds = decoded[3];
    }
  }

  get dai(): Address {
    if (!this.#dai) throw new MissingSerializedParamsError("dai");
    return this.#dai;
  }

  get usds(): Address {
    if (!this.#usds) throw new MissingSerializedParamsError("usds");
    return this.#usds;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dai: this.#dai ? this.labelAddress(this.#dai) : undefined,
      usds: this.#usds ? this.labelAddress(this.#usds) : undefined,
    };
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L51-L68 */
  public override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const { functionName: fn } = parsed;
    if (fn === "daiToUsds") {
      return { operation: "VaultDeposit", ...swapFromTransfers(transfers) };
    }
    if (fn === "usdsToDai") {
      return { operation: "MakerRedeem", ...swapFromTransfers(transfers) };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "daiToUsdsDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.dai, leftoverAmount);
        break;
      }
      case "usdsToDaiDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.usds, leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
