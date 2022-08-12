import { PoolData } from "../core/pool";

export interface PoolTokens {
  dieselToken: string | undefined;
  underlyingToken: string | undefined;
}

export function getPoolTokens(pool: PoolData | undefined | Error): PoolTokens {
  const safePool = pool instanceof Error ? undefined : pool;
  const { dieselToken, underlyingToken } = safePool || {};

  return {
    dieselToken,
    underlyingToken
  };
}

interface WithUnderlyingToken {
  readonly underlyingToken: string;
}

export function getUnderlyingToken(
  c: WithUnderlyingToken | undefined | Error
): string | undefined {
  if (!c || c instanceof Error) {
    return undefined;
  }

  return c.underlyingToken;
}
