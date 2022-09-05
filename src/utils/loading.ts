const isLoaded = (v: unknown) => v !== undefined && v !== null;

export function allLoaded(itemsToLoad: Array<unknown>): boolean {
  return itemsToLoad.reduce<boolean>(
    (acc, item) => acc && isLoaded(item),
    true,
  );
}

export function loadingProgress(itemsToLoad: Array<unknown>): number {
  const loaded = itemsToLoad.reduce<number>(
    (acc, item) => (isLoaded(item) ? acc + 1 : acc),
    0,
  );

  return Math.floor((loaded / itemsToLoad.length) * 100);
}
