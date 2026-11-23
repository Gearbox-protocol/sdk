/** `CONFIGURATOR::grantRole` / `revokeRole` and the ACL roles they track. **/
import {
  type Address,
  decodeFunctionData,
  type Hex,
  hexToString,
  stringToHex,
} from "viem";
import { describe, expect, it } from "vitest";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { ConfigurationExecutor } from "../executor/ConfigurationExecutor.js";
import { compareConfiguratorStates } from "../state/configurator/compareConfiguratorStates.js";
import {
  CONFIGURATOR,
  configuratorState,
  createStubClient,
  createTestSdk,
} from "../testing/sdkHarness.js";
import { grantRoleActionData } from "./grantRoleActionData.js";
import type { ConfiguratorActions } from "./types.js";

const SIGNER: Address = "0x4444444444444444444444444444444444444444";
const OTHER: Address = "0x8888888888888888888888888888888888888888";

function run(
  actions: ConfiguratorActions[],
  state = configuratorState(),
): ReturnType<ConfigurationExecutor["execute"]> {
  const client = createStubClient();
  const executor = new ConfigurationExecutor({
    client,
    marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
    tokens: { decimals: () => 18 },
  });
  return executor.execute(state, actions);
}

function decodeCall(callData: Hex) {
  const { functionName, args } = decodeFunctionData({
    abi: iMarketConfiguratorV310Abi,
    data: callData,
  });
  const [role, account] = args as readonly [Hex, Address];
  return { functionName, role: hexToString(role, { size: 32 }), account };
}

describe("CONFIGURATOR::grantRole", () => {
  it("grants a role without a field of its own", async () => {
    const result = await run([
      {
        type: "CONFIGURATOR::grantRole",
        params: { role: "OPENING_SIGNER", account: SIGNER },
      },
    ]);
    expect(result.blockedAt).toBeUndefined();
    expect(result.diagnostics).toEqual([]);
    expect(result.after.otherRoles).toEqual({ OPENING_SIGNER: [SIGNER] });
    expect(decodeCall(result.txs[0].tx.callData)).toEqual({
      functionName: "grantRole",
      role: "OPENING_SIGNER",
      account: SIGNER,
    });
    expect(
      compareConfiguratorStates(result.before, result.after).differences
        .otherRoles,
    ).toEqual({ OPENING_SIGNER: { added: [SIGNER], removed: [] } });
  });

  it.each(["constructor", "__proto__", "toString"])(
    "tracks role %s across grants and revocations",
    async role => {
      const initial = configuratorState({ otherRoles: {} });
      const grant = await run(
        [
          {
            type: "CONFIGURATOR::grantRole",
            params: { role, account: SIGNER },
          },
        ],
        initial,
      );
      expect(grant.blockedAt).toBeUndefined();
      expect(grant.after.otherRoles?.[role]).toEqual([SIGNER]);
      expect(
        compareConfiguratorStates(initial, grant.after).differences
          .otherRoles?.[role]?.added,
      ).toEqual([SIGNER]);
      expect(
        compareConfiguratorStates(grant.after, initial).differences
          .otherRoles?.[role]?.removed,
      ).toEqual([SIGNER]);
      const revoke = await run(
        [
          {
            type: "CONFIGURATOR::revokeRole",
            params: { role, account: SIGNER },
          },
        ],
        grant.after,
      );
      expect(revoke.blockedAt).toBeUndefined();
      expect(revoke.after.otherRoles?.[role]).toEqual([]);
    },
  );

  it("keeps the admin roles in their own fields", async () => {
    const result = await run([
      {
        type: "CONFIGURATOR::grantRole",
        params: { role: "PAUSABLE_ADMIN", account: SIGNER },
      },
      {
        type: "CONFIGURATOR::addAdmin",
        params: { role: "PAUSABLE_ADMIN", admin: SIGNER },
      },
    ]);
    expect(result.after.pausableAdmins).toEqual([SIGNER]);
    expect(result.after.otherRoles).toBeUndefined();
    // The legacy action sees what the new one granted.
    expect(result.blockedAt).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({ code: "NO_OP" });
  });

  it("rejects granting a role the account holds", async () => {
    const result = await run(
      [
        {
          type: "CONFIGURATOR::grantRole",
          params: { role: "OPENING_SIGNER", account: SIGNER },
        },
      ],
      configuratorState({ otherRoles: { OPENING_SIGNER: [SIGNER] } }),
    );
    expect(result.blockedAt).toBe(0);
    expect(result.diagnostics[0]).toMatchObject({
      code: "NO_OP",
      path: ["params", "account"],
    });
  });

  it("warns about a role no Gearbox contract checks", async () => {
    const result = await run([
      {
        type: "CONFIGURATOR::grantRole",
        params: { role: "PAUSEABLE_ADMIN", account: SIGNER },
      },
    ]);
    expect(result.blockedAt).toBeUndefined();
    expect(result.txs).toHaveLength(1);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "UNKNOWN_ROLE",
        path: ["params", "role"],
      }),
    ]);
  });

  it("takes role names that read back from bytes32", () => {
    const parse = (role: string) =>
      grantRoleActionData.schema.safeParse({ role, account: SIGNER }).success;
    expect(parse("OPENING_SIGNER")).toBe(true);
    expect(parse("A".repeat(32))).toBe(true);
    expect(parse("A".repeat(33))).toBe(false);
    expect(parse("")).toBe(false);
    expect(parse("OPENING SIGNER")).toBe(false);
    expect(parse("ROLE\u0000")).toBe(false);
  });
});

