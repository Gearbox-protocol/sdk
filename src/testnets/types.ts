import type { Address } from "viem";
import type { NetworkType } from "../onchain/chain/chains.js";

/**
 * Status of a script or task run.
 *
 * Mirrors Go `core.StageStatus` (anvil-manager `backend/manager/core/stages.go`).
 * `error` is a failure of the executor, `failed` a failure inside the stage,
 * `terminated` a stage killed by the task executor or one that died with it.
 **/
export type TestnetStageStatus =
  | "queued"
  | "started"
  | "error"
  | "failed"
  | "success"
  | "terminated";

/**
 * State of a testnet's backend sidecar.
 *
 * Mirrors the Go `backendState*` constants (anvil-manager
 * `backend/manager/backend.go`).
 **/
export type TestnetBackendState =
  | "provisioning"
  | "starting"
  | "active"
  | "error";

/**
 * Deployment lifecycle of a testnet:
 *
 * - `queued`: the testnet was accepted, but deployment has not started. Don't
 *   use it yet.
 * - `deploying`: deploy scripts are running and, if requested, the backend is
 *   starting. The RPC answers but the chain is incomplete.
 * - `deployed`: deployment finished. Every deploy script succeeded, or failed
 *   with ignore-errors set. Script outputs can be read and tasks started.
 *   Whether a frontend can use the RPC also depends on
 *   {@link TestnetStatus.sync} and {@link TestnetStatus.backend}.
 * - `failed`: deployment stopped with the error in
 *   {@link TestnetStatus.error}. Final. The testnet keeps running until it is
 *   killed or expires, so its logs and artifacts can be inspected. It stays
 *   `failed` after it stops.
 * - `terminated`: no longer running, because it was killed, expired, or lost
 *   in an anvil-manager restart. Final. Artifacts stay readable.
 *
 * Mirrors Go `core.PipelineState` (anvil-manager
 * `backend/manager/core/pipeline.go`).
 **/
export type TestnetPipelineState =
  | "queued"
  | "deploying"
  | "deployed"
  | "failed"
  | "terminated";

/**
 * State of price feed sync with the origin chain:
 *
 * - `disabled`: sync was turned off at creation, so prices stay at the fork
 *   block.
 * - `pending`: no sync attempt has finished yet.
 * - `ok`: the latest attempt succeeded and prices follow the origin chain.
 * - `failing`: the latest attempt failed (see {@link TestnetSyncStatus.error})
 *   and is retried on schedule. Prices go stale meanwhile, and frontends may
 *   see reverts.
 *
 * Mirrors Go `core.SyncState` (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export type TestnetSyncState = "disabled" | "pending" | "ok" | "failing";

/**
 * A testnet as the list endpoint returns it.
 *
 * Mirrors Go `core.ListedFork` (anvil-manager `backend/manager/core/responses.go`).
 **/
export interface Testnet {
  /**
   * Alias of a persistent testnet, empty string for a non-persistent one.
   **/
  alias: string;
  /**
   * Execution id, empty string for a persistent testnet that has no running
   * execution (paused or dead).
   **/
  executionId: string;
  isActive: boolean;
  description: string;
  persistent: boolean;
  paused: boolean;
  network: NetworkType;
  /**
   * ISO timestamp. Go's zero time (`0001-01-01T00:00:00Z`) for a persistent
   * testnet that has no running execution.
   **/
  createdAt: string;
}

/**
 * Optional backend sidecar of a testnet, which provisions a temporary Neon
 * database and exposes its API via proxy.
 *
 * Mirrors Go `core.BackendOptions` (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export interface TestnetBackendOptions {
  /**
   * Backend image version/tag override.
   **/
  version?: string;
  /**
   * Extra env passed to the backend container, interpolated like
   * {@link TestnetScriptOptions.env}.
   **/
  env?: Record<string, string>;
  /**
   * Neon branch id or name to use as parent for the provisioned database
   * branch, falls back to the server's default branch.
   **/
  parentBranchId?: string;
}

/**
 * Runtime state of a testnet's backend sidecar.
 *
 * Mirrors Go `core.BackendStatus` (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export interface TestnetBackendStatus {
  state: TestnetBackendState;
  error?: string;
  /**
   * OCI image version label of the image the sidecar was started from. Absent
   * when the label is missing or the image could not be obtained.
   **/
  version?: string;
}

