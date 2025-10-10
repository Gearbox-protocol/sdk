export interface IHooks<HookMap extends Record<string, any[]>> {
  addHook: <K extends keyof HookMap>(
    hookName: K,
    fn: (...args: HookMap[K]) => void | Promise<void>,
  ) => void;
  removeHook: <K extends keyof HookMap>(
    hookName: K,
    fn: (...args: HookMap[K]) => void | Promise<void>,
  ) => void;
}

export class Hooks<HookMap extends Record<string, any[]>>
  implements IHooks<HookMap>
{
  #reg: {
    [K in keyof HookMap]: Array<(...args: HookMap[K]) => void | Promise<void>>;
  } = {} as any;

  public addHook<K extends keyof HookMap>(
    hookName: K,
    fn: (...args: HookMap[K]) => void | Promise<void>,
  ): void {
    if (!this.#reg[hookName]) {
      this.#reg[hookName] = [];
    }
    this.#reg[hookName].push(fn);
  }

  public removeHook<K extends keyof HookMap>(
    hookName: K,
    fn: (...args: HookMap[K]) => void | Promise<void>,
  ): void {
    if (!this.#reg[hookName]) {
      return;
    }
    this.#reg[hookName] =
      this.#reg[hookName]?.filter(hookFn => hookFn !== fn) ?? [];
  }

  public async triggerHooks<K extends keyof HookMap>(
    hookName: K,
    ...args: HookMap[K]
  ): Promise<void> {
    if (!this.#reg[hookName]) {
      return;
    }
    for (const fn of this.#reg[hookName]) {
      try {
        await fn(...args);
      } catch {}
    }
  }
}
