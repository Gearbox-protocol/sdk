/** The message of an error and of every cause beneath it, joined for reports. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const details =
    error instanceof AggregateError
      ? [...error.errors].map(errorMessage)
      : error.cause
        ? [errorMessage(error.cause)]
        : [];
  return [error.message, ...details].join(": ");
}