/**
 * Runtime state of a running testnet's price feed sync.
 *
 * Mirrors Go `core.SyncStatus` (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export interface TestnetSyncStatus {
  state: TestnetSyncState;
  /**
   * Error of the latest attempt, set when `state` is `failing`.
   **/
  error?: string;
  /**
   * ISO timestamp of when the latest successful attempt finished.
   **/
  lastSyncedAt?: string;
}

/**
 * A block of a testnet.
 *
 * Mirrors Go `core.ForkBlock` (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export interface TestnetBlock {
  number: number;
  /**
   * ISO timestamp of the block.
   **/
  time: string;
}

/**
 * Snapshot of a testnet block, taken around scripts and for the latest block.
 *
 * Mirrors Go `core.ScriptBlock` (anvil-manager `backend/manager/core/scripts.go`).
 **/
export interface TestnetScriptBlock extends TestnetBlock {
  /**
   * Time delta in seconds from block timestamp to realtime. Positive means
   * that the fork ran into the future, which can break price updates.
   **/
  timeDrift: number;
  /**
   * Delta from the block with the same number on the origin RPC, or `"ahead"`
   * when the fork is ahead of it.
   **/
  originDrift: string;
  automine: boolean;
  mineInterval: number;
}

/**
 * A script to run on a testnet, as {@link CreateTestnetRequest.scripts} sends
 * it.
 *
 * Mirrors Go `core.ScriptOpts` (anvil-manager `backend/manager/core/scripts.go`)
 * on input. The backend defaults `timeout` to 10 minutes, and `npx` to
 * `@gearbox-protocol/deploy-v3` when neither `npx` nor `docker` is set.
 **/
export interface TestnetScriptRequest {
  /**
   * Script id, must be unique for the testnet and match `^[a-zA-Z0-9_]+$`.
   **/
  id: string;
  /**
   * Script description for meatbags.
   **/
  description?: string;
  /**
   * NPM package to execute using npx.
   **/
  npx?: string;
  /**
   * Docker image to execute as script.
   **/
  docker?: string;
  /**
   * Args to pass to script. Supports interpolation. If package.json has a
   * named binary, the first arg should be the command name, otherwise the
   * package name part without scope.
   **/
  args?: string[];
  /**
   * Configurable env to pass to script. Supports interpolation.
   **/
  env?: Record<string, string>;
  /**
   * Flags to pass to script executor.
   **/
  flags?: string[];
  /**
   * Script execution timeout as a Go duration string, e.g. `"10m0s"`.
   **/
  timeout?: string;
  /**
   * Package manager to install npm dependencies.
   **/
  packageManager?: string;
  /**
   * JSON content that will be serialized as input.json file and made
   * available to script.
   **/
  input?: unknown;
}

/**
 * A script of a testnet, as the backend returns it.
 *
 * Mirrors Go `core.ScriptOpts` (anvil-manager `backend/manager/core/scripts.go`)
 * on output. Go sends nil `args`, `env` and `flags` as `null`; they are
 * normalised to `[]` and `{}`.
 **/
export interface TestnetScriptOptions extends TestnetScriptRequest {
  description: string;
  args: string[];
  env: Record<string, string>;
  flags: string[];
  timeout: string;
}

/**
 * A script that a testnet ran.
 *
 * Mirrors Go `core.ExecutedScript` (anvil-manager `backend/manager/core/scripts.go`).
 **/
export interface TestnetScript {
  /**
   * Script options.
   **/
  script: TestnetScriptOptions;
  /**
   * Duration of the script execution, as a Go duration string.
   **/
  duration: string;
  /**
   * Block snapshot taken before the script ran.
   **/
  blockBefore?: TestnetScriptBlock;
  /**
   * Block snapshot taken after the script ran.
   **/
  blockAfter?: TestnetScriptBlock;
  /**
   * Status of the script execution.
   **/
  status: TestnetStageStatus;
  /**
   * Script error when `status` is `failed`, executor error when it is `error`.
   **/
  error?: string;
  /**
   * `-1` if the script didn't even start.
   **/
  exitCode: number;
  /**
   * Source repo of the docker image, from the
   * `org.opencontainers.image.source` label.
   **/
  source?: string;
  /**
   * Commit in the source repo, from the `org.opencontainers.image.revision`
   * label.
   **/
  revision?: string;
}

