import { iConvexV1BoosterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iBoosterAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iConvexV1BoosterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBoosterAbi;
type protocolAbi = typeof protocolAbi;

export class ConvexV1BoosterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: {
    pid: number;
    curveToken: Address;
    convexToken: Address;
    phantomToken: Address;
  }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          {
            type: "tuple[]",
            name: "supportedPools",
            components: [
              { type: "uint256", name: "pid" },
              { type: "address", name: "curveToken" },
              { type: "address", name: "convexToken" },
              { type: "address", name: "phantomToken" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPools = decoded[2].map(pool => ({
        pid: Number(pool.pid),
        curveToken: pool.curveToken,
        convexToken: pool.convexToken,
        phantomToken: pool.phantomToken,
      }));
    }
  }

  get supportedPools(): {
    pid: number;
    curveToken: Address;
    convexToken: Address;
    phantomToken: Address;
  }[] {
    if (!this.#supportedPools)
      throw new MissingSerializedParamsError("supportedPools");
    return this.#supportedPools;
  }

  /**
   * Charts_server only maps `withdrawAll(uint256)` → CurveWithdrawal.
   * `withdrawDiff` and other withdraw variants fall to the base class fallback → Swap.
   *
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L166-L199
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L84-L91
   */
  protected override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const fn = fnSigToName(parsed.functionName);
    const { rawArgs: args } = parsed;

    if (fn === "withdrawAll") {
      return { operation: "CurveWithdrawal", ...swapFromTransfers(transfers) };
    }
    const staked = args._stake ?? args.stake;
    const swap = swapFromTransfers(transfers);
    if (staked === true) {
      return {
        operation: "ConvexDepositAndStake",
        depositToken: swap.from,
        depositAmount: swap.fromAmount,
      };
    }
    if (fn === "depositAll" || fn === "deposit") {
      return { operation: "ConvexDeposit", ...swap };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }
}
