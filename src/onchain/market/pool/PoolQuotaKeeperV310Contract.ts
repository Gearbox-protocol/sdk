import type { Address, ContractEventName, Log } from "viem";

import { iPoolQuotaKeeperV310Abi } from "../../../abi/310/generated.js";
import type { Bps } from "../../../model/index.js";
import type {
  ConstructOptions,
  IBaseContract,
  PoolState,
  QuotaKeeperState,
  QuotaState,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { PoolQuotaKeeperStateHuman } from "../../types/index.js";
import { AddressMap, formatBNvalue, percentFmt } from "../../utils/index.js";

const abi = iPoolQuotaKeeperV310Abi;
type abi = typeof abi;

export class PoolQuotaKeeperV310Contract
  extends BaseContract<abi>
  implements IBaseContract
{
  public readonly decimals: number;
  public readonly quotas: AddressMap<QuotaState>;

  constructor(
    options: ConstructOptions,
    pool: PoolState,
    pqk: QuotaKeeperState,
  ) {
    super(options, {
      ...pqk.baseParams,
      name: `PoolQuotaKeeper(${pool.name})`,
      abi,
    });

    this.decimals = pool.decimals;

    this.quotas = new AddressMap(
      pqk.quotas.map(q => {
        return [q.token, q];
      }),
      "quotas",
    );
  }

  /**
   * Whether the market still accepts quota for a token: a token whose quota is
   * inactive or whose limit is exhausted can no longer back a new position.
   *
   * @param token - Token address.
   */
  public hasActiveQuota(token: Address): boolean {
    const quota = this.quotas.get(token);
    return !!quota?.isActive && quota.limit > 0n;
  }

  /**
   * Every token the market still accepts quota for, see
   * {@link hasActiveQuota}.
   */
  public get activeQuotaTokens(): Address[] {
    return this.quotas.keys().filter(token => this.hasActiveQuota(token));
  }

  /**
   * How much more quota the market will take for a token, in the underlying.
   * `0n` when the market has no quota entry; not the same as {@link hasActiveQuota}.
   */
  public quotaAvailable(token: Address): bigint {
    const quota = this.quotas.get(token);
    return quota ? quota.limit - quota.totalQuoted : 0n;
  }

  /**
   * Annual quota rate paid on a quoted token, in basis points, or `0` when the
   * market does not quote it.
   *
   * @param token - Quoted token address.
   */
  public quotaRate(token: Address): Bps {
    return this.quotas.get(token)?.rate ?? 0;
  }

  public override stateHuman(raw = true): PoolQuotaKeeperStateHuman {
    return {
      ...super.stateHuman(raw),
      quotas: this.quotas.entries().reduce(
        (acc, [address, params]) => ({
          ...acc,
          [this.labelAddress(address)]: {
            rate: percentFmt(params.rate, raw),
            quotaIncreaseFee: percentFmt(params.quotaIncreaseFee, raw),
            totalQuoted: formatBNvalue(
              params.totalQuoted,
              this.decimals,
              2,
              raw,
            ),
            limit: formatBNvalue(params.limit, this.decimals, 2, raw),
            isActive: params.isActive,
          },
        }),
        {},
      ),
    };
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "AddCreditManager":
      case "AddQuotaToken":
      case "SetGauge":
      case "SetQuotaIncreaseFee":
      case "SetTokenLimit":
      case "UpdateQuota":
      case "UpdateTokenQuotaRate":
        this.dirty = true;
        break;
    }
  }
}
