/** CREATE2 salts of the plugin contracts a market deploys. **/
import { type Address, type Hex, stringToHex, zeroHash } from "viem";
import { describe, expect, it } from "vitest";
import type { DeployParams } from "../types.js";
import { irmPlugins } from "./irm/irmPlugins.js";
import { lossPolicyPlugins } from "./loss-policies/lossPolicyPlugins.js";
import { rateKeeperPlugins } from "./rate-keepers/rateKeeperPlugins.js";

const POOL: Address = "0x1111111111111111111111111111111111111111";
const ADDRESS_PROVIDER: Address = "0x4444444444444444444444444444444444444444";
const HEX_SALT: Hex = `0x${"ab".repeat(32)}`;

/** Deploy params of every plugin contract, for a given salt. **/
const deploys = (salt: string | undefined): Record<string, DeployParams> => ({
  "IRM::LINEAR": irmPlugins.LINEAR.getDeployParams({
    ...irmPlugins.LINEAR.getDefaultParams(),
    ...(salt === undefined ? {} : { salt }),
  }),
  "LOSS_POLICY::ALIASED": lossPolicyPlugins.ALIAS.getDeployParams({
    pool: POOL,
    addressProvider: ADDRESS_PROVIDER,
    params: { type: "ALIAS", ...(salt === undefined ? {} : { salt }) },
  }),
  ...Object.fromEntries(
    (["TUMBLER", "GAUGE"] as const).map(type => [
      `RATE_KEEPER::${type}`,
      rateKeeperPlugins[type].getDeployParams({
        pool: POOL,
        gearStakingAddress: ADDRESS_PROVIDER,
        params: {
          ...rateKeeperPlugins[type].getDefaultParams(),
          ...(salt === undefined ? {} : { salt }),
        },
      }),
    ]),
  ),
});

describe("plugin salts", () => {
  it("default to zero", () => {
    for (const [type, params] of Object.entries(deploys(undefined))) {
      expect(params.salt, type).toBe(zeroHash);
    }
  });

  it("keep a 32-byte hex salt as it is", () => {
    for (const [type, params] of Object.entries(deploys(HEX_SALT))) {
      expect(params.salt, type).toBe(HEX_SALT);
    }
  });

  it("encode any other salt as a string", () => {
    for (const [type, params] of Object.entries(deploys("market-1"))) {
      expect(params.salt, type).toBe(stringToHex("market-1", { size: 32 }));
    }
  });
});
