/**
 * kpk #107 "Wallet Removal": a configurator GIP that removes an emergency
 * liquidator. Configurator actions are recorded on `session.configurator()`.
 **/
import type { GipReproduction } from "../types.js";

export const kpk107RemoveEmergencyLiquidator: GipReproduction = {
  gip: {
    id: "1-0x1b265b97eb169fb6668e3258007c3b0242c7bdbe-107",
    name: "Wallet Removal",
    marketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    author: "0xaf150c6d108d0c2c96bbfc3cef9b4848b5d99440",
    eta: 1781281800,
    executedAtBlock: 25302710n,
    timelockTxHashes: [
      "0xab7af893e3779a171dfff771add516242acbebba8504f40265431b3ef450f897",
    ],
  },
  assemble: session => [
    session.configurator().addAction({
      type: "CONFIGURATOR::removeAdmin",
      params: {
        role: "EMERGENCY_LIQUIDATOR",
        admin: "0x16040e932b5ac7a3ab23b88a2f230b4185727b0d",
      },
    }),
  ],
};
