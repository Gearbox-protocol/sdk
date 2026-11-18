import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type { CuratorSession } from "../../curator/session/CuratorSession.js";
import type { GearboxPermissionless } from "../GearboxPermissionless.js";
import type { OpenCuratorSessionArgs } from "./types.js";

declare const permissionless: GearboxPermissionless;
declare const marketConfigurator: Address;

describe("curator.open connection types", () => {
  it("accepts a chain id or fork with shared session options", () => {
    const chainArgs: OpenCuratorSessionArgs = {
      chainId: 1,
      marketConfigurator,
      blockNumber: 21_000_000n,
      gasLimit: 550_000_000n,
      tokenDecimals: { [marketConfigurator]: 6 },
      plugins: [],
    };
    const forkArgs: OpenCuratorSessionArgs = {
      fork: { rpcUrl: "http://127.0.0.1:8545", timeoutMs: 1000 },
      marketConfigurator,
      blockNumber: 21_000_000n,
      gasLimit: 550_000_000n,
      tokenDecimals: { [marketConfigurator]: 6 },
      plugins: [],
    };

    expectTypeOf(permissionless.curator.open(chainArgs)).toEqualTypeOf<
      Promise<CuratorSession>
    >();
    expectTypeOf(permissionless.curator.open(forkArgs)).toEqualTypeOf<
      Promise<CuratorSession>
    >();
  });

  it("rejects ambiguous or missing connections", () => {
    // @ts-expect-error choose chainId or fork, not both
    permissionless.curator.open({
      chainId: 1,
      fork: { rpcUrl: "http://127.0.0.1:8545" },
      marketConfigurator,
    });

    // @ts-expect-error a connection is required
    permissionless.curator.open({ marketConfigurator });

    permissionless.curator.open({
      marketConfigurator,
      // @ts-expect-error a fork connection requires an RPC URL
      fork: {},
    });
  });
});
