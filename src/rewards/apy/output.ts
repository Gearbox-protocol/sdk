import type {
  GearAPYDetails,
  PoolOutputDetails,
  TokenOutputDetails,
} from "./output-details.js";

export interface Output<
  POOL_POINTS_TYPE extends string,
  TOKEN_POINTS_TYPE extends string,
> {
  gearApy: DataResult<GearAPYDetails>;
  chains: Record<
    string,
    {
      tokens: DataResult<TokenOutputDetails<TOKEN_POINTS_TYPE>[]>;
      pools: DataResult<PoolOutputDetails<POOL_POINTS_TYPE>[]>;
    }
  >;
  timestamp: string;
  metadata: {
    totalChains: number;
    successfulChains: number;
    failedChains: number;
  };
}

export type DataResult<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string; code?: string };
