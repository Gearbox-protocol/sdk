import {TypedEvent} from "../types/commons";

export const typedEventsComparator = (a: TypedEvent<any>, b: TypedEvent<any>) =>
  a.blockNumber === b.blockNumber
    ? a.logIndex > b.logIndex
      ? 1
      : -1
    : a.blockNumber > b.blockNumber
    ? 1
    : -1;
