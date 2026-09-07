import type { Address } from "viem";
import type { Asset, PermitResult } from "../base/index.js";
import { MAX_UINT256 } from "../constants/math.js";
import type { ICreditFacadeContract } from "../market/credit/types.js";
import type { MultiCall } from "../types/transactions.js";

/**
 * The executable open-account body, shared by preparation and transaction
 * encoding. Classifying only the router leg misses facade calls appended by
 * `openCA` (notably withdrawals and quota changes). Keep their order here so a
 * preview cannot validate one multicall and send another.
 *
 * Price updates and access-control prerequisites are added by the sender:
 * neither changes the account balances or the facade's safe-price flag.
 */
export function assembleOpenAccountCalls(
  facade: ICreditFacadeContract,
  props: {
    debt: bigint;
    collateral: Asset[];
    permits: Record<string, PermitResult>;
    calls: MultiCall[];
    minQuota: Asset[];
    averageQuota: Asset[];
    withdrawToken?: Address;
    to: Address;
    callsAfter?: MultiCall[];
  },
): MultiCall[] {
  return [
    facade.prepareIncreaseDebt(props.debt),
    ...facade.prepareAddCollateral(props.collateral, props.permits),
    ...props.calls,
    ...(props.withdrawToken
      ? [
          facade.prepareWithdrawCollateral(
            props.withdrawToken,
            MAX_UINT256,
            props.to,
          ),
        ]
      : []),
    ...facade.prepareUpdateQuotas(props),
    ...(props.callsAfter ?? []),
  ];
}
