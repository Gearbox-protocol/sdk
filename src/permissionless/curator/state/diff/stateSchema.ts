import {
  absent,
  address,
  amount,
  boolean,
  identity,
  integer,
  leaf,
  limit,
  list,
  object,
  observed,
  optional,
  percent,
  record,
  scalar,
  status,
  string,
  UNLIMITED,
  union,
  unknownWhen,
} from "./schemaNodes.js";

/**
 * The building blocks of a state schema, as one object so that their generic
 * names (`address`, `list`, `status`…) stay out of the barrels they are
 * exported from:
 *
 * ```ts
 * const { object, list, identity, address, boolean } = stateSchema;
 * const pools = list(
 *   object({ pool: identity(address), allowed: boolean }),
 *   (item) => item.pool,
 * );
 * ```
 **/
export const stateSchema = {
  leaf,
  address,
  percent,
  amount,
  integer,
  boolean,
  string,
  scalar,
  limit,
  UNLIMITED,
  status,
  object,
  record,
  list,
  union,
  absent,
  optional,
  unknownWhen,
  identity,
  observed,
} as const;
