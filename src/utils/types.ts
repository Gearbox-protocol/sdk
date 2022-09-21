export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AwaitedRes<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

type ArrayMethodKeys = keyof [] & {};

type NonArrayKeys<T> = T extends `${number}` | number | ArrayMethodKeys
  ? never
  : T;

export type ExcludeArrayProps<T> = {
  [K in keyof T as NonArrayKeys<K>]: T[K];
};
