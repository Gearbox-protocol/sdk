import { BigNumber } from "ethers";

export type BigintifyProps<T extends {}> = {
  [K in keyof T]: T[K] extends BigNumber ? bigint : T[K];
};

export type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;
