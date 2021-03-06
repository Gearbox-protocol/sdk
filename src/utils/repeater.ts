import { MetamaskError } from "../core/errors";

export async function callRepeater<T>(
  call: () => Promise<T>,
  step: number = 0
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      resolve(await call());
    } catch (e) {
      console.error(`Error ${step}: ${e}`);
      if (step > 5 || (e as MetamaskError).code !== -32000) reject(e);
      else {
        setTimeout(() => resolve(callRepeater(call, step + 1)), 200);
      }
    }
  });
}
