import type { Address } from "viem";

import { isUsableToken } from "../tokens/is-usable-token.js";
import type { CreditManagerDataSlice, Strategy } from "../types.js";

import { isCreditManagerUsable } from "./is-credit-manager-usable.js";

interface GetStrategyCreditManagersProps<CM extends CreditManagerDataSlice> {
  strategy: Pick<Strategy, "tokenOutAddress" | "creditManagers">;
  allCreditManagers: Record<Address, CM>;
}

export function getStrategyCreditManagers<CM extends CreditManagerDataSlice>({
  strategy,
  allCreditManagers,
}: GetStrategyCreditManagersProps<CM>) {
  const lpAddress = strategy.tokenOutAddress;

  const res = (strategy?.creditManagers || []).reduce<Record<Address, CM>>(
    (acc, cmAddress) => {
      const cm = allCreditManagers[cmAddress];

      if (cm && isCreditManagerUsable(cm)) {
        const usable = isUsableToken({
          address: lpAddress,
          creditManager: cm,
        });

        const limit = cm.quotas[lpAddress]?.limit || 0n;
        const limitZero =
          lpAddress === cm.underlyingToken ? false : limit === 0n;

        if (usable && !cm.isBorrowingForbidden && !limitZero) {
          acc[cm.address] = cm;
        }
      }

      return acc;
    },
    {},
  );

  return res;
}
