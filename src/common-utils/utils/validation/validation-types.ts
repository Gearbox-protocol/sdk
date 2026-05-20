type AllKeys<T> = T extends unknown ? keyof T : never;

type IsKeyInAll<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? true
    : false
  : never;

type IsKeyRequired<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? object extends Pick<T, K>
      ? false
      : true
    : false
  : never;

type RequiredKeys<T, K = AllKeys<T>> = K extends PropertyKey
  ? true extends IsKeyInAll<T, K>
    ? true extends IsKeyRequired<T, K>
      ? false extends IsKeyRequired<T, K>
        ? never
        : K
      : never
    : never
  : never;

type OptionalKeys<T, K = AllKeys<T>> = K extends PropertyKey
  ? K extends RequiredKeys<T>
    ? never
    : K
  : never;

type ValueForKey<T, K extends PropertyKey> = T extends { [P in K]?: infer V }
  ? V
  : never;

export type FlattenUnion<T> = {
  [K in RequiredKeys<T>]: ValueForKey<T, K>;
} & {
  [K in OptionalKeys<T>]?: ValueForKey<T, K>;
};
