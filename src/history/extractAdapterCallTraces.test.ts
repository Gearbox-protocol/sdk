import { readFileSync } from "node:fs";
import path from "node:path";
import { type Address, decodeAbiParameters, getAddress, type Hex } from "viem";
import { expect, it } from "vitest";
import { extractAdapterCallTraces } from "./extractAdapterCallTraces.js";
import type { CallTrace } from "./internal-types.js";
import {
  collectTraces,
  findCallWithInput,
  findExecuteBytes,
  resolveProtocolCall,
} from "./trace-utils.js";

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__");
const INPUTS_DIR = path.join(FIXTURES_DIR, "inputs");

interface FixtureInput {
  trace: CallTrace;
  creditFacade: Address;
  creditAccount: Address;
}

function loadFixture(name: string): FixtureInput {
  return JSON.parse(readFileSync(path.join(INPUTS_DIR, name), "utf-8"));
}

/**
 * Resolves the protocol target contract from an adapter-level trace the same
 * way `parseProtocolCall` does: shallowest `execute(bytes)` -> forwarded
 * calldata -> leaf CALL whose input matches that calldata.
 */
function resolveTarget(trace: CallTrace): Address {
  const exec = findExecuteBytes(trace);
  if (!exec) throw new Error("no execute(bytes) in adapter trace");
  const [data] = decodeAbiParameters(
    [{ type: "bytes" }],
    `0x${exec.input.slice(10)}`,
  );
  const leaf = findCallWithInput(exec, data as Hex);
  if (!leaf) throw new Error("no leaf CALL matching forwarded calldata");
  return getAddress(leaf.to);
}

it("extracts adapter call traces from real trace", () => {
  const fixture = loadFixture(
    "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(facadeTraces).toHaveLength(1);

  const result = extractAdapterCallTraces(facadeTraces[0]);
  expect(result).toHaveLength(2);
  expect(result.map(resolveTarget)).toEqual([
    getAddress("0x5a71e7e04f8725fd42a216949e7099ebd08a42e3"), // stake(uint256)
    getAddress("0x667701e51b4d1ca244f17c78f7ab8744b4c99f9b"), // swapIn(...)
  ]);
});

it("extracts adapter call trace from liquidation trace", () => {
  const fixture = loadFixture(
    "0x73b80d27b4155b9102059aea61bed4e5e108ab25a30b1c06abb174eeae70b295_0xf2365b21c6f4cc73d38b6fb5de9ab506a4a5dff9.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(facadeTraces).toHaveLength(1);

  const result = extractAdapterCallTraces(facadeTraces[0]);
  expect(result).toHaveLength(1);
  expect(result.map(resolveTarget)).toEqual([
    getAddress("0x7a4EffD87C2f3C55CA251080b1343b605f327E3a"),
  ]);
});

it("excludes facade-synthesized phantom-token withdrawals", () => {
  const fixture = loadFixture(
    "0x05ab6e36adf378e14caeadedf72668139801079606fc6ca825c689ac93d999e3_0x8071e781b7c524dd36a83e9efcca02a47bae5bec.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(facadeTraces).toHaveLength(1);

  // The multicall is `withdrawCollateral` (phantom token) + `updateQuota` with
  // no adapter inner calls. While processing the phantom `withdrawCollateral`,
  // the facade synthesizes its own `withdrawPhantomToken` adapter call, which
  // reaches an external protocol call but is not a user multicall inner call.
  const resolvable = (facadeTraces[0].calls ?? []).filter(
    sub => resolveProtocolCall(sub) !== undefined,
  );
  expect(resolvable).toHaveLength(1);

  // ...and it is excluded from the extracted adapter call traces.
  expect(extractAdapterCallTraces(facadeTraces[0])).toHaveLength(0);
});
