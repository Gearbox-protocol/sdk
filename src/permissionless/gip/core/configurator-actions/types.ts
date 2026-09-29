import type { Address } from "viem";
import type { z } from "zod";
import type { RawTx } from "../../../../onchain/index.js";
import type { GipBuilderContext } from "../actions/context.js";
import type { BaseMarketAction } from "../actions/types.js";
import type { ConfiguratorState } from "../configurator-state/types.js";
import type { ConfiguratorActions } from "./index.js";

export interface ConfiguratorTx {
  tx: RawTx;
  action: ConfiguratorActions;
  newContract?: Address;
}

export interface ConfiguratorActionData<
  A extends BaseMarketAction<string, object>,
> {
  type: A["type"];
  name?: string;
  schema: z.ZodSchema;
  description: string;
  stateTransition: (params: {
    state: ConfiguratorState;
    params: A["params"];
    newContract?: Address;
  }) => ConfiguratorState;
  getRawTx: (params: {
    ctx: GipBuilderContext;
    action: A;
  }) => Promise<{ tx: ConfiguratorTx }>;
  replace: (a: A["params"], b: A["params"]) => boolean;
  replaceKeep?: "first" | "last";
}
