import type { ObjectNode } from "../state/diff/schemaNodes.js";

export interface Plugin<D, S> {
  name: string;
  description: string;
  /** Schema of `S` for state diffing. **/
  stateSchema: ObjectNode;
  getDefaultParams(): D;
  getDeployState(params: D): S;
}
