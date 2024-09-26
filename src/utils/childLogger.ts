import type { ILogger } from "../types";

export function childLogger(
  module: string,
  logger?: ILogger,
): ILogger | undefined {
  return logger?.child?.({ module }) ?? logger;
}
