Rename collateralTokens -> allowedDepositTokens (both strategy and pool opportunities)
Strategy collateral tokens:
1) Underlying
2) Collateral
3) The rest - no phantoms

Pool strategy opportunity:
- unwrapped underlying
- zappers

------------------------

quotaAllocation: becomes offchain-only


-------------------------

Rename: totalBorrowed -> totalBorrowedWithInterest

PoolOpportunity.totalSupply = expectedLiquidity
PoolOpportunity.totalBorrowedWithInterest = expectedLiquidity - availableLiquidity

delete: PoolOpportunity.utilization

add:
function calcUtlization(poolOpportunity: PoolOpportunity): Bps {
    return  poolOpportunity.totalBorrowedWithInterest / poolOpportunity.totalSupply
}


-------------------------
v4.gearbox.finance ----> ветка v4
app.gearbox.finance ---> перевести на ветку v4
v5.gearbox.finance ---> на ветку main