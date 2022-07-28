import { convexTokens } from "../tokens/convex";
import { objectEntries } from "../utils/mappers";
import type { LPWithdrawPathFinder, Path } from "./path";

export class ConvexLPPathFinder implements LPWithdrawPathFinder {
  // eslint-disable-next-line class-methods-use-this
  async findWithdrawPaths(p: Path): Promise<Array<Path>> {
    const pids = objectEntries(convexTokens).reduce(
      (acc, [cvxToken, tokenData]) => {
        const currentBalance = p.popBalance(cvxToken);
        if (currentBalance.gt(1)) {
          pids.add(tokenData.pid);
        }
        return acc;
      },
      new Set<number>()
    );

    // const convexPathFinder = ConvexPathFinder__factory.connect(
    //     pathFindersByNetwork[p.networkType].CONVEX_PATH_FINDER,
    //     p.provider
    // );

    // const tokenBalances = await convexPathFinder.calcRewards(
    //     p.creditAccount.addr,
    //     Array.from(pids)
    // );

    // for (let balance of tokenBalances) {
    //     p.balances[balance.token] = p.balances[balance.token].add(
    //         balance.balance
    //     );
    // }

    return await p.withdrawTokens();
  }
}
