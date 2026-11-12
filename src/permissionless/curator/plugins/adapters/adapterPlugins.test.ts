/**
 * Invariants every built-in adapter plugin keeps: what it offers as defaults
 * is what `CREDIT::allowAdapter` accepts and can encode.
 **/
import { type Address, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { GipRegistry } from "../../GipRegistry.js";

const CM: Address = "0x2222222222222222222222222222222222222222";
const plugins = GipRegistry.builtin.adapterPlugins.map(
  plugin => [plugin.type, plugin] as const,
);

describe("built-in adapter plugins", () => {
  it.each(plugins)("%s parses its defaults losslessly", (_, plugin) => {
    const defaults = plugin.getDefaultParams();
    expect(plugin.deployParamsSchema.parse(defaults)).toStrictEqual(defaults);
    expect(
      GipRegistry.builtin.adapterDeployParamsSchema.parse(defaults),
    ).toStrictEqual(defaults);
  });

  it.each(plugins)("%s encodes its defaults", (type, plugin) => {
    const params = plugin.getDefaultParams();
    expect(() =>
      plugin.getDeployParams({ creditManager: CM, params }),
    ).not.toThrow();
    expect(plugin.getDeployState(params)).toMatchObject({
      type,
      version: params.version,
      target: params.target,
      adapter: zeroAddress,
      isForbidden: false,
    });
  });
});

describe("adapter versions", () => {
  it.each(plugins)("%s encodes every version it accepts", (_, plugin) => {
    const defaults = plugin.getDefaultParams();
    for (const version of [300, 310, 311, 312, 320]) {
      const parsed = plugin.deployParamsSchema.safeParse({
        ...defaults,
        version,
      });
      if (!parsed.success) continue;
      expect(
        () =>
          plugin.getDeployParams({ creditManager: CM, params: parsed.data }),
        `v${version}`,
      ).not.toThrow();
    }
  });
});

describe("deploy params of versioned adapters", () => {
  const schemaOf = (type: string) =>
    GipRegistry.builtin.requireAdapter(type).deployParamsSchema;

  it("takes the gateway of an ERC-4626 adapter from v3.1.2 on", () => {
    const schema = schemaOf("ERC4626_VAULT");
    const vault = { type: "ERC4626_VAULT", target: CM };
    expect(schema.parse({ ...vault, version: 311 })).toEqual({
      ...vault,
      version: 311,
    });
    expect(
      schema.parse({ ...vault, version: 312, gateway: zeroAddress }),
    ).toEqual({ ...vault, version: 312, gateway: zeroAddress });
    expect(schema.safeParse({ ...vault, version: 312 }).success).toBe(false);
    expect(schema.safeParse({ ...vault, version: 310 }).success).toBe(false);
  });

  it.each(["ERC4626_VAULT_REFERRAL", "STAKING_REWARDS"])(
    "%s takes a uint16 referral code",
    type => {
      const schema = schemaOf(type);
      const defaults = GipRegistry.builtin
        .requireAdapter(type)
        .getDefaultParams();
      for (const referral of [0, 1, 65_535]) {
        expect(schema.safeParse({ ...defaults, referral }).success).toBe(true);
      }
      for (const referral of [-1, 1.5, 65_536]) {
        expect(schema.safeParse({ ...defaults, referral }).success).toBe(false);
      }
    },
  );
});
