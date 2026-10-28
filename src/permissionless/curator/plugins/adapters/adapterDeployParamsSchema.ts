import { z } from "zod/v4";
import {
  type AdapterDeployParams,
  builtinAdapterPlugins,
} from "./builtinAdapterPlugins.js";
import type {
  AdapterDeployParamsBase,
  AdapterPluginDefinition,
} from "./defineAdapterPlugin.js";

/**
 * Deploy params schema of every adapter in `plugins`: the params' `type` picks
 * the plugin, whose own `deployParamsSchema` validates and normalizes them.
 **/
export function adapterDeployParamsSchemaOf(
  plugins: Iterable<AdapterPluginDefinition>,
): z.ZodType<AdapterDeployParamsBase> {
  const byType = new Map<string, AdapterPluginDefinition>();
  for (const plugin of plugins) byType.set(plugin.type, plugin);

  return z.unknown().transform((value, ctx) => {
    const type =
      value !== null && typeof value === "object"
        ? (value as { type?: unknown }).type
        : undefined;
    const plugin = typeof type === "string" ? byType.get(type) : undefined;
    if (!plugin) {
      ctx.addIssue({
        code: "custom",
        message: `Unknown adapter type ${JSON.stringify(type)}`,
        path: ["type"],
      });
      return z.NEVER;
    }
    const result = plugin.deployParamsSchema.safeParse(value);
    if (!result.success) {
      for (const failure of result.error.issues) {
        ctx.addIssue({
          code: "custom",
          message: failure.message,
          path: failure.path,
        });
      }
      return z.NEVER;
    }
    return result.data;
  }) as unknown as z.ZodType<AdapterDeployParamsBase>;
}

/** Deploy params schema of the built-in adapters. **/
export const adapterDeployParamsSchema = adapterDeployParamsSchemaOf(
  builtinAdapterPlugins,
) as unknown as z.ZodType<AdapterDeployParams>;
