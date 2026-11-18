import type { CuratorSessionOptions } from "../../curator/session/CuratorSession.js";
import type { GipAnvilForkOptions } from "../../curator/session/forkConnection.js";

/**
 * Args of {@link PermissionlessCurator.open}: choose an attached chain or an
 * Anvil endpoint. Fork mode detects the chain from the node and needs no attach.
 **/
export type OpenCuratorSessionArgs = CuratorSessionOptions &
  (
    | { chainId: number; fork?: never }
    | { fork: GipAnvilForkOptions; chainId?: never }
  );
