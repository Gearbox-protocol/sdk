/**
 * Gami Labs #10 "Claim Fees July 6th": the treasury splitter distributes the
 * WBTC pool shares the treasury collected as fees.
 *
 * The app recorded this as an action of the WBTC market. In the SDK the
 * treasury splitter is shared by every market of the configurator, so
 * `TREASURY_SPLITTER::distribute` is a configurator action.
 **/
import type { GipReproduction } from "../types.js";

/** The WBTC pool's own share token, dWBTC-V3-0. **/
const DWBTC_V3_0 = "0x683faf5bafd88d4c383ccaf3d61c26af2e164409";

export const gami10ClaimFees: GipReproduction = {
  gip: {
    id: "1-0x601067eba24bb5b558a184fc082525637e96a42d-10",
    name: "Claim Fees July 6th",
    marketConfigurator: "0x601067eba24bb5b558a184fc082525637e96a42d",
    author: "0x53aee36d08042de7e5a4d3b3f7cefd284fcd0253",
    eta: 1783440000,
    executedAtBlock: 25481744n,
    timelockTxHashes: [
      "0xfe57b746454cb3b0c43affe55cadafba62ddad543d47f4b82e84bd394094f3b0",
    ],
  },
  assemble: session => [
    session.configurator().addAction({
      type: "TREASURY_SPLITTER::distribute",
      params: { token: DWBTC_V3_0 },
    }),
  ],
};
