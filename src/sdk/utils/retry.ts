export interface RetryOptions {
  attempts?: number;
  interval?: number;
  exponent?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { attempts = 3, interval = 200, exponent = 1 } = options;
  let wait = interval;
  let cause: any;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn();
      return result;
    } catch (e) {
      cause = e;
      await new Promise(resolve => {
        setTimeout(resolve, wait);
      });
      wait = wait * exponent;
    }
  }
  throw new Error(`all attempts failed: ${cause}`);
}
