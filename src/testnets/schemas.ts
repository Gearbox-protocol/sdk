import { z } from "zod/v4";
import { NetworkType } from "../onchain/chain/chains.js";
import { ZodAddress } from "../onchain/utils/zod.js";

/**
 * Go marshals a nil slice as `null`; this reads it as an empty array.
 **/
function nullableArray<T extends z.ZodType>(item: T) {
  return z
    .array(item)
    .nullable()
    .transform(value => value ?? []);
}

/**
 * Go marshals a nil map as `null`; this reads it as an empty record.
 **/
function nullableRecord<T extends z.ZodType>(value: T) {
  return z
    .record(z.string(), value)
    .nullable()
    .transform(record => record ?? {});
}

const timestamp = z.iso.datetime({ offset: true });

/**
 * {@link TestnetStageStatus}
 **/
export const testnetStageStatusSchema = z.enum([
  "queued",
  "started",
  "error",
  "failed",
  "success",
  "terminated",
]);

/**
 * {@link TestnetBackendState}
 **/
export const testnetBackendStateSchema = z.enum([
  "provisioning",
  "starting",
  "active",
  "error",
]);

/**
 * {@link Testnet}
 **/
export const testnetSchema = z.object({
  alias: z.string(),
  executionId: z.string(),
  isActive: z.boolean(),
  description: z.string(),
  persistent: z.boolean(),
  paused: z.boolean(),
  network: NetworkType,
  createdAt: timestamp,
});

/**
 * {@link TestnetBackendOptions}
 **/
export const testnetBackendOptionsSchema = z.object({
  version: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  parentBranchId: z.string().optional(),
});

/**
 * {@link TestnetBackendStatus}
 **/
export const testnetBackendStatusSchema = z.object({
  state: testnetBackendStateSchema,
  error: z.string().optional(),
  version: z.string().optional(),
});

/**
 * {@link TestnetBlock}
 **/
export const testnetBlockSchema = z.object({
  number: z.number(),
  time: timestamp,
});

/**
 * {@link TestnetScriptBlock}
 **/
export const testnetScriptBlockSchema = testnetBlockSchema.extend({
  timeDrift: z.number(),
  originDrift: z.string(),
  automine: z.boolean(),
  mineInterval: z.number(),
});

/**
 * {@link TestnetScriptOptions}
 **/
export const testnetScriptOptionsSchema = z.object({
  id: z.string(),
  description: z.string(),
  npx: z.string().optional(),
  docker: z.string().optional(),
  args: nullableArray(z.string()),
  env: nullableRecord(z.string()),
  flags: nullableArray(z.string()),
  timeout: z.string(),
  packageManager: z.string().optional(),
  input: z.unknown().optional(),
});

/**
 * {@link TestnetScript}
 **/
export const testnetScriptSchema = z.object({
  script: testnetScriptOptionsSchema,
  duration: z.string(),
  blockBefore: testnetScriptBlockSchema.optional(),
  blockAfter: testnetScriptBlockSchema.optional(),
  status: testnetStageStatusSchema,
  error: z.string().optional(),
  exitCode: z.number(),
  source: z.string().optional(),
  revision: z.string().optional(),
});

/**
 * {@link TestnetTaskDefinition}
 **/
export const testnetTaskDefinitionSchema = z.object({
  id: z.string().optional(),
  family: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
  version: z.string().optional(),
  entrypoint: z.array(z.string()).optional(),
  command: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  secrets: z.record(z.string(), z.string()).optional(),
  input: z.unknown().optional(),
  timeout: z.number().optional(),
  concurrent: z.boolean(),
  multicontainer: z.boolean(),
  schemaVersion: z.number().optional(),
});

/**
 * {@link TestnetTaskProgress}
 **/
export const testnetTaskProgressSchema = z.object({
  completed: z.number(),
  total: z.number(),
  details: z.unknown().optional(),
});

/**
 * {@link TestnetTask}
 **/
export const testnetTaskSchema = z.object({
  id: z.string(),
  definitionId: z.string(),
  family: z.string(),
  executionId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
  source: z.string().optional(),
  revision: z.string().optional(),
  entrypoint: z.array(z.string()).optional(),
  command: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  secrets: z.record(z.string(), z.string()).optional(),
  input: z.unknown().optional(),
  multicontainer: z.boolean(),
  concurrent: z.boolean(),
  outputDir: z.string().optional(),
  status: testnetStageStatusSchema,
  error: z.string().optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  progress: testnetTaskProgressSchema,
});

/**
 * {@link TestnetOptions}
 **/
export const testnetOptionsSchema = z.object({
  description: z.string().optional(),
  chainId: z.number().optional(),
  network: NetworkType,
  cid: z.string().optional(),
  anvilFlags: z.array(z.string()).optional(),
  anvilImage: z.string().optional(),
  rpcProvider: z.string().optional(),
  addressProvider: ZodAddress().optional(),
  marketConfigurators: z.array(ZodAddress()).optional(),
  rwaFactories: z.array(ZodAddress()).optional(),
  blockNumber: z.string(),
  owner: z.string(),
  timeout: z.string(),
  synctronLogLevel: z.string().optional(),
  scripts: nullableArray(testnetScriptOptionsSchema),
  disableSync: z.boolean(),
  disableIntervalMining: z.boolean(),
  disableRPCProtection: z.boolean(),
  debug: z.boolean().optional(),
  webhooks: nullableArray(z.string()),
  backend: testnetBackendOptionsSchema.optional(),
  tasks: z.array(testnetTaskDefinitionSchema).optional(),
});

/**
 * {@link TestnetStatus}
 **/
export const testnetStatusSchema = z.object({
  alias: z.string().optional(),
  network: NetworkType,
  nextRestart: timestamp.optional(),
  isActive: z.boolean(),
  ready: z.boolean(),
  paused: z.boolean(),
  rpcUrl: z.string().optional(),
  url: z.string(),
  logsUrl: z.string(),
  persistent: z.boolean(),
  latestBlock: testnetScriptBlockSchema.optional(),
  tasks: z.array(testnetTaskSchema).optional(),
  backend: testnetBackendStatusSchema.optional(),
  executionId: z.string(),
  options: testnetOptionsSchema,
  forkBlock: testnetBlockSchema,
  syncBlock: z.number(),
  syncError: z.string().optional(),
  originChainId: z.number(),
  anvilChainId: z.number(),
  createdAt: timestamp,
  addressProvider: ZodAddress(),
  marketConfigurators: z.array(ZodAddress()).optional(),
  rwaFactories: z.array(ZodAddress()).optional(),
  onchainExecutionId: ZodAddress(),
  scripts: z.array(testnetScriptSchema).optional(),
  cid: z.string().optional(),
  files: z.array(z.string()).optional(),
});
