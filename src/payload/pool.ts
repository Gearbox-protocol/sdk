import { PoolDataStruct } from "../types/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArray } from "../utils/types";

export type PoolDataPayload = ExcludeArray<PoolDataStruct>;
