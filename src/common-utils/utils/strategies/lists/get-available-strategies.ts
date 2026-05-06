import { isStrategyDisabled } from "../strategy-state/is-strategy-disabled.js";
import type {
  CreditManagerDataSlice,
  StrategiesCMListByChain,
  Strategy,
  StrategyRecord,
} from "../types.js";

export function getAvailableStrategies<CM extends CreditManagerDataSlice>(
  list: Strategy[] | undefined | undefined,
  listCMs: StrategiesCMListByChain<CM> | undefined,
): {
  record: StrategyRecord | null | Error;
  list: Array<Strategy> | null | Error;
} {
  if (listCMs instanceof Error) return { record: listCMs, list: listCMs };
  if (!list) return { record: null, list: null };
  if (!listCMs) return { record: null, list: null };

  const a = list.reduce<{
    record: StrategyRecord;
    list: Array<Strategy>;
  }>(
    (acc, s) => {
      const targetAddress = s.tokenOutAddress;

      const strategyCmsList = Object.values(listCMs?.[s.chainId]?.[s.id] || {});

      if (!acc.record[s.chainId]) acc.record[s.chainId] = {};
      if (!isStrategyDisabled(targetAddress, strategyCmsList)) {
        acc.record[s.chainId][s.id] = s;
        acc.list.push(s);
      }

      return acc;
    },
    { record: {}, list: [] },
  );

  return a;
}
