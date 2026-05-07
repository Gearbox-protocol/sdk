export function isStrategyReleased(
  releaseAt: undefined | number,
  currentTimestamp: number,
) {
  if (releaseAt === undefined) return true;
  return currentTimestamp > releaseAt;
}
