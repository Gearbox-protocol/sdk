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
import { iConvexV1BoosterAdapterAbi } from "../abi/adapters/iConvexV1BoosterAdapter.js";
import { iBoosterAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

interface ConvexV1BoosterPool {
  pid: number;
  curveToken: Address;
  convexToken: Address;
  phantomToken: Address;
}

const abi = iConvexV1BoosterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBoosterAbi;
type protocolAbi = typeof protocolAbi;

export class ConvexV1BoosterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: ConvexV1BoosterPool[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

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

  get supportedPools(): ConvexV1BoosterPool[] {
    if (!this.#supportedPools)
      throw new MissingSerializedParamsError("supportedPools");
    return this.#supportedPools;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      supportedPools: this.#supportedPools?.map(p => ({
        pid: p.pid,
        curveToken: this.labelAddress(p.curveToken),
        convexToken: this.labelAddress(p.convexToken),
        phantomToken: this.labelAddress(p.phantomToken),
      })),
    };
  }

  /**
   * Charts_server only maps `withdrawAll(uint256)` → CurveWithdrawal.
   * `withdrawDiff` and other withdraw variants fall to the base class fallback → Swap.
   *
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L166-L199
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L84-L91
   */
  public override classifyLegacyOperation(
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

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      // deposit spends the curve LP token, withdraw spends the convex token
      case "depositDiff": {
        const [pid, leftoverAmount] = decoded.args;
        const pool = this.#mustFindPool(Number(pid));
        this.setLeftover(balances, pool.curveToken, leftoverAmount);
        break;
      }
      case "withdrawDiff": {
        const [pid, leftoverAmount] = decoded.args;
        const pool = this.#mustFindPool(Number(pid));
        this.setLeftover(balances, pool.convexToken, leftoverAmount);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }

  #mustFindPool(pid: number): ConvexV1BoosterPool {
    const pool = this.supportedPools.find(p => p.pid === pid);
    if (!pool) {
      throw new Error(
        `convex pool with pid ${pid} not found on booster adapter at ${this.address}`,
      );
    }
    return pool;
  }
}
