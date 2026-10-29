import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import type {
  testnetBackendOptionsSchema,
  testnetBackendStateSchema,
  testnetBackendStatusSchema,
  testnetBlockSchema,
  testnetOptionsSchema,
  testnetPipelineStateSchema,
  testnetSchema,
  testnetScriptBlockSchema,
  testnetScriptOptionsSchema,
  testnetScriptSchema,
  testnetStageStatusSchema,
  testnetStatusSchema,
  testnetSyncStateSchema,
  testnetSyncStatusSchema,
  testnetTaskDefinitionSchema,
  testnetTaskProgressSchema,
  testnetTaskSchema,
} from "./schemas.js";
import type {
  Testnet,
  TestnetBackendOptions,
  TestnetBackendState,
  TestnetBackendStatus,
  TestnetBlock,
  TestnetOptions,
  TestnetPipelineState,
  TestnetScript,
  TestnetScriptBlock,
  TestnetScriptOptions,
  TestnetStageStatus,
  TestnetStatus,
  TestnetSyncState,
  TestnetSyncStatus,
  TestnetTask,
  TestnetTaskDefinition,
  TestnetTaskProgress,
} from "./types.js";

describe("testnet schemas match testnet types", () => {
  it("enums", () => {
    expectTypeOf<
      z.output<typeof testnetStageStatusSchema>
    >().toEqualTypeOf<TestnetStageStatus>();
    expectTypeOf<
      z.output<typeof testnetBackendStateSchema>
    >().toEqualTypeOf<TestnetBackendState>();
    expectTypeOf<
      z.output<typeof testnetPipelineStateSchema>
    >().toEqualTypeOf<TestnetPipelineState>();
    expectTypeOf<
      z.output<typeof testnetSyncStateSchema>
    >().toEqualTypeOf<TestnetSyncState>();
  });

  it("list", () => {
    expectTypeOf<z.output<typeof testnetSchema>>().toEqualTypeOf<Testnet>();
  });

  it("status", () => {
    expectTypeOf<
      z.output<typeof testnetStatusSchema>
    >().toEqualTypeOf<TestnetStatus>();
    expectTypeOf<
      z.output<typeof testnetOptionsSchema>
    >().toEqualTypeOf<TestnetOptions>();
    expectTypeOf<
      z.output<typeof testnetBlockSchema>
    >().toEqualTypeOf<TestnetBlock>();
    expectTypeOf<
      z.output<typeof testnetScriptBlockSchema>
    >().toEqualTypeOf<TestnetScriptBlock>();
    expectTypeOf<
      z.output<typeof testnetBackendOptionsSchema>
    >().toEqualTypeOf<TestnetBackendOptions>();
    expectTypeOf<
      z.output<typeof testnetBackendStatusSchema>
    >().toEqualTypeOf<TestnetBackendStatus>();
    expectTypeOf<
      z.output<typeof testnetSyncStatusSchema>
    >().toEqualTypeOf<TestnetSyncStatus>();
  });

  it("scripts", () => {
    expectTypeOf<
      z.output<typeof testnetScriptOptionsSchema>
    >().toEqualTypeOf<TestnetScriptOptions>();
    expectTypeOf<
      z.output<typeof testnetScriptSchema>
    >().toEqualTypeOf<TestnetScript>();
  });

  it("tasks", () => {
    expectTypeOf<
      z.output<typeof testnetTaskDefinitionSchema>
    >().toEqualTypeOf<TestnetTaskDefinition>();
    expectTypeOf<
      z.output<typeof testnetTaskProgressSchema>
    >().toEqualTypeOf<TestnetTaskProgress>();
    expectTypeOf<
      z.output<typeof testnetTaskSchema>
    >().toEqualTypeOf<TestnetTask>();
  });
});