/**
 * A task to run on a testnet, as {@link CreateTestnetRequest.tasks} sends it.
 *
 * Mirrors Go `core.TaskDefinition` (anvil-manager
 * `backend/manager/core/task_definition.go`) on input.
 **/
export interface TestnetTaskDefinitionRequest {
  /**
   * Unique task definition id, do not confuse with task id. Can be empty for
   * ad-hoc task definitions.
   **/
  id?: string;
  /**
   * Identifies a group of tasks that are displayed the same way but configured
   * slightly differently, e.g. beta and production configurations of
   * optimist. Used by the frontend to choose the result renderer.
   **/
  family?: string;
  /**
   * Task name for humans, used as tab name in UI.
   **/
  name?: string;
  /**
   * Task description for humans.
   **/
  description?: string;
  /**
   * Docker image name in the `@gearbox-protocol` org, e.g. `deploy-v3`.
   **/
  image: string;
  /**
   * Docker image version, can be prefixed with `ssm://` to get the version
   * from AWS SSM, otherwise defaults to latest.
   **/
  version?: string;
  /**
   * Docker entrypoint.
   **/
  entrypoint?: string[];
  /**
   * Docker command.
   **/
  command?: string[];
  /**
   * Environment variables to pass to container.
   **/
  env?: Record<string, string>;
  /**
   * Secrets to load from AWS Secrets Manager and pass as env variables to the
   * container: env variable name to `(!)AWS_SECRET_NAME.(optional json
   * field)`, where `!` means that the secret should be refetched.
   **/
  secrets?: Record<string, string>;
  /**
   * Will be saved as file and mounted to container.
   **/
  input?: unknown;
  /**
   * Timeout for the task in minutes.
   **/
  timeout?: number;
  /**
   * If true, task can be started concurrently with other tasks.
   **/
  concurrent?: boolean;
  /**
   * Task can start other containers.
   **/
  multicontainer?: boolean;
  /**
   * Schema version, to facilitate breaking changes in schema.
   **/
  schemaVersion?: number;
}

/**
 * A task definition of a testnet, as the backend returns it.
 *
 * Mirrors Go `core.TaskDefinition` (anvil-manager
 * `backend/manager/core/task_definition.go`) on output.
 **/
export interface TestnetTaskDefinition extends TestnetTaskDefinitionRequest {
  concurrent: boolean;
  multicontainer: boolean;
}

/**
 * Progress of a testnet task.
 *
 * Mirrors Go `core.TaskProgress` (anvil-manager `backend/manager/core/task.go`).
 **/
export interface TestnetTaskProgress {
  completed: number;
  total: number;
  /**
   * Additional details about task progress. Depending on task definition
   * family, this can have a special renderer.
   **/
  details?: unknown;
}

/**
 * A task run on a testnet.
 *
 * Mirrors Go `core.Task` and the embedded `core.TaskExecutionData`
 * (anvil-manager `backend/manager/core/task.go`).
 **/
export interface TestnetTask {
  /**
   * Unique task id, do not confuse with task definition id.
   **/
  id: string;
  definitionId: string;
  family: string;
  /**
   * Execution id of the testnet the task runs on.
   **/
  executionId: string;
  /**
   * Task name for humans, used as tab name in UI.
   **/
  name?: string;
  /**
   * Task description for humans.
   **/
  description?: string;
  /**
   * Full docker image, can include docker registry (e.g. ghcr.io).
   **/
  image: string;
  /**
   * Source repo of the docker image, from the
   * `org.opencontainers.image.source` label.
   **/
  source?: string;
  /**
   * Commit in the source repo, from the `org.opencontainers.image.revision`
   * label.
   **/
  revision?: string;
  /**
   * Docker entrypoint.
   **/
  entrypoint?: string[];
  /**
   * Docker command.
   **/
  command?: string[];
  /**
   * Environment variables to pass to container.
   **/
  env?: Record<string, string>;
  /**
   * Secrets passed to container as env variables, censored.
   **/
  secrets?: Record<string, string>;
  /**
   * Will be saved as file and mounted to container.
   **/
  input?: unknown;
  /**
   * Task can start other containers.
   **/
  multicontainer: boolean;
  /**
   * If true, task can be started concurrently with other tasks.
   **/
  concurrent: boolean;
  /**
   * Output dir of the task inside the execution dir.
   **/
  outputDir?: string;
  status: TestnetStageStatus;
  /**
   * Error in case the task manager failed to start the task.
   **/
  error?: string;
  /**
   * ISO timestamp.
   **/
  createdAt: string;
  /**
   * ISO timestamp.
   **/
  updatedAt: string;
  progress: TestnetTaskProgress;
}

