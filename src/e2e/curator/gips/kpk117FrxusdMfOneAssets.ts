/**
 * kpk #117 "frxUSD (80UR cap & mf-ONE)": quotes mF-ONE and mF-ONErdfrxUSD in
 * the frxUSD market and caps its interest rate model at 80% utilization.
 **/
import type { GipReproduction } from "../types.js";

const KPK_FRXUSD_POOL = "0xbd8ec7444db271635584cc38f5d06c72eab762f5";
const MF_ONE = "0x238a700ed6165261cf8b2e544ba797bc11e466ba";
const MF_ONE_RD_FRXUSD = "0x5d1c51ae5219deddefad70821d006fb40a4457f5";

export const kpk117FrxusdMfOneAssets: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-117",
    name: "frxUSD (80UR cap & mf-ONE)",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0xf0cf1e3ec6264b03241826f5b2abda17b4352a75",
    eta: 1789249680,
    executedAtBlock: 25975579n,
    timelockTxHashes: [
      "0xcb8d34c54e67c1f258c2180ff279948edbc0e75e5cf2f33c91dd09f6a2980790",
      "0xa270031b6a25be81ba299e0ea257cd33cf1e89c61b84962f465f720fdb9582a6",
      "0x237fe3747913f6a4eaac29c766323c612f8720b89f7e7120a59599183ab900e5",
      "0x5eeb151c44e0ab0e97bc5f453f6217a4b0fb1b97141920ecdf651e47562a1bc2",
      "0x305cc2f8f005733d45e5bccfcff0804c47a54cdc651eb9bf1c9dbdeea20d5cad",
      "0x4a84cef0fb8dd608ce425f924fd824194a4aea303ac1f8edc6f21466c9fd753c",
    ],
  },
  assemble: session => [
    session
      .market({ pool: KPK_FRXUSD_POOL })
      .addAction({
        type: "MARKET::addAsset",
        params: {
          token: MF_ONE,
          priceFeed: "0x8d51dbc85ceef637c97d02bdaabb5e274850e68c",
        },
      })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: MF_ONE, limit: 5_000_000 },
      })
      .addAction({
        type: "MARKET::addAsset",
        params: {
          token: MF_ONE_RD_FRXUSD,
          priceFeed: "0x4e6bfde947c781861a874353a2f08db0f9b8f59c",
        },
      })
      .addAction({
        type: "ORACLE::setReservePriceFeed",
        params: {
          token: MF_ONE_RD_FRXUSD,
          priceFeed: "0xf44619b5bec11bc5cebd1b3d2f4202c6794b77f7",
        },
      })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: MF_ONE_RD_FRXUSD, limit: 5_000_000 },
      })
      .addAction({
        type: "MARKET::updateInterestRateModel",
        params: {
          type: "LINEAR",
          params: {
            U_1: 70,
            U_2: 80,
            R_base: 4,
            R_slope1: 0,
            R_slope2: 1,
            R_slope3: 15,
            isBorrowingMoreU2Forbidden: true,
          },
        },
      }),
  ],
};
