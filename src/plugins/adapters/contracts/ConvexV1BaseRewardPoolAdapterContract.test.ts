import { readFileSync } from "node:fs";
import path from "node:path";
import {
  type Address,
  createPublicClient,
  custom,
  encodeAbiParameters,
  getAddress,
  type Hex,
  padHex,
} from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import {
  type CallTrace,
  collectTraces,
  EXECUTE_BYTES_SELECTOR,
} from "../../../common-utils/utils/trace.js";
import { extractAdapterCallTraces } from "../../../preview/trace/index.js";
import { ChainContractsRegister } from "../../../sdk/index.js";
import { ConvexV1BaseRewardPoolAdapterContract } from "./ConvexV1BaseRewardPoolAdapterContract.js";

const FIXTURES_DIR = path.resolve(
  __dirname,
  "../../../history/__fixtures__/inputs",
);

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const client = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: () => {
      throw new Error("not implemented");
    },
  }),
});

function makeAdapter(): ConvexV1BaseRewardPoolAdapterContract {
  const register = new ChainContractsRegister(client);
  register.resetContracts();
  return new ConvexV1BaseRewardPoolAdapterContract(
    { register },
    { baseParams: { version: 310n, contractType: "0x", addr: addr("0xA1") } },
  );
}

/** Loads the first adapter-level call trace from the Convex stake fixture. */
function loadConvexAdapterTrace(): CallTrace {
  const fixture = JSON.parse(
    readFileSync(
      path.join(
        FIXTURES_DIR,
        "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
      ),
      "utf-8",
    ),
  );
  const [facadeTrace] = collectTraces(fixture.trace, fixture.creditFacade);
  // First adapter call in this tx is the Convex stake (target 0x5a71e7...).
  return extractAdapterCallTraces(facadeTrace)[0];
}

/**
 * Builds a minimal adapter-level trace forwarding `calldata` to `target`
 * through `execute(bytes)`, mirroring the real adapter -> CM -> CA -> target
 * shape but with a calldata the protocol ABI cannot decode.
 */
function makeUndecodableTrace(target: Address, calldata: Hex): CallTrace {
  const executeInput = `${EXECUTE_BYTES_SELECTOR}${encodeAbiParameters(
    [{ type: "bytes" }],
    [calldata],
  ).slice(2)}` as Hex;
  return {
    from: addr("0xFA"),
    to: addr("0xA1"),
    input: "0x00000000",
    output: "0x",
    value: "0x0",
    type: "CALL",
    calls: [
      {
        from: addr("0xA1"),
        to: addr("0xC1"),
        input: executeInput,
        output: "0x",
        value: "0x0",
        type: "CALL",
        calls: [
          {
            from: addr("0xCA"),
            to: target,
            input: calldata,
            output: "0x",
            value: "0x0",
            type: "CALL",
          },
        ],
      },
    ],
  };
}

describe("ConvexV1BaseRewardPoolAdapterContract.parseProtocolCall", () => {
  it("resolves target contract and decodes the protocol call from a real trace", () => {
    const adapter = makeAdapter();
    const trace = loadConvexAdapterTrace();

    expect(adapter.parseProtocolCall(trace)).toEqual({
      contract: getAddress("0x5a71e7e04f8725fd42a216949e7099ebd08a42e3"),
      functionName: "stake(uint256)",
      functionArgs: { _amount: 269272994973813956812599n },
    });
  });

  it("returns undefined for undecodable calldata in non-strict mode", () => {
    const adapter = makeAdapter();
    const trace = makeUndecodableTrace(addr("0xDD"), "0xdeadbeef");

    expect(adapter.parseProtocolCall(trace)).toBeUndefined();
  });

  it("throws for undecodable calldata in strict mode", () => {
    const adapter = makeAdapter();
    const trace = makeUndecodableTrace(addr("0xDD"), "0xdeadbeef");

    expect(() => adapter.parseProtocolCall(trace, true)).toThrow();
  });
});
