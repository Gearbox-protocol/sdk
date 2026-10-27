/**
 * kpk #127 "mGLOBAL": an mGLOBAL leverage strategy on the frxUSD market — new
 * assets and price feeds, a whitelisted credit suite, its collateral, and the
 * Curve, Fluid, Uniswap V4 and Midas adapters that route frxUSD to mGLOBAL.
 *
 * The catalog has an mGLOBAL bundle, but kpk executed its own variant (other
 * limits, fees and liquidation thresholds), so it is written out here. The
 * suite is named `suite:mglobal`: every later action targets it before its
 * address is known.
 **/

import { type Address, zeroAddress } from "viem";
import type { CreditManagerTarget } from "../../../permissionless/index.js";
import type { GipReproduction } from "../types.js";

const KPK_FRXUSD_POOL: Address = "0xbd8ec7444db271635584cc38f5d06c72eab762f5";
const SUITE: CreditManagerTarget = "suite:mglobal";

const FRXUSD: Address = "0xcacd6fd266af91b8aed52accc382b4e165586e29";
const MGLOBAL: Address = "0x7433806912eae67919e66aea853d46fa0aef98a8";
const USDC: Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT: Address = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const CRVUSD: Address = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
const CRVUSD_USDC: Address = "0x4dece678ceceb27446b35c672dc7d61f30bad69e";
const CRVUSD_USDT: Address = "0x390f3595bca2df7d23783dfd126427cceb997bf4";
const CRV_FRXUSD: Address = "0x13e12bb0e6a2f1a3d6901a59a9d585e89a6243e1";
const THREE_CRV: Address = "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490";
const DAI: Address = "0x6b175474e89094c44da98b954eedeac495271d0f";

/** The zero price feed: the asset is quoted but never valued. **/
const ZERO_PRICE_FEED: Address = "0xfe1ec406d777b0c4e2bf5e12d0f645721b2b86be";
const DEGEN_NFT: Address = "0x376EF9f15CEb3CF082a51dDFe0a7274f05B5aE04";
const UNISWAP_V4_GATEWAY: Address =
  "0x3b74c70283b291e875da84d58176a63dac5d1824";
const MIDAS_ISSUANCE_VAULT: Address =
  "0xCe29c36c6D4556f2d01d79414C1354B968dDDEf1";
const MIDAS_REDEMPTION_VAULT: Address =
  "0x1e0fd66753198c7b8bA64edEe8d41D8628Bf20D7";
const NO_HOOKS = zeroAddress;

/** A Curve pool adapter whose LP token is the pool itself. **/
const curvePool = (
  type: "CURVE_V1_2ASSETS" | "CURVE_STABLE_NG",
  pool: Address,
) => ({
  type: "CREDIT::allowAdapter" as const,
  params: {
    creditManager: SUITE,
    adapter: {
      type,
      version: 311 as const,
      target: pool,
      lpToken: pool,
      basePool: zeroAddress,
      use256: false,
    },
  },
});

/** USDC as the one token the Midas vaults take in and pay out. **/
const usdcOnly = [{ token: USDC, allowed: true }];

