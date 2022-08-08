import { NetworkType } from "../core/constants";

export type PathFinderContracts = "PATH_FINDER" | "CONVEX_PATH_FINDER";

export const pathFindersByNetwork: Record<
  NetworkType,
  Record<PathFinderContracts, string>
> = {
  Mainnet: {
    // PATH_FINDER
    PATH_FINDER: "",
    CONVEX_PATH_FINDER: ""
  },
  Kovan: {
    // PATH_FINDER
    PATH_FINDER: "",
    CONVEX_PATH_FINDER: ""
  },
  Goerli: {
    // PATH_FINDER
    PATH_FINDER: "",
    CONVEX_PATH_FINDER: ""
  }
};
