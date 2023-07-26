// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Holdings, 2023
pragma solidity ^0.8.17;

import {Tokens} from "./Tokens.sol";
import {Contracts} from "./SupportedContracts.sol";

import {TokensLib} from "./TokensLib.sol";

struct ChainlinkPriceFeedData {
    Tokens token;
    address priceFeed;
}

struct CurvePriceFeedData {
    Tokens lpToken;
    Tokens[] assets;
    Contracts pool;
}

struct CurveLikePriceFeedData {
    Tokens lpToken;
    Tokens curveToken;
}

struct SingeTokenPriceFeedData {
    Tokens token;
}

struct CompositePriceFeedData {
    Tokens token;
    address targetToBaseFeed;
    address baseToUSDFeed;
}

struct BoundedPriceFeedData {
    Tokens token;
    address priceFeed;
    uint256 upperBound;
}

contract PriceFeedDataLive {
    uint16 networkId;

    mapping(uint16 => ChainlinkPriceFeedData[]) chainlinkPriceFeedsByNetwork;
    SingeTokenPriceFeedData[] zeroPriceFeeds;
    CurvePriceFeedData[] curvePriceFeeds;
    CurveLikePriceFeedData[] likeCurvePriceFeeds;
    SingeTokenPriceFeedData[] yearnPriceFeeds;
    mapping(uint16 => BoundedPriceFeedData[]) boundedPriceFeedsByNetwork;
    mapping(uint16 => CompositePriceFeedData[]) compositePriceFeedsByNetwork;
    SingeTokenPriceFeedData wstethPriceFeed;

    constructor(uint16 _networkId) {
        networkId = _networkId;
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens._1INCH, priceFeed: 0xc929ad75B72593967DE83E7F7Cda0493458261D9})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.AAVE, priceFeed: 0x547a514d5e3769680Ce22B2361c10Ea13619e8a9})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.COMP, priceFeed: 0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.CRV, priceFeed: 0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.DAI, priceFeed: 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.DPI, priceFeed: 0xD2A593BF7594aCE1faD597adb697b5645d5edDB2})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.FEI, priceFeed: 0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.GUSD, priceFeed: 0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.LINK, priceFeed: 0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.SNX, priceFeed: 0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.UNI, priceFeed: 0x553303d460EE0afB37EdFf9bE42922D8FF63220e})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.USDC, priceFeed: 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.USDT, priceFeed: 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.WETH, priceFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.YFI, priceFeed: 0xA027702dbb89fbd58938e4324ac03B58d812b0E1})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.CVX, priceFeed: 0xd962fC30A72A84cE50161031391756Bf2876Af5D})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.FRAX, priceFeed: 0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.sUSD, priceFeed: 0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.FXS, priceFeed: 0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.MIM, priceFeed: 0x7A364e8770418566e3eb2001A96116E6138Eb32F})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.SPELL, priceFeed: 0x8c110B94C5f1d347fAcF5E1E938AB2db60E3c9a8})
        );
        chainlinkPriceFeedsByNetwork[1].push(
            ChainlinkPriceFeedData({token: Tokens.BAL, priceFeed: 0xdF2917806E30300537aEB49A7663062F4d1F2b5F})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens._1INCH, priceFeed: 0x4bC735Ef24bf286983024CAd5D03f0738865Aaef})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.AAVE, priceFeed: 0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.COMP, priceFeed: 0xe7C53FFd03Eb6ceF7d208bC4C13446c76d1E5884})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.CRV, priceFeed: 0xaebDA2c976cfd1eE1977Eac079B4382acb849325})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.DAI, priceFeed: 0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.LINK, priceFeed: 0x86E53CF1B870786351Da77A57575e79CB55812CB})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.SNX, priceFeed: 0x054296f0D036b95531B4E14aFB578B80CFb41252})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.UNI, priceFeed: 0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.USDC, priceFeed: 0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.USDT, priceFeed: 0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.WETH, priceFeed: 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.YFI, priceFeed: 0x745Ab5b69E01E2BE1104Ca84937Bb71f96f5fB21})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.CVX, priceFeed: 0x851175a919f36c8e30197c09a9A49dA932c2CC00})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.FRAX, priceFeed: 0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.FXS, priceFeed: 0x36a121448D74Fa81450c992A1a44B9b7377CD3a5})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.SPELL, priceFeed: 0x383b3624478124697BEF675F07cA37570b73992f})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.GMX, priceFeed: 0xDB98056FecFff59D032aB628337A4887110df3dB})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.ARB, priceFeed: 0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.RDNT, priceFeed: 0x20d0Fcab0ECFD078B036b6CAf1FaC69A6453b352})
        );
        chainlinkPriceFeedsByNetwork[42161].push(
            ChainlinkPriceFeedData({token: Tokens.BAL, priceFeed: 0xBE5eA816870D11239c543F84b71439511D70B94f})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvx3Crv, curveToken: Tokens._3Crv}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxcrvFRAX, curveToken: Tokens.crvFRAX}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxsteCRV, curveToken: Tokens.steCRV}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxFRAX3CRV, curveToken: Tokens.FRAX3CRV}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxLUSD3CRV, curveToken: Tokens.LUSD3CRV}));
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.cvxcrvPlain3andSUSD, curveToken: Tokens.crvPlain3andSUSD})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxgusd3CRV, curveToken: Tokens.gusd3CRV}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxOHMFRAXBP, curveToken: Tokens.OHMFRAXBP}));
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.cvxMIM_3LP3CRV, curveToken: Tokens.MIM_3LP3CRV})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxcrvCRVETH, curveToken: Tokens.crvCRVETH}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxcrvCVXETH, curveToken: Tokens.crvCVXETH}));
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.cvxcrvUSDTWBTCWETH, curveToken: Tokens.crvUSDTWBTCWETH})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.cvxLDOETH, curveToken: Tokens.LDOETH}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvx3Crv, curveToken: Tokens._3Crv}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxcrvFRAX, curveToken: Tokens.crvFRAX}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxsteCRV, curveToken: Tokens.steCRV}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxFRAX3CRV, curveToken: Tokens.FRAX3CRV}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxLUSD3CRV, curveToken: Tokens.LUSD3CRV}));
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxcrvPlain3andSUSD, curveToken: Tokens.crvPlain3andSUSD})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxgusd3CRV, curveToken: Tokens.gusd3CRV}));
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxOHMFRAXBP, curveToken: Tokens.OHMFRAXBP})
        );
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxMIM_3LP3CRV, curveToken: Tokens.MIM_3LP3CRV})
        );
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxcrvCRVETH, curveToken: Tokens.crvCRVETH})
        );
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxcrvCVXETH, curveToken: Tokens.crvCVXETH})
        );
        likeCurvePriceFeeds.push(
            CurveLikePriceFeedData({lpToken: Tokens.stkcvxcrvUSDTWBTCWETH, curveToken: Tokens.crvUSDTWBTCWETH})
        );
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.stkcvxLDOETH, curveToken: Tokens.LDOETH}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.aDAI, curveToken: Tokens.DAI}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.aUSDC, curveToken: Tokens.USDC}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.aUSDT, curveToken: Tokens.USDT}));
        likeCurvePriceFeeds.push(CurveLikePriceFeedData({lpToken: Tokens.aWETH, curveToken: Tokens.WETH}));
        compositePriceFeedsByNetwork[1].push(
            CompositePriceFeedData({
                token: Tokens.WBTC,
                targetToBaseFeed: 0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23,
                baseToUSDFeed: 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
            })
        );
        compositePriceFeedsByNetwork[1].push(
            CompositePriceFeedData({
                token: Tokens.STETH,
                targetToBaseFeed: 0x86392dC19c0b719886221c78AB11eb8Cf5c52812,
                baseToUSDFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
            })
        );
        compositePriceFeedsByNetwork[1].push(
            CompositePriceFeedData({
                token: Tokens.LDO,
                targetToBaseFeed: 0x4e844125952D32AcdF339BE976c98E22F6F318dB,
                baseToUSDFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
            })
        );
        compositePriceFeedsByNetwork[1].push(
            CompositePriceFeedData({
                token: Tokens.OHM,
                targetToBaseFeed: 0x9a72298ae3886221820B1c878d12D872087D3a23,
                baseToUSDFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
            })
        );
        compositePriceFeedsByNetwork[42161].push(
            CompositePriceFeedData({
                token: Tokens.WBTC,
                targetToBaseFeed: 0x0017abAc5b6f291F9164e35B1234CA1D697f9CF4,
                baseToUSDFeed: 0x6ce185860a4963106506C203335A2910413708e9
            })
        );
        compositePriceFeedsByNetwork[42161].push(
            CompositePriceFeedData({
                token: Tokens.STETH,
                targetToBaseFeed: 0xded2c52b75B24732e9107377B7Ba93eC1fFa4BAf,
                baseToUSDFeed: 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612
            })
        );
        boundedPriceFeedsByNetwork[1].push(
            BoundedPriceFeedData({
                token: Tokens.LUSD,
                priceFeed: 0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0,
                upperBound: 110000000
            })
        );
        boundedPriceFeedsByNetwork[42161].push(
            BoundedPriceFeedData({
                token: Tokens.LUSD,
                priceFeed: 0x0411D28c94d85A36bC72Cb0f875dfA8371D8fFfF,
                upperBound: 110000000
            })
        );

        zeroPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.LQTY}));
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens._3Crv,
                assets: TokensLib.arrayOf(Tokens.DAI, Tokens.USDC, Tokens.USDT),
                pool: Contracts.CURVE_3CRV_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.crvFRAX,
                assets: TokensLib.arrayOf(Tokens.FRAX, Tokens.USDC),
                pool: Contracts.CURVE_FRAX_USDC_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.steCRV,
                assets: TokensLib.arrayOf(Tokens.STETH, Tokens.WETH),
                pool: Contracts.CURVE_STETH_GATEWAY
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.FRAX3CRV,
                assets: TokensLib.arrayOf(Tokens.FRAX, Tokens.DAI, Tokens.USDC, Tokens.USDT),
                pool: Contracts.CURVE_FRAX_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.LUSD3CRV,
                assets: TokensLib.arrayOf(Tokens.LUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT),
                pool: Contracts.CURVE_LUSD_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.crvPlain3andSUSD,
                assets: TokensLib.arrayOf(Tokens.DAI, Tokens.USDC, Tokens.USDT, Tokens.sUSD),
                pool: Contracts.CURVE_SUSD_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.gusd3CRV,
                assets: TokensLib.arrayOf(Tokens.GUSD, Tokens.DAI, Tokens.USDC, Tokens.USDT),
                pool: Contracts.CURVE_GUSD_POOL
            })
        );
        curvePriceFeeds.push(
            CurvePriceFeedData({
                lpToken: Tokens.MIM_3LP3CRV,
                assets: TokensLib.arrayOf(Tokens.MIM, Tokens.DAI, Tokens.USDC, Tokens.USDT),
                pool: Contracts.CURVE_MIM_POOL
            })
        );
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvDAI}));
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvUSDC}));
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvWETH}));
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvWBTC}));
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvCurve_stETH}));
        yearnPriceFeeds.push(SingeTokenPriceFeedData({token: Tokens.yvCurve_FRAX}));
        wstethPriceFeed = SingeTokenPriceFeedData({token: Tokens.wstETH});
    }

    function chainlinkPriceFeeds(uint256 index) external view returns (ChainlinkPriceFeedData memory) {
        return chainlinkPriceFeedsByNetwork[networkId][index];
    }
}
