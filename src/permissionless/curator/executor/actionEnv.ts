import type { ActionEnv } from "../actions/actionTypes.js";
import { GipRegistry } from "../GipRegistry.js";
import type { ResolveCache } from "./ResolveCache.js";

export interface ExecutorOptions {
  /** Skip preflight only when inspecting historical calls; session builders always check. */
  checkActions?: boolean;
  /**
   * Unix time (seconds) the state model derives time-dependent fields at.
   * Defaults to the wall clock; the SDK passes its source block's timestamp.
   **/
  timestamp?: number;
  /**
   * Memoized `resolve` results to share between executions, e.g. all
   * compilations of one SDK instance. Defaults to one per executor.
   **/
  resolveCache?: ResolveCache;
  /** Action definitions and adapter plugins; the built-in ones by default. **/
  registry?: GipRegistry;
}

/** The env a state transition sees. **/
export function actionEnv(options: ExecutorOptions = {}): ActionEnv {
  return {
    timestamp: options.timestamp ?? Math.floor(Date.now() / 1000),
    registry: options.registry ?? GipRegistry.builtin,
  };
}
