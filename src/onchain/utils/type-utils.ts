export type PickSomeRequired<
  T,
  RequiredKeys extends keyof T,
  OptionalKeys extends keyof T,
> = Required<Pick<T, RequiredKeys>> & Partial<Pick<T, OptionalKeys>>;
