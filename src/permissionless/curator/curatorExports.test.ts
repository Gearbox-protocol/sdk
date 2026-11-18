/** What the curator exposes through the `permissionless` entry. **/
import { describe, expect, it } from "vitest";
import * as permissionless from "../index.js";
import * as curator from "./index.js";

const root: Record<string, unknown> = permissionless;

describe("entry points", () => {
  it("re-exports the whole curator entry from the permissionless entry", () => {
    for (const [name, value] of Object.entries(curator)) {
      expect(root[name], name).toBe(value);
    }
  });

  it("keeps the session's internals private", () => {
    for (const name of [
      "deepCopy",
      "deepFreeze",
      "snapshot",
      "createPinnedReadClient",
      "TokenDecimalsCache",
      "collectActionTokens",
      "collectBundleTokens",
      "assertActionScope",
      "checkActionParams",
      "downgradeUnverifiedVerdict",
    ]) {
      expect(curator, name).not.toHaveProperty(name);
      expect(permissionless, name).not.toHaveProperty(name);
    }
  });

  it("serves the session, its registry and the adapter plugin kit", () => {
    for (const name of [
      "CuratorSession",
      "MarketBuilder",
      "ConfiguratorBuilder",
      "createAction",
      "GipActionError",
      "GipScopeError",
      "GipSimulationError",
      "GipRegistry",
      "adapterPluginKit",
    ]) {
      expect(permissionless, name).toHaveProperty(name);
    }
    for (const name of [
      "defineAdapterPlugin",
      "defineMarketAction",
      "adapterBatch",
      "configureAdapter",
    ]) {
      expect(permissionless.adapterPluginKit, name).toHaveProperty(name);
    }
    expect(permissionless.adapterPluginKit.schema).toHaveProperty("list");
  });

  it("keeps generic names out of the entries", () => {
    for (const name of [
      "address",
      "boolean",
      "list",
      "object",
      "status",
      "string",
      "addressSchema",
      "uintSchema",
    ]) {
      expect(curator, name).not.toHaveProperty(name);
      expect(permissionless, name).not.toHaveProperty(name);
    }
  });
});
