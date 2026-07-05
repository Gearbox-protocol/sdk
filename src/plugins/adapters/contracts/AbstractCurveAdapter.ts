import type { Abi, Address, DecodeFunctionDataReturnType } from "viem";
import type { AddressMap, ParsedCallV2 } from "../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { classifyCurveOperation } from "../transferHelpers.js";
import type { DiffLeftover } from "../types.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export abstract class AbstractCurveAdapterContract<
  const abi extends Abi | readonly unknown[],
  const protocolAbi extends Abi | readonly unknown[],
> extends AbstractAdapterContract<abi, protocolAbi> {
  abstract get tokens(): readonly Address[];
  abstract get lpToken(): Address;

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L132-L164 */
  public override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return (
      classifyCurveOperation(parsed.functionName, transfers) ??
      super.classifyLegacyOperation(parsed, transfers)
    );
  }

  protected override decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    const { functionName, args } = decoded as {
      functionName: string;
      args: readonly unknown[];
    };
    switch (functionName) {
      case "exchange_diff": {
        const [i, , leftoverAmount] = args as readonly [bigint, bigint, bigint];
        return [{ tokenIn: this.curveCoin(i), leftoverAmount }];
      }
      case "add_diff_liquidity_one_coin": {
        const [leftoverAmount, i] = args as readonly [bigint, bigint];
        return [{ tokenIn: this.curveCoin(i), leftoverAmount }];
      }
      case "remove_diff_liquidity_one_coin": {
        const [leftoverAmount] = args as readonly [bigint];
        return [{ tokenIn: this.lpToken, leftoverAmount }];
      }
      default:
        return super.decodeDiffLeftovers(decoded, balances);
    }
  }

  /**
   * Resolves a Curve pool coin index to its token address.
   *
   * @throws When the index is out of range for the pool.
   */
  protected curveCoin(i: bigint | number): Address {
    const token = this.tokens[Number(i)];
    if (!token) {
      throw new Error(`curve coin index ${i} is out of range`);
    }
    return token;
  }
}