export const kpk127MglobalStrategy: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-127",
    name: "mGLOBAL",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0xf0cf1e3ec6264b03241826f5b2abda17b4352a75",
    eta: 1790187720,
    executedAtBlock: 26042378n,
    timelockTxHashes: [
      "0x59199d9ffbe680e693fa508ad6b8e5ed494c13654479d7ba9ecae856c0ba004e",
      "0x070fc760f7bae892af0b4aa7803e8f71c6628cd9bad7c760046b1d545fa15520",
      "0x0f8954e88ff4e62946cb45c7114e7872a435e32bf1fa300c797a1a2f290e2c47",
      "0xdb9d5526b9e3a92b9fe59efc2b45ea4faa703d1cf533b005fd382aa8819cdf45",
      "0xe4f5db1b3305ee0d89a53c4437f6f928102a040105c2bb67ce8a773314734eff",
      "0x7f376b942a1cc655dc72b02cdc01fdd7da3f1204262833b33ae554da5b6d7a60",
      "0x4f1cc483420467aa2e7f193ac90ce230b373ec45d090c07cb9cfacefe68111cd",
      "0x17969df3ef966353a3d9758a0b02937a7f220e0d6020314e39ab7ab6fc6d3e04",
      "0xfba12eaf5505f94722b81cf39197f054a99de15cd2ba07eb71461f24989a4c20",
      "0x36e2d45d12d802414e647e32f01bcfad93258e86967e1db61399031106cdf087",
      "0xdaa19df7bd6143497cc2b2bcaab78549e098a6750c5ae229f630356fd0bb5f98",
      "0x2f6a8663c860c437a7f73000cf979488bcdcd0737f9cb6c46684f8cb2a37f069",
      "0x658d5d8350fdf2331a4ecf1061ff8b8c4eb991cef46c326ec75190cff8c24a58",
      "0x0fc44e46552dfe177c7f744be1c839ac920fed46154a0e5d121cb85b98b9b75f",
      "0x4baac602dc558ae1838c58bdf82be9a4c59bc9b6f703a1d5045d624ccd90d52b",
      "0xfbcd403108c88ef81580d31b52cdcd7dfc562dd4e5cb271da9469f34a2d3db01",
      "0x13a875215797d7eca6f76cf29a962ef6b2059ed4fa8a6886f808742c76d0c971",
      "0x1856742ae9b0f3cd26a4d038b0cfe62c0fd7b392715a0a3d9c76b13fd259810c",
      "0x342288985cb34180b64263adf65ef4e2ea5721fb9e0618e745af9780e5e1ffcb",
      "0xb2403549c5b50936b4ad95234eff96bb8dd4e2c0e48f0ab75a15949388dbef80",
      "0xf449652b5b58d167c632eca458203fd3cc9b06f7f79f607b1b49d915f295623d",
      "0x8db97531fdff367fb4a07ff7d79d6f6e2c19a4861ec8d098ad3cf4103a71b753",
      "0xd5862273a40fc37f5b4f777dac7e0469f25db39401cff2a94fb4d5e1626a682a",
      "0x5017d9aaa84aea967d1b2cae01d7bd65c1dcdf660c259c8278e19483f8983068",
      "0xc07048292481d292124e9f8d2e54a4d8f33626e324bf7118c51ca36d5bbf49f0",
      "0xfb6caf9a36c61453acc30387e0a0e6ad8eafebc48fe860cfc3d6493a7606d859",
      "0x062d88ce86e44d821590c410463586a69bd109806cccda678d676d358aff8b64",
      "0x292ea1128b751cf0e65f75fa11548724c69578c8d6d078bdcb4ead66962d971e",
      "0x4ce14b27557b119c9de58feb0dcb753423c033c6ba02dd54d88ebde8e1163a67",
      "0x1891e9024fb9657f09f4b0a5ee964d81ac39e650517d951e32c7518bf1426279",
      "0xd86a5641962ed78c3683b995208aff4c3c20091d5413b205be68fb5ea2b18db2",
      "0xe7ac3b7197c6d35da31543297222928d135de9affbeb3b4b569daa409aac3e49",
      "0x3fb3c8b7f5ebbcdb783142c762e66a566c290aac1ccdc5127eef69bbabf618c4",
      "0xfde48bcfff9e359327645fb479ad4c6d77402efdf92a15acb40e4be1409dddfb",
      "0xd98d803e98c0117ac3594baaa87a973e069544094d756643f05e8139b71a3a5a",
    ],
  },
  assemble: session => [
    session
      .market({ pool: KPK_FRXUSD_POOL })
      // Assets and price feeds
      .addAction({
        type: "MARKET::addAsset",
        params: {
          token: MGLOBAL,
          priceFeed: "0x66aa9fcd63df74e1f67a9452e6e59fbc67f75e38",
        },
      })
      .addAction({
        type: "ORACLE::setReservePriceFeed",
        params: {
          token: MGLOBAL,
          priceFeed: "0x66aa9fcd63df74e1f67a9452e6e59fbc67f75e38",
        },
      })
      .addAction({
        type: "ORACLE::setPriceFeed",
        params: {
          token: USDC,
          priceFeed: "0x8ad48f5269a9e8c21f677bc81cce503e55196949",
        },
      })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: USDC, limit: 1_000 },
      })
      .addAction({
        type: "POOL::setTokenQuotaIncreaseFee",
        params: { token: USDC, fee: 100 },
      })
      .addAction({
        type: "ORACLE::setPriceFeed",
        params: {
          token: USDT,
          priceFeed: "0x42a67aea2320003b5561eb2c86b4731994ed53d4",
        },
      })
      .addAction({
        type: "ORACLE::setPriceFeed",
        params: {
          token: CRVUSD,
          priceFeed: "0x23072b388af634bf9e301d209f7257ff8087d5e8",
        },
      })
      .addAction({
        type: "ORACLE::setPriceFeed",
        params: {
          token: CRVUSD_USDC,
          priceFeed: "0x7c031f462e390d7d6fc2b44739082727eea0e0db",
        },
      })
      .addAction({
        type: "MARKET::addAsset",
        params: { token: THREE_CRV, priceFeed: ZERO_PRICE_FEED },
      })
      .addAction({
        type: "MARKET::addAsset",
        params: { token: DAI, priceFeed: ZERO_PRICE_FEED },
      })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: MGLOBAL, limit: 1_000_000 },
      })
      // The whitelisted credit suite and its Degen NFT
      .addAction({
        type: "MARKET::addPeripheryContract",
        params: { peripheryContract: DEGEN_NFT, domain: "DEGEN_NFT", type: "" },
      })
      .addAction({
        type: "MARKET::createCreditSuite",
        params: {
          id: "mglobal",
          name: "mGLOBAL Strategy",
          minorVersion: 310,
          maxEnabledTokens: 1,
          feeInterest: 20,
          feeLiquidation: 1,
          feeLiquidationPremium: 4,
          feeLiquidationExpired: 1,
          feeLiquidationPremiumExpired: 4,
          minDebt: 150_000,
          maxDebt: 1_000_000,
          accountFactoryType: "DEFAULT",
          isExpired: false,
          expirationDate: 0,
          whitelistPolicy: DEGEN_NFT,
        },
      })
      .addAction({
        type: "POOL::setCreditManagerDebtLimit",
        params: { creditManager: SUITE, limit: 1_000_000 },
      })
      // Collateral: everything on the route at 0%, mGLOBAL at 82%
      .addActions(
        (
          [
            [USDC, 0],
            [USDT, 0],
            [CRVUSD, 0],
            [CRVUSD_USDC, 0],
            [CRVUSD_USDT, 0],
            [CRV_FRXUSD, 0],
            [THREE_CRV, 0],
            [DAI, 0],
            [MGLOBAL, 82],
          ] as const
        ).map(([token, liquidationThreshold]) => ({
          type: "CREDIT::addCollateralToken" as const,
          params: { creditManager: SUITE, token, liquidationThreshold },
        })),
      )
      // Adapters
      .addAction(curvePool("CURVE_V1_2ASSETS", CRVUSD_USDC))
      .addAction(curvePool("CURVE_V1_2ASSETS", CRVUSD_USDT))
      .addAction(curvePool("CURVE_STABLE_NG", CRV_FRXUSD))
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: SUITE,
          adapter: {
            type: "FLUID_DEX",
            version: 310,
            target: "0x667701e51b4d1ca244f17c78f7ab8744b4c99f9b",
          },
        },
      })
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: SUITE,
          adapter: {
            type: "UNISWAP_V4_GATEWAY",
            version: 310,
            target: UNISWAP_V4_GATEWAY,
          },
        },
      })
      .addAction({
        type: "ADAPTER::UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
        params: {
          creditManager: SUITE,
          version: 310,
          target: UNISWAP_V4_GATEWAY,
          poolKeys: (
            [
              [FRXUSD, 80, 2],
              [USDT, 7, 1],
              [USDT, 80, 1],
              [USDT, 10, 1],
            ] as const
          ).map(([token1, fee, tickSpacing]) => ({
            poolKey: {
              token0: USDC,
              token1,
              fee,
              tickSpacing,
              hooks: NO_HOOKS,
            },
            allowed: true,
          })),
        },
      })
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: SUITE,
          adapter: {
            type: "CURVE_V1_3ASSETS",
            version: 311,
            target: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
            lpToken: THREE_CRV,
            basePool: zeroAddress,
            use256: false,
          },
        },
      })
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: SUITE,
          adapter: {
            type: "MIDAS_ISSUANCE_VAULT",
            version: 311,
            target: MIDAS_ISSUANCE_VAULT,
            reffererId: "",
          },
        },
      })
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: SUITE,
          adapter: {
            type: "MIDAS_REDEMPTION_VAULT",
            version: 311,
            target: MIDAS_REDEMPTION_VAULT,
          },
        },
      })
      .addAction({
        type: "ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch",
        params: {
          creditManager: SUITE,
          version: 311,
          target: MIDAS_ISSUANCE_VAULT,
          allowedTokens: usdcOnly,
        },
      })
      .addAction({
        type: "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
        params: {
          creditManager: SUITE,
          version: 311,
          target: MIDAS_REDEMPTION_VAULT,
          allowedTokens: usdcOnly,
        },
      })
      .addAction({ type: "RATE_KEEPER::TUMBLER::updateRates", params: {} }),
  ],
};
