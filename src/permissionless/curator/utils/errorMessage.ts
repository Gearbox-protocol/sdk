/** Human-readable reason of anything that can be thrown. **/
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
