import type { IGearboxSDKPlugin, IPluginState } from "./types.js";

export class PluginStateVersionError<
  TState extends IPluginState,
> extends Error {
  constructor(plugin: IGearboxSDKPlugin<TState>, state: TState) {
    super(
      `plugin ${plugin.constructor.name} state version mismatch: expected ${plugin.version}, got ${state.version}`,
    );
  }
}
