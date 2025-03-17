import type { IGearboxSDKPluginConstructor } from "./types.js";
import { V300StalenessPeriodPlugin } from "./V300StalenessPeriodPlugin.js";

export const defaultPlugins: Record<string, IGearboxSDKPluginConstructor> = {
  stalenessV300: V300StalenessPeriodPlugin,
};
