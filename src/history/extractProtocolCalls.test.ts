import { readFileSync } from "node:fs";
import path from "node:path";
import type { Address, Hex } from "viem";
import { expect, it } from "vitest";
import { extractProtocolCalls } from "./extractProtocolCalls.js";
import type { CallTrace, ExecuteResult } from "./internal-types.js";
import { collectTraces } from "./trace-utils.js";

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

it("returns empty array for zero execute results", () => {
  const fixture = loadFixture(
    "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(extractProtocolCalls(facadeTraces[0], [])).toEqual([]);
});

it("extracts protocol calls from real trace", () => {
  const fixture = loadFixture(
    "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(facadeTraces).toHaveLength(1);

  const executeResults: ExecuteResult[] = [
    {
      transfers: [],
      targetContract: "0x5a71e7e04f8725fd42a216949e7099ebd08a42e3", // stake(uint256)
    },
    {
      transfers: [],
      targetContract: "0x667701e51b4d1ca244f17c78f7ab8744b4c99f9b", // swapIn(bool,uint256,uint256,address)
    },
  ];

  const result = extractProtocolCalls(facadeTraces[0], executeResults);

  expect(result).toEqual([
    "0xa694fc3a000000000000000000000000000000000000000000003905517c93364e161f37",
    "0x2668dfaa000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000037daa6afb400000000000000000000000000000000000000000000000000000000000000000000000000000000000000009d7ab1290d7a3ee662f545ac29091c4c61f81f14",
  ]);
});

it("extracts protocol call from liquidation trace", () => {
  const fixture = loadFixture(
    "0x73b80d27b4155b9102059aea61bed4e5e108ab25a30b1c06abb174eeae70b295_0xf2365b21c6f4cc73d38b6fb5de9ab506a4a5dff9.json",
  );
  const facadeTraces = collectTraces(fixture.trace, fixture.creditFacade);
  expect(facadeTraces).toHaveLength(1);

  const executeResults: ExecuteResult[] = [
    {
      transfers: [],
      targetContract: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    },
  ];

  const result = extractProtocolCalls(facadeTraces[0], executeResults);

  expect(result).toEqual([
    "0xba08765200000000000000000000000000000000000000000000000e46b098f5499254db000000000000000000000000f2365b21c6f4cc73d38b6fb5de9ab506a4a5dff9000000000000000000000000f2365b21c6f4cc73d38b6fb5de9ab506a4a5dff9" as Hex,
  ]);
});