describe("CONFIGURATOR::revokeRole", () => {
  it("revokes a role and keeps it with no holders", async () => {
    const result = await run(
      [
        {
          type: "CONFIGURATOR::revokeRole",
          params: { role: "OPENING_SIGNER", account: SIGNER },
        },
      ],
      configuratorState({ otherRoles: { OPENING_SIGNER: [SIGNER, OTHER] } }),
    );
    expect(result.blockedAt).toBeUndefined();
    expect(result.after.otherRoles).toEqual({ OPENING_SIGNER: [OTHER] });
    expect(decodeCall(result.txs[0].tx.callData)).toEqual({
      functionName: "revokeRole",
      role: "OPENING_SIGNER",
      account: SIGNER,
    });
  });

  it("rejects revoking a role the account does not hold", async () => {
    const result = await run([
      {
        type: "CONFIGURATOR::revokeRole",
        params: { role: "LOSS_LIQUIDATOR", account: SIGNER },
      },
    ]);
    expect(result.blockedAt).toBe(0);
    expect(result.diagnostics[0]).toMatchObject({ code: "ROLE_NOT_GRANTED" });
  });

  it("rejects revoking the configurator's own pause roles", async () => {
    const state = configuratorState({
      pausableAdmins: [CONFIGURATOR],
      unpausableAdmins: [CONFIGURATOR],
    });
    for (const role of ["PAUSABLE_ADMIN", "UNPAUSABLE_ADMIN"]) {
      const result = await run(
        [
          {
            type: "CONFIGURATOR::revokeRole",
            params: { role, account: CONFIGURATOR },
          },
        ],
        state,
      );
      expect(result.blockedAt, role).toBe(0);
      expect(result.diagnostics[0]).toMatchObject({
        code: "CONFIGURATOR_ROLE_REQUIRED",
      });
    }
  });

  it("revokes what grantRole granted earlier in the same GIP", async () => {
    const result = await run([
      {
        type: "CONFIGURATOR::grantRole",
        params: { role: "OPENING_SIGNER", account: SIGNER },
      },
      {
        type: "CONFIGURATOR::revokeRole",
        params: { role: "OPENING_SIGNER", account: SIGNER },
      },
    ]);
    expect(result.blockedAt).toBeUndefined();
    expect(result.txs).toHaveLength(2);
    expect(result.after.otherRoles).toEqual({ OPENING_SIGNER: [] });
  });
});

