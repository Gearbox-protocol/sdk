export interface Plugin<D, S, M> {
  name: string;
  description: string;
  getDefaultParams(): D;
  getDeployState(params: D): S;
}