/**
 * Options a testnet was created with, as the backend returns them.
 *
 * Mirrors Go `core.PipelineOptions` (anvil-manager
 * `backend/manager/core/pipeline.go`) on output. Go sends nil `scripts` and
 * `webhooks` as `null`; they are normalised to `[]`.
 **/
export interface TestnetOptions {
  /**
   * Description for meatbags.
   **/
  description?: string;
  /**
   * Override chain ID that the anvil fork uses.
   **/
  chainId?: number;
  /**
   * Network whose default providers are used.
   **/
  network: NetworkType;
  /**
   * CID of the fork input (for permissionless forks).
   **/
  cid?: string;
  /**
   * Extra flags to pass to anvil.
   **/
  anvilFlags?: string[];
  /**
   * Override anvil image, can be a foundry image tag or a full image name.
   **/
  anvilImage?: string;
  /**
   * RPC provider override for the fork.
   **/
  rpcProvider?: string;
  /**
   * Gearbox address provider, defaults to the v3.1 address provider (same on
   * all chains).
   **/
  addressProvider?: Address;
  /**
   * Override market configurators.
   **/
  marketConfigurators?: Address[];
  /**
   * Override RWA factories.
   **/
  rwaFactories?: Address[];
  /**
   * Block to start the fork from, an expression that follows the rules of the
   * backend's `BlockByExpression`. Empty string for the latest block.
   **/
  blockNumber: string;
  /**
   * User who owns this testnet.
   **/
  owner: string;
  /**
   * Testnet TTL as a Go duration string, e.g. `"1h"`.
   **/
  timeout: string;
  /**
   * Log level for synctron.
   **/
  synctronLogLevel?: string;
  /**
   * Deploy scripts run before the testnet is ready.
   **/
  scripts: TestnetScriptOptions[];
  /**
   * If set, price feeds aren't synced and update epoch isn't called.
   **/
  disableSync: boolean;
  /**
   * If set, interval mining isn't enabled at the end of the deploy scripts.
   **/
  disableIntervalMining: boolean;
  /**
   * Allows to use `anvil_` RPC methods remotely.
   **/
  disableRPCProtection: boolean;
  /**
   * Run in debug mode: retain containers, verbose anvil logs, dump logs on
   * failure.
   **/
  debug?: boolean;
  /**
   * Webhook URLs called when the testnet starts.
   **/
  webhooks: string[];
  /**
   * Backend sidecar of the testnet, if one was requested.
   **/
  backend?: TestnetBackendOptions;
  /**
   * Tasks to run.
   **/
  tasks?: TestnetTaskDefinition[];
}

/**
 * Body of a testnet creation request.
 *
 * Mirrors Go `core.PipelineOptions` (anvil-manager
 * `backend/manager/core/pipeline.go`) on input. The backend fills defaults for
 * omitted fields: `network: "Mainnet"`, `timeout: "1h"`. There is no `alias`:
 * creating with one pins the testnet as persistent, which this client does not
 * manage.
 **/
