import { NetworkType } from "../core/constants";
export declare type PathFinderContracts = "PATH_FINDER" | "CONVEX_PATH_FINDER";
export declare const pathFindersByNetwork: Record<NetworkType, Record<PathFinderContracts, string>>;
