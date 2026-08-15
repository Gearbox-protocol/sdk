import type { Position, PositionKind } from "../../model/index.js";
import { isFilterSet, matchesPositionFilter } from "../../model/index.js";
import { SDKConstruct } from "../base/index.js";
import type { ListPositionsProps } from "./types.js";

/**
 * The `positions` read model of one chain: everything a wallet holds in the
 * protocol — pool shares, open credit accounts, and delayed withdrawals it
 * took over by liquidating.
 **/
export class PositionsService extends SDKConstruct {
  /**
   * Every position of a wallet on this chain, optionally narrowed by
   * {@link PositionFilter} (see {@link matchesPositionFilter} for what each
   * condition selects). Reads live chain state, so rows reflect the moment of
   * the call rather than the SDK's loaded snapshot.
   **/
  public async list(props: ListPositionsProps): Promise<Position[]> {
    const { wallet, filter, blockNumber } = props;
    const chainIds = filter?.chainIds;
    if (isFilterSet(chainIds) && !chainIds.includes(this.chainId)) {
      return [];
    }

    const wantedKind = filter?.kind;
    const wanted = (kind: PositionKind): boolean =>
      !isFilterSet(wantedKind) || wantedKind === kind;

    const isZeroDebt = filter?.isZeroDebt;
    const [pool, strategy, liquidation] = await Promise.all([
      wanted("pool")
        ? this.sdk.pools.listPositions({ wallet, blockNumber })
        : Promise.resolve([]),
      wanted("strategy")
        ? this.sdk.accounts.listPositions({
            owner: wallet,
            // a filter that asks for accounts with debt narrows the account
            // query itself; anything else needs them all
            includeZeroDebt: !isFilterSet(isZeroDebt) || isZeroDebt,
            blockNumber,
          })
        : Promise.resolve([]),
      wanted("liquidation")
        ? this.sdk.liquidations.getLiquidationPositions({
            liquidator: wallet,
            blockNumber,
          })
        : Promise.resolve([]),
    ]);

    return [...pool, ...strategy, ...liquidation].filter(row =>
      matchesPositionFilter(row, filter),
    );
  }
}