export interface CreateTestnetRequest {
  /**
   * Description for meatbags.
   **/
  description?: string;
  /**
   * Override chain ID that the anvil fork will use.
   **/
  chainId?: number;
  /**
   * Network whose default providers will be used.
   *
   * @defaultValue `"Mainnet"`
   **/
  network?: NetworkType;
  /**
   * CID of the fork input (for permissionless forks).
   **/
  cid?: string;
  /**
   * Extra flags to pass to anvil.
   **/
  anvilFlags?: string[];
  /**
   * Override anvil image, can be a foundry image tag or a full image name.
   **/
  anvilImage?: string;
  /**
   * RPC provider override for the fork.
   **/
  rpcProvider?: string;
  /**
   * Gearbox address provider, defaults to the v3.1 address provider (same on
   * all chains).
   **/
  addressProvider?: Address;
  /**
   * Override market configurators.
   **/
  marketConfigurators?: Address[];
  /**
   * Override RWA factories.
   **/
  rwaFactories?: Address[];
  /**
   * Block to start the fork from, an expression that follows the rules of the
   * backend's `BlockByExpression`.
   **/
  blockNumber?: string;
  /**
   * User who owns this testnet.
   **/
  owner?: string;
  /**
   * Testnet TTL as a Go duration string.
   *
   * @defaultValue `"1h"`
   **/
  timeout?: string;
  /**
   * Log level for synctron.
   **/
  synctronLogLevel?: string;
  /**
   * Deploy scripts to run before the testnet is ready.
   **/
  scripts?: TestnetScriptRequest[];
  /**
   * If set, price feeds won't be synced and update epoch won't be called.
   **/
  disableSync?: boolean;
  /**
   * If set, interval mining isn't enabled at the end of the deploy scripts.
   **/
  disableIntervalMining?: boolean;
  /**
   * Allows to use `anvil_` RPC methods remotely.
   **/
  disableRPCProtection?: boolean;
  /**
   * Run in debug mode: retain containers, verbose anvil logs, dump logs on
   * failure.
   **/
  debug?: boolean;
  /**
   * Webhook URLs to call when the testnet starts.
   **/
  webhooks?: string[];
  /**
   * If set, run a backend sidecar for this testnet.
   **/
  backend?: TestnetBackendOptions;
  /**
   * Tasks to run.
   **/
  tasks?: TestnetTaskDefinitionRequest[];
}

/**
 * Files uploaded with a testnet creation request, saved in the testnet's
 * shared dir: file name to contents.
 **/
export type TestnetFiles = Record<string, string | Uint8Array | Blob>;

/**
 * Stored and runtime state of a testnet.
 *
 * Mirrors Go `core.PipelineStatus` and the embedded `core.PipelineData`
 * (anvil-manager `backend/manager/core/pipeline.go`).
 **/
export interface TestnetStatus {
  /**
   * Alias of a persistent testnet, absent for a non-persistent one.
   **/
  alias?: string;
  network: NetworkType;
  /**
   * ISO timestamp of the next restart of a persistent testnet.
   **/
  nextRestart?: string;
  isActive: boolean;
  paused: boolean;
  /**
   * JSON-RPC URL of the testnet, absent when it is not running.
   **/
  rpcUrl?: string;
  /**
   * Page of the testnet in the anvil-manager web app.
   **/
  url: string;
  logsUrl: string;
  persistent: boolean;
  latestBlock?: TestnetScriptBlock;
  tasks?: TestnetTask[];
  backend?: TestnetBackendStatus;
  /**
   * Price feed sync, present only while the testnet is running.
   **/
  sync?: TestnetSyncStatus;
  /**
   * Unique identifier of the execution.
   **/
  executionId: string;
  /**
   * Deployment lifecycle state. See {@link isTestnetReady} for whether the
   * testnet can be used.
   **/
  state: TestnetPipelineState;
  /**
   * Why deployment failed, set when `state` is `failed`.
   **/
  error?: string;
  /**
   * Options the testnet was created with.
   **/
  options: TestnetOptions;
  /**
   * Block the testnet was forked at.
   **/
  forkBlock: TestnetBlock;
  /**
   * Chain ID of the origin network.
   **/
  originChainId: number;
  /**
   * Chain ID of the anvil fork.
   **/
  anvilChainId: number;
  /**
   * ISO timestamp of when the testnet was created.
   **/
  createdAt: string;
  /**
   * Gearbox address provider.
   **/
  addressProvider: Address;
  /**
   * Market configurators.
   **/
  marketConfigurators?: Address[];
  /**
   * RWA factories.
   **/
  rwaFactories?: Address[];
  /**
   * Address of the contract that holds the execution id onchain.
   **/
  onchainExecutionId: Address;
  /**
   * Scripts and their execution info.
   **/
  scripts?: TestnetScript[];
  /**
   * IPFS CID of the fork input.
   **/
  cid?: string;
  /**
   * Files uploaded during testnet creation.
   **/
  files?: string[];
}
