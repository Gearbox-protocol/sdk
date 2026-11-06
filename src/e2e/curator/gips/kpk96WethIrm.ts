/**
 * kpk #96 "Adjust IRM on WETH pool": a new linear interest rate model for the
 * kpk WETH market.
 **/
import type { GipReproduction } from "../types.js";

const KPK_WETH_POOL = "0x9396dcbf78fc526bb003665337c5e73b699571ef";

export const kpk96WethIrm: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-96",
    name: "Adjust IRM on WETH pool",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0x331d9c769185ae25233314859d53c2b9203a1204",
    eta: 1776776400,
    executedAtBlock: 24928629n,
    timelockTxHashes: [
      "0x87d0efcbe309f8156d00619acbfb4128dd7fb46ba732b247a3a0592210bff532",
    ],
  },
  assemble: session => [
    session.market({ pool: KPK_WETH_POOL }).addAction({
      type: "MARKET::updateInterestRateModel",
      params: {
        type: "LINEAR",
        params: {
          U_1: 70,
          U_2: 92,
          R_base: 0,
          // @dev 112 bps were executed. The app recorded 1.13%, which its
          // builder truncated (1.13 * 100 = 112.99…); the SDK rounds.
          R_slope1: 1.12,
          R_slope2: 1.5,
          R_slope3: 1.6,
          isBorrowingMoreU2Forbidden: true,
        },
      },
    }),
  ],
};
