// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Holdings, 2023
pragma solidity ^0.8.17;

/// @dev c-Tokens and LUNA are added for unit test purposes
enum Tokens {
    NO_TOKEN,
    LUNA,
    _1INCH,
    AAVE,
    COMP,
    CRV,
    DAI,
    DPI,
    FEI,
    LINK,
    SNX,
    UNI,
    USDC,
    USDT,
    WBTC,
    WETH,
    YFI,
    STETH,
    wstETH,
    CVX,
    FRAX,
    FXS,
    LDO,
    LUSD,
    sUSD,
    GUSD,
    LQTY,
    OHM,
    MIM,
    SPELL,
    GMX,
    ARB,
    RDNT,
    BAL,
    SHIB,
    _3Crv,
    crvFRAX,
    steCRV,
    crvPlain3andSUSD,
    crvCRVETH,
    crvCVXETH,
    crvUSDTWBTCWETH,
    LDOETH,
    FRAX3CRV,
    LUSD3CRV,
    gusd3CRV,
    MIM_3LP3CRV,
    OHMFRAXBP,
    cvx3Crv,
    cvxcrvFRAX,
    cvxsteCRV,
    cvxFRAX3CRV,
    cvxLUSD3CRV,
    cvxcrvPlain3andSUSD,
    cvxgusd3CRV,
    cvxOHMFRAXBP,
    cvxMIM_3LP3CRV,
    cvxcrvCRVETH,
    cvxcrvCVXETH,
    cvxcrvUSDTWBTCWETH,
    cvxLDOETH,
    stkcvx3Crv,
    stkcvxcrvFRAX,
    stkcvxsteCRV,
    stkcvxFRAX3CRV,
    stkcvxLUSD3CRV,
    stkcvxcrvPlain3andSUSD,
    stkcvxgusd3CRV,
    stkcvxOHMFRAXBP,
    stkcvxMIM_3LP3CRV,
    stkcvxcrvCRVETH,
    stkcvxcrvCVXETH,
    stkcvxcrvUSDTWBTCWETH,
    stkcvxLDOETH,
    yvDAI,
    yvUSDC,
    yvWETH,
    yvWBTC,
    yvCurve_stETH,
    yvCurve_FRAX,
    _50OHM_50DAI,
    _50OHM_50WETH,
    OHM_wstETH,
    aDAI,
    aUSDC,
    aUSDT,
    aWETH,
    waDAI,
    waUSDC,
    waUSDT,
    waWETH,
    cDAI,
    cUSDC,
    cUSDT,
    cWETH,
    dDAI,
    dUSDC,
    dWBTC,
    dWETH,
    dwstETH,
    dFRAX,
    GEAR
}
