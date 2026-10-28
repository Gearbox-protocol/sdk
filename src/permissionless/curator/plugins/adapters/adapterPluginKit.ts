/**
 * Everything an adapter plugin is made of, for plugins defined outside the
 * package. Register one with `CuratorSession.create({ …, plugins: [myAdapter] })`.
 *
 * The functions are one object, so that generic names (`list`, `address`,
 * `addressSchema`…) stay out of the barrels this is exported from; the types
 * are exported by name.
 *
 * ```ts
 * const { defineAdapterPlugin, defineMarketAction, adapterBatch, schema } =
 *   adapterPluginKit;
 * const pools = schema.list(
 *   schema.object({ pool: schema.identity(schema.address), allowed: schema.boolean }),
 *   (item) => item.pool,
 *   schema.allowed,
 * );
 * ```
 *
 * The built-in plugins are written with the same pieces.
 **/
import { actionError, actionWarning } from "../../actions/actionDiagnostics.js";
import { creditManagerTargetSchema } from "../../actions/creditManagerTargets.js";
import { defineMarketAction } from "../../actions/defineMarketAction.js";
import { configureAdapter } from "../../actions/utils/configureCalls.js";
import { stateSchema } from "../../state/diff/stateSchema.js";
import { addressSchema, uintSchema } from "../../validationSchemas.js";
import {
  adapterActionKeys,
  adapterActionSchema,
  adapterBatch,
  adapterDiagnostics,
  lowerAddresses,
  updateActionAdapter,
} from "./adapterActionHelpers.js";
import {
  adapterDeployParams,
  deployState,
  getter,
  plainAdapter,
  plainDeployParamsSchema,
  readAddress,
  readAddresses,
  resolveTargetTokens,
  sdkState,
} from "./adapterPluginHelpers.js";
import {
  adapterStateSchema,
  allowed,
  enabled,
  lower,
  orderPair,
  pairFields,
  pairKey,
  plainAdapterStateSchema,
} from "./adapterStateSchema.js";
import { defineAdapterPlugin } from "./defineAdapterPlugin.js";

export const adapterPluginKit = {
  /** Declares a plugin; see {@link defineAdapterPlugin}. **/
  defineAdapterPlugin,
  /** Declares one of its actions; see {@link defineMarketAction}. **/
  defineMarketAction,

  // Actions
  adapterActionKeys,
  adapterActionSchema,
  adapterBatch,
  adapterDiagnostics,
  lowerAddresses,
  updateActionAdapter,
  configureAdapter,
  actionError,
  actionWarning,

  // Deployment and reads
  adapterDeployParams,
  deployState,
  sdkState,
  plainAdapter,
  plainDeployParamsSchema,
  getter,
  readAddress,
  readAddresses,
  resolveTargetTokens,

  // Params schemas
  addressSchema,
  uintSchema,
  creditManagerTargetSchema,

  /** State schema building blocks, plus the adapter-specific ones. **/
  schema: {
    ...stateSchema,
    adapterStateSchema,
    plainAdapterStateSchema,
    allowed,
    enabled,
    lower,
    orderPair,
    pairFields,
    pairKey,
  },
} as const;
