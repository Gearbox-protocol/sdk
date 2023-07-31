// SPDX-License-Identifier: UNLICENSED
// Gearbox. Generalized leverage protocol that allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
// (c) Gearbox Foundation, 2023
pragma solidity ^0.8.17;

import {Tokens, TokenType} from "./Tokens.sol";

interface IERC20Check {
    function totalSupply() external view returns (uint256);
}

struct TokenData {
    Tokens id;
    address addr;
    string symbol;
    TokenType tokenType;
}

contract TokensDataLive {
    uint16 public immutable networkId;
    mapping(uint16 => TokenData[]) tokenDataByNetwork;
    mapping(uint16 => address) usdcByNetwork;

    uint16[] public connectedNetworks;

    constructor() {
        // ---------------- Networks ---------------------
        connectedNetworks.push(1);
        connectedNetworks.push(42161);

        // ---------------- TokensData ---------------------
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens._1INCH,
                addr: 0x111111111117dC0aa78b770fA6A738034120C302,
                symbol: "1INCH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.AAVE,
                addr: 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9,
                symbol: "AAVE",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.COMP,
                addr: 0xc00e94Cb662C3520282E6f5717214004A7f26888,
                symbol: "COMP",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.CRV,
                addr: 0xD533a949740bb3306d119CC777fa900bA034cd52,
                symbol: "CRV",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.DAI,
                addr: 0x6B175474E89094C44Da98b954EedeAC495271d0F,
                symbol: "DAI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.DPI,
                addr: 0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b,
                symbol: "DPI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.FEI,
                addr: 0x956F47F50A910163D8BF957Cf5846D573E7f87CA,
                symbol: "FEI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LINK,
                addr: 0x514910771AF9Ca656af840dff83E8264EcF986CA,
                symbol: "LINK",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.SNX,
                addr: 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F,
                symbol: "SNX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.UNI,
                addr: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984,
                symbol: "UNI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        usdcByNetwork[1] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.USDC,
                addr: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
                symbol: "USDC",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.USDT,
                addr: 0xdAC17F958D2ee523a2206206994597C13D831ec7,
                symbol: "USDT",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.WBTC,
                addr: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599,
                symbol: "WBTC",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.WETH,
                addr: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,
                symbol: "WETH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.YFI,
                addr: 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e,
                symbol: "YFI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.STETH,
                addr: 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84,
                symbol: "STETH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.wstETH,
                addr: 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0,
                symbol: "wstETH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.CVX,
                addr: 0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B,
                symbol: "CVX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.FRAX,
                addr: 0x853d955aCEf822Db058eb8505911ED77F175b99e,
                symbol: "FRAX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.FXS,
                addr: 0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0,
                symbol: "FXS",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LDO,
                addr: 0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32,
                symbol: "LDO",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LUSD,
                addr: 0x5f98805A4E8be255a32880FDeC7F6728C6568bA0,
                symbol: "LUSD",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.sUSD,
                addr: 0x57Ab1ec28D129707052df4dF418D58a2D46d5f51,
                symbol: "sUSD",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.GUSD,
                addr: 0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd,
                symbol: "GUSD",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LQTY,
                addr: 0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D,
                symbol: "LQTY",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.OHM,
                addr: 0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5,
                symbol: "OHM",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.MIM,
                addr: 0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3,
                symbol: "MIM",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.SPELL,
                addr: 0x090185f2135308BaD17527004364eBcC2D37e5F6,
                symbol: "SPELL",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.ARB,
                addr: 0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1,
                symbol: "ARB",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.BAL,
                addr: 0xba100000625a3754423978a60c9317c58a424e3D,
                symbol: "BAL",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.SHIB,
                addr: 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE,
                symbol: "SHIB",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens._3Crv,
                addr: 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490,
                symbol: "3Crv",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.crvFRAX,
                addr: 0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC,
                symbol: "crvFRAX",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.steCRV,
                addr: 0x06325440D014e39736583c165C2963BA99fAf14E,
                symbol: "steCRV",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.crvPlain3andSUSD,
                addr: 0xC25a3A3b969415c80451098fa907EC722572917F,
                symbol: "crvPlain3andSUSD",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.crvCRVETH,
                addr: 0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d,
                symbol: "crvCRVETH",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.crvCVXETH,
                addr: 0x3A283D9c08E8b55966afb64C515f5143cf907611,
                symbol: "crvCVXETH",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.crvUSDTWBTCWETH,
                addr: 0xf5f5B97624542D72A9E06f04804Bf81baA15e2B4,
                symbol: "crvUSDTWBTCWETH",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LDOETH,
                addr: 0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7,
                symbol: "LDOETH",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.FRAX3CRV,
                addr: 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B,
                symbol: "FRAX3CRV",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.LUSD3CRV,
                addr: 0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA,
                symbol: "LUSD3CRV",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.gusd3CRV,
                addr: 0xD2967f45c4f384DEEa880F807Be904762a3DeA07,
                symbol: "gusd3CRV",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.MIM_3LP3CRV,
                addr: 0x5a6A4D54456819380173272A5E8E9B9904BdF41B,
                symbol: "MIM_3LP3CRV",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.OHMFRAXBP,
                addr: 0x5271045F7B73c17825A7A7aee6917eE46b0B7520,
                symbol: "OHMFRAXBP",
                tokenType: TokenType.CURVE_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvx3Crv,
                addr: 0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C,
                symbol: "cvx3Crv",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxcrvFRAX,
                addr: 0x117A0bab81F25e60900787d98061cCFae023560c,
                symbol: "cvxcrvFRAX",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxsteCRV,
                addr: 0x9518c9063eB0262D791f38d8d6Eb0aca33c63ed0,
                symbol: "cvxsteCRV",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxFRAX3CRV,
                addr: 0xbE0F6478E0E4894CFb14f32855603A083A57c7dA,
                symbol: "cvxFRAX3CRV",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxLUSD3CRV,
                addr: 0xFB9B2f06FDb404Fd3E2278E9A9edc8f252F273d0,
                symbol: "cvxLUSD3CRV",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxcrvPlain3andSUSD,
                addr: 0x11D200ef1409cecA8D6d23e6496550f707772F11,
                symbol: "cvxcrvPlain3andSUSD",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxgusd3CRV,
                addr: 0x15c2471ef46Fa721990730cfa526BcFb45574576,
                symbol: "cvxgusd3CRV",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxOHMFRAXBP,
                addr: 0xd8F1B275c320819c7D752ef79988d0780bf00446,
                symbol: "cvxOHMFRAXBP",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxMIM_3LP3CRV,
                addr: 0xabB54222c2b77158CC975a2b715a3d703c256F05,
                symbol: "cvxMIM_3LP3CRV",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxcrvCRVETH,
                addr: 0x0Fb8dcdD95e4C48D3dD0eFA4086512f6F8FD4565,
                symbol: "cvxcrvCRVETH",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxcrvCVXETH,
                addr: 0x0bC857f97c0554d1d0D602b56F2EEcE682016fBA,
                symbol: "cvxcrvCVXETH",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxcrvUSDTWBTCWETH,
                addr: 0xB77BA8B4b9d981269466eE95796A9Af57d4E82DB,
                symbol: "cvxcrvUSDTWBTCWETH",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.cvxLDOETH,
                addr: 0x4eBE557ae39F87D2a014719777FD4cF4d01Dc8Ee,
                symbol: "cvxLDOETH",
                tokenType: TokenType.CONVEX_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvx3Crv,
                addr: 0xbAc7a431146aeAf3F57A16b9954f332Fd292F270,
                symbol: "stkcvx3Crv",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxcrvFRAX,
                addr: 0x276187f24D41745513cbE2Bd5dFC33a4d8CDc9ed,
                symbol: "stkcvxcrvFRAX",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxsteCRV,
                addr: 0xe15B7D80a51e1fe54aC355CaBE848Efce5289BDB,
                symbol: "stkcvxsteCRV",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxFRAX3CRV,
                addr: 0xaF314b088B53835d5cF4e4CB81beABa5934a61fe,
                symbol: "stkcvxFRAX3CRV",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxLUSD3CRV,
                addr: 0x0A1D4A25d0390899b90bCD22E1Ef155003EA76d7,
                symbol: "stkcvxLUSD3CRV",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxcrvPlain3andSUSD,
                addr: 0x7e1992A7F28dAA5f6a2d34e2cd40f962f37B172C,
                symbol: "stkcvxcrvPlain3andSUSD",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxgusd3CRV,
                addr: 0x34fB99abBAFb4e87e256960D572664c6ADc301B8,
                symbol: "stkcvxgusd3CRV",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxOHMFRAXBP,
                addr: 0x888407AabAfa936B90acF65C4Db19370A01d9bd8,
                symbol: "stkcvxOHMFRAXBP",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxMIM_3LP3CRV,
                addr: 0x1aAbe1B22a290cCB39FD77440D5eb96Cf40079f4,
                symbol: "stkcvxMIM_3LP3CRV",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxcrvCRVETH,
                addr: 0xfC4b109D46e12170DF31AF8ba39403fAC2b8c0cf,
                symbol: "stkcvxcrvCRVETH",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxcrvCVXETH,
                addr: 0x948bEd0211076b05d22e98929217d0f04D068C5c,
                symbol: "stkcvxcrvCVXETH",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxcrvUSDTWBTCWETH,
                addr: 0xEE3EE8373384BBfea3227E527C1B9b4e7821273E,
                symbol: "stkcvxcrvUSDTWBTCWETH",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.stkcvxLDOETH,
                addr: 0x2Fd6bD5b81c1060039D619E76e4e1f924B173006,
                symbol: "stkcvxLDOETH",
                tokenType: TokenType.CONVEX_STAKED_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvDAI,
                addr: 0xdA816459F1AB5631232FE5e97a05BBBb94970c95,
                symbol: "yvDAI",
                tokenType: TokenType.YEARN_ON_NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvUSDC,
                addr: 0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE,
                symbol: "yvUSDC",
                tokenType: TokenType.YEARN_ON_NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvWETH,
                addr: 0xa258C4606Ca8206D8aA700cE2143D7db854D168c,
                symbol: "yvWETH",
                tokenType: TokenType.YEARN_ON_NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvWBTC,
                addr: 0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E,
                symbol: "yvWBTC",
                tokenType: TokenType.YEARN_ON_NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvCurve_stETH,
                addr: 0xdCD90C7f6324cfa40d7169ef80b12031770B4325,
                symbol: "yvCurve_stETH",
                tokenType: TokenType.YEARN_ON_CURVE_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.yvCurve_FRAX,
                addr: 0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139,
                symbol: "yvCurve_FRAX",
                tokenType: TokenType.YEARN_ON_CURVE_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens._50OHM_50DAI,
                addr: 0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9,
                symbol: "50OHM_50DAI",
                tokenType: TokenType.BALANCER_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens._50OHM_50WETH,
                addr: 0xD1eC5e215E8148D76F4460e4097FD3d5ae0A3558,
                symbol: "50OHM_50WETH",
                tokenType: TokenType.BALANCER_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.OHM_wstETH,
                addr: 0xd4f79CA0Ac83192693bce4699d0c10C66Aa6Cf0F,
                symbol: "OHM_wstETH",
                tokenType: TokenType.BALANCER_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.aDAI,
                addr: 0x028171bCA77440897B824Ca71D1c56caC55b68A3,
                symbol: "aDAI",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.aUSDC,
                addr: 0xBcca60bB61934080951369a648Fb03DF4F96263C,
                symbol: "aUSDC",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.aUSDT,
                addr: 0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811,
                symbol: "aUSDT",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.aWETH,
                addr: 0x030bA81f1c18d280636F32af80b9AAd02Cf0854e,
                symbol: "aWETH",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );

        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dDAI,
                addr: 0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA,
                symbol: "dDAI",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dUSDC,
                addr: 0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3,
                symbol: "dUSDC",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dWBTC,
                addr: 0xe753260F1955e8678DCeA8887759e07aa57E8c54,
                symbol: "dWBTC",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dWETH,
                addr: 0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278,
                symbol: "dWETH",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dwstETH,
                addr: 0x2158034dB06f06dcB9A786D2F1F8c38781bA779d,
                symbol: "dwstETH",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.dFRAX,
                addr: 0x8A1112AFef7F4FC7c066a77AABBc01b3Fff31D47,
                symbol: "dFRAX",
                tokenType: TokenType.DIESEL_LP_TOKEN
            })
        );
        tokenDataByNetwork[1].push(
            TokenData({
                id: Tokens.GEAR,
                addr: 0xBa3335588D9403515223F109EdC4eB7269a9Ab5D,
                symbol: "GEAR",
                tokenType: TokenType.GEAR_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.AAVE,
                addr: 0xba5DdD1f9d7F570dc94a51479a000E3BCE967196,
                symbol: "AAVE",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.COMP,
                addr: 0x354A6dA3fcde098F8389cad84b0182725c6C91dE,
                symbol: "COMP",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.CRV,
                addr: 0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978,
                symbol: "CRV",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.DAI,
                addr: 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1,
                symbol: "DAI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.LINK,
                addr: 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4,
                symbol: "LINK",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.SNX,
                addr: 0xcBA56Cd8216FCBBF3fA6DF6137F3147cBcA37D60,
                symbol: "SNX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.UNI,
                addr: 0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0,
                symbol: "UNI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        usdcByNetwork[42161] = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.USDC,
                addr: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831,
                symbol: "USDC",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.USDT,
                addr: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9,
                symbol: "USDT",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.WBTC,
                addr: 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f,
                symbol: "WBTC",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.WETH,
                addr: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1,
                symbol: "WETH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.YFI,
                addr: 0x82e3A8F066a6989666b031d916c43672085b1582,
                symbol: "YFI",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.wstETH,
                addr: 0x5979D7b546E38E414F7E9822514be443A4800529,
                symbol: "wstETH",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.CVX,
                addr: 0xb952A807345991BD529FDded05009F5e80Fe8F45,
                symbol: "CVX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.FRAX,
                addr: 0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F,
                symbol: "FRAX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.FXS,
                addr: 0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7,
                symbol: "FXS",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.LDO,
                addr: 0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60,
                symbol: "LDO",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.LUSD,
                addr: 0x93b346b6BC2548dA6A1E7d98E9a421B42541425b,
                symbol: "LUSD",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.sUSD,
                addr: 0xA970AF1a584579B618be4d69aD6F73459D112F95,
                symbol: "sUSD",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.LQTY,
                addr: 0xfb9E5D956D889D91a82737B9bFCDaC1DCE3e1449,
                symbol: "LQTY",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.OHM,
                addr: 0x6E6a3D8F1AfFAc703B1aEF1F43B8D2321bE40043,
                symbol: "OHM",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.MIM,
                addr: 0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A,
                symbol: "MIM",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.SPELL,
                addr: 0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF,
                symbol: "SPELL",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.GMX,
                addr: 0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a,
                symbol: "GMX",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.ARB,
                addr: 0x912CE59144191C1204E64559FE8253a0e49E6548,
                symbol: "ARB",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.RDNT,
                addr: 0x3082CC23568eA640225c2467653dB90e9250AaA0,
                symbol: "RDNT",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.BAL,
                addr: 0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8,
                symbol: "BAL",
                tokenType: TokenType.NORMAL_TOKEN
            })
        );

        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens._50OHM_50WETH,
                addr: 0x89dc7e71e362faF88D92288fE2311D25c6a1B5E0,
                symbol: "50OHM_50WETH",
                tokenType: TokenType.BALANCER_LP_TOKEN
            })
        );

        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.aDAI,
                addr: 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE,
                symbol: "aDAI",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.aUSDC,
                addr: 0x724dc807b04555b71ed48a6896b6F41593b8C637,
                symbol: "aUSDC",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.aUSDT,
                addr: 0x6ab707Aca953eDAeFBc4fD23bA73294241490620,
                symbol: "aUSDT",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );
        tokenDataByNetwork[42161].push(
            TokenData({
                id: Tokens.aWETH,
                addr: 0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8,
                symbol: "aWETH",
                tokenType: TokenType.AAVE_V2_A_TOKEN
            })
        );

        networkId = getNetworkId();
    }

    function getTokenData() external view returns (TokenData[] memory) {
        return tokenDataByNetwork[networkId];
    }

    function getNetworkId() internal view returns (uint16) {
        if (block.chainid == 1337 || block.chainid == 31337) {
            uint256 len = connectedNetworks.length;
            for (uint256 i = 0; i < len; i++) {
                if (checkNetworkId(connectedNetworks[i])) {
                    return connectedNetworks[i];
                }
            }

            revert("No network found");
        } else {
            return uint16(block.chainid);
        }
    }

    function checkNetworkId(uint16 _networkId) internal view returns (bool) {
        address tokenToCheck = usdcByNetwork[_networkId];

        if (!isContract(tokenToCheck)) {
            return false;
        }

        try IERC20Check(tokenToCheck).totalSupply() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    // This method relies on extcodesize/address.code.length, which returns 0
    // for contracts in construction, since the code is only stored at the end
    // of the constructor execution.
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }
}