describe("ACL roles on chain", () => {
  const roles: Record<string, Address[]> = {
    PAUSABLE_ADMIN: [OTHER],
    UNPAUSABLE_ADMIN: [],
    LOSS_LIQUIDATOR: [],
    EMERGENCY_LIQUIDATOR: [],
    OPENING_SIGNER: [SIGNER],
  };
  const stub = {
    multicall: (contract: {
      functionName: string;
      args?: readonly unknown[];
    }) => {
      if (contract.functionName === "getRoles") {
        return {
          status: "success" as const,
          result: Object.keys(roles).map(role =>
            stringToHex(role, { size: 32 }),
          ),
        };
      }
      if (contract.functionName === "getRoleHolders") {
        const role = hexToString(contract.args?.[0] as Hex, { size: 32 });
        return { status: "success" as const, result: roles[role] };
      }
      return undefined;
    },
  };

  it("preserves distinct binary roles and roles that decode to a built-in name", async () => {
    const binaryA = ("0x" + "fe".repeat(32)) as Hex;
    const binaryB = ("0x" + "ff".repeat(32)) as Hex;
    const prefixed = stringToHex("\uFEFFPAUSABLE_ADMIN", { size: 32 });
    const holders: Record<Hex, Address[]> = {
      [binaryA]: [SIGNER],
      [binaryB]: [OTHER],
      [prefixed]: [SIGNER],
    };
    const mc = new MarketConfiguratorContract(
      CONFIGURATOR,
      createStubClient({
        multicall: contract => {
          if (contract.functionName === "getRoles")
            return { status: "success", result: Object.keys(holders) };
          if (contract.functionName === "getRoleHolders")
            return {
              status: "success",
              result: holders[contract.args?.[0] as Hex] ?? [],
            };
          return undefined;
        },
      }),
    );
    expect((await mc.admins()).otherRoles).toEqual(holders);
  });

  it("reads every role the ACL has", async () => {
    const mc = new MarketConfiguratorContract(
      CONFIGURATOR,
      createStubClient(stub),
    );
    const admins = await mc.admins();
    expect(admins.pausableAdmins).toEqual([OTHER]);
    expect(admins.otherRoles).toEqual({ OPENING_SIGNER: [SIGNER] });
  });

  it("previews a revocation on the fetched state", async () => {
    const { sdk } = await createTestSdk({ stub });
    const preview = await sdk
      .configurator()
      .addAction({
        type: "CONFIGURATOR::revokeRole",
        params: { role: "OPENING_SIGNER", account: SIGNER },
      })
      .preview();
    expect(preview.before.otherRoles).toEqual({ OPENING_SIGNER: [SIGNER] });
    expect(preview.after.otherRoles).toEqual({ OPENING_SIGNER: [] });
  });
});

describe("emergencyRevokeRole", () => {
  it("encodes and parses the emergency revocation", () => {
    const mc = new MarketConfiguratorContract(CONFIGURATOR, createStubClient());
    const tx = mc.emergencyRevokeRole("OPENING_SIGNER", SIGNER);
    expect(tx.to.toLowerCase()).toBe(CONFIGURATOR);
    expect(decodeCall(tx.callData)).toEqual({
      functionName: "emergencyRevokeRole",
      role: "OPENING_SIGNER",
      account: SIGNER,
    });
    expect(mc.mustParseFunctionData(tx.callData).args).toEqual({
      role: "OPENING_SIGNER",
      address: SIGNER,
    });
  });

  it("goes out through the emergency admin as is when it is direct", () => {
    const mc = new MarketConfiguratorContract(CONFIGURATOR, createStubClient());
    const tx = mc.emergencyRevokeRole("EMERGENCY_LIQUIDATOR", SIGNER);
    expect(
      mc.wrapEmergencyTx(tx, {
        type: "direct",
        address: OTHER,
        executor: OTHER,
      }),
    ).toBe(tx);
  });
});
