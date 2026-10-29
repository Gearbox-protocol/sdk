import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import type {
  testnetBackendOptionsSchema,
  testnetBackendStateSchema,
  testnetBackendStatusSchema,
  testnetBlockSchema,
  testnetOptionsSchema,
  testnetSchema,
  testnetScriptBlockSchema,
  testnetScriptOptionsSchema,
  testnetScriptSchema,
  testnetStageStatusSchema,
  testnetStatusSchema,
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
  TestnetScript,
  TestnetScriptBlock,
  TestnetScriptOptions,
  TestnetStageStatus,
  TestnetStatus,
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
