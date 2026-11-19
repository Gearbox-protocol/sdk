import { describe, expect, it } from "vitest";
import {
  CONFIGURATOR,
  createStubClient,
  LATEST_BLOCK,
  SOURCE_BLOCK,
} from "../testing/sdkHarness.js";
import { CuratorSession } from "./CuratorSession.js";

/** A stub chain recording the block reads a session makes. **/
function chain() {
  const reads: string[] = [];
  const base = createStubClient();
  const client = createStubClient({
    client: {
      getBlockNumber: async () => {
        reads.push("blockNumber");
        return base.getBlockNumber();
      },
      getBlock: async (args?: { blockNumber?: bigint; blockTag?: string }) => {
        reads.push(args?.blockTag ?? `block ${args?.blockNumber}`);
        return base.getBlock(
          args?.blockNumber !== undefined
            ? { blockNumber: args.blockNumber }
            : {},
        );
      },
    },
  });
  return { client, reads };
}

describe("source block", () => {
  it("pins the head with a single block read", async () => {
    const { client, reads } = chain();
    const session = await CuratorSession.create({
      client,
      marketConfigurator: CONFIGURATOR,
    });
    expect(reads).toEqual(["latest"]);
    expect(session.source.blockNumber).toBe(LATEST_BLOCK);
  });

  it("pins a given block with a single block read", async () => {
    const { client, reads } = chain();
    const session = await CuratorSession.create({
      client,
      marketConfigurator: CONFIGURATOR,
      blockNumber: SOURCE_BLOCK,
    });
    expect(reads).toEqual([`block ${SOURCE_BLOCK}`]);
    expect(session.source.blockNumber).toBe(SOURCE_BLOCK);
  });
});
