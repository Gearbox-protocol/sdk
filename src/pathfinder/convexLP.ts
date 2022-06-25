import {LPWithdrawPathFinder, Path} from "./path";
import {ConvexLPToken, convexTokens} from "../tokens/convex";

export class ConvexLPPathFinder implements LPWithdrawPathFinder {
    async findWithdrawPaths(p: Path): Promise<Array<Path>> {
        const pids = new Set<number>();

        for (let [cvxToken, tokenData] of Object.entries(convexTokens)) {
            const currentBalance = p.popBalance(cvxToken as ConvexLPToken);
            if (currentBalance.gt(1)) {
                pids.add(tokenData.pid);
            }
        }

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
