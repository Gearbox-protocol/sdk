import { PoolData } from "../core/pool";
export interface PoolTokens {
    dieselToken: string | undefined;
    underlyingToken: string | undefined;
}
export declare function getPoolTokens(pool: PoolData | undefined | Error): PoolTokens;
interface WithUnderlyingToken {
    readonly underlyingToken: string;
}
export declare function getUnderlyingToken(c: WithUnderlyingToken | undefined | Error): string | undefined;
export {};
