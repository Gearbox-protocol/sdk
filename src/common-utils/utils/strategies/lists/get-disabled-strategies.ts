import { isStrategyDisabled } from "../strategy-state/is-strategy-disabled.js";
import type {
  CreditManagerDataSlice,
  CuratorFilter,
  StrategiesCMListByChain,
  Strategy,
  StrategyRecord,
} from "../types.js";

export function getDisabledStrategies<CM extends CreditManagerDataSlice>(
  list: Strategy[] | undefined | undefined,
  listCMs: StrategiesCMListByChain<CM> | undefined,
  curatorFilter: CuratorFilter | undefined,
): {
  record: StrategyRecord;
  list: Array<Strategy>;
} {
  if (listCMs instanceof Error) return { record: {}, list: [] };
  if (!list) return { record: {}, list: [] };
  if (!listCMs) return { record: {}, list: [] };

  const d = list.reduce<{
    record: StrategyRecord;
    list: Array<Strategy>;
  }>(
    (acc, s) => {
      const targetAddress = s.tokenOutAddress;

      const strategyCmsList = Object.values(listCMs?.[s.chainId]?.[s.id] || {});
      const disabled = isStrategyDisabled(targetAddress, strategyCmsList);

      if (!acc.record[s.chainId]) acc.record[s.chainId] = {};
      if (curatorFilter ? disabled && strategyCmsList.length > 0 : disabled) {
        acc.record[s.chainId][s.id] = s;
        acc.list.push(s);
      }

      return acc;
    },
    { record: {}, list: [] },
  );

  return d;
}
