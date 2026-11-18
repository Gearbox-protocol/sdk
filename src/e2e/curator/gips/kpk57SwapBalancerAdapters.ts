/**
 * kpk #57 "Swap Balancer adapters": replaces a credit manager's Balancer V3
 * router adapter with the v3.1.1 one and allows the same pool on it.
 **/
import type { GipReproduction } from "../types.js";

const KPK_WETH_POOL = "0x9396dcbf78fc526bb003665337c5e73b699571ef";
const CREDIT_MANAGER = "0x1293a69e4ad4a93293a06b6303104be35bdd83af";
const BALANCER_V3_ROUTER = "0x8A57c21234ddc225499843F6A073dd374c952560";

export const kpk57SwapBalancerAdapters: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-57",
    name: "Swap Balancer adapters",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0x331d9c769185ae25233314859d53c2b9203a1204",
    eta: 1768507200,
    executedAtBlock: 24242731n,
    timelockTxHashes: [
      "0x6ca327bc80a85c5332f864c6ba59209a8b58b0d0225b426e1cf930b7035db697",
      "0x80d7965d3d355552e256abb7e838e0a74e38fd95f6f886a171e9dece5b0acbe1",
      "0xdb8c366fb74fcb8d6bae21ca5eef7e1b1843e8052386cc20bde42253d0ecaf10",
    ],
  },
  assemble: session => [
    session
      .market({ pool: KPK_WETH_POOL })
      .addAction({
        type: "CREDIT::forbidAdapter",
        params: {
          creditManager: CREDIT_MANAGER,
          // the previous Balancer V3 router adapter
          adapter: "0x1A02cEe1C53BF9bfECb9014a34D81985B6824d51",
        },
      })
      .addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: CREDIT_MANAGER,
          adapter: {
            type: "BALANCER_V3_ROUTER",
            version: 311,
            target: BALANCER_V3_ROUTER,
          },
        },
      })
      .addAction({
        type: "ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch",
        params: {
          creditManager: CREDIT_MANAGER,
          version: 311,
          target: BALANCER_V3_ROUTER,
          pools: [
            { pool: "0x1ea5870f7c037930ce1d5d8d9317c670e89e13e3", status: 1 },
          ],
        },
      }),
  ],
};
