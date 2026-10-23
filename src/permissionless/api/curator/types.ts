import type { CuratorSessionOptions } from "../../curator/session/CuratorSession.js";

/**
 * Args of {@link PermissionlessCurator.open}: the session options, with the
 * chain named instead of a client.
 **/
export interface OpenCuratorSessionArgs extends CuratorSessionOptions {
  chainId: number;
}
