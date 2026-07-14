import type { Abi, Address, DecodeFunctionDataReturnType } from "viem";
import type { AssetsMap, ParsedCallV2 } from "../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { classifyCurveOperation } from "../transferHelpers.js";
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

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    const { functionName, args } = decoded as {
      functionName: string;
      args: readonly unknown[];
    };
    switch (functionName) {
      case "exchange_diff": {
        const [i, , leftoverAmount] = args as readonly [bigint, bigint, bigint];
        this.setLeftover(balances, this.curveCoin(i), leftoverAmount);
        break;
      }
      case "add_diff_liquidity_one_coin": {
        const [leftoverAmount, i] = args as readonly [bigint, bigint];
        this.setLeftover(balances, this.curveCoin(i), leftoverAmount);
        break;
      }
      case "remove_diff_liquidity_one_coin": {
        const [leftoverAmount] = args as readonly [bigint];
        this.setLeftover(balances, this.lpToken, leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
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
