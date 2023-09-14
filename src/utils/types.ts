import { BigNumber } from "ethers";

export type BigintifyProps<T extends {}> = {
  [K in keyof T]: T[K] extends BigNumber ? bigint : T[K];
};
