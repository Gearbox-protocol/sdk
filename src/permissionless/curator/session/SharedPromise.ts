/**
 * A lazily started promise shared by every caller.
 *
 * Concurrent and later callers get the same promise, so the work happens once.
 * A rejection is not kept: a transient RPC failure must not poison an SDK
 * instance forever, so the next call starts the task again.
 **/
export class SharedPromise<T> {
  #pending?: Promise<T>;

  /** The in-flight or settled promise, without starting anything. **/
  get current(): Promise<T> | undefined {
    return this.#pending;
  }

  /** Returns the shared promise, starting `task` when there is none. **/
  run(task: () => Promise<T>): Promise<T> {
    if (!this.#pending) {
      const pending: Promise<T> = task().catch((error: unknown) => {
        // Only evict our own promise in case a later retry has already won.
        if (this.#pending === pending) this.#pending = undefined;
        throw error;
      });
      this.#pending = pending;
    }
    return this.#pending;
  }
}
