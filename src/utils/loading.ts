export function loadingProgress(...params: Array<unknown>): number {
  let isLoaded: number = 0;

  for (const item of params) {
    if (item !== undefined) isLoaded++;
  }

  return Math.floor((isLoaded / params.length) * 100);
}
