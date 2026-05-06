import type { Address } from "viem";

import { isUsableToken } from "../tokens/is-usable-token.js";
import type { Strategy, StrategyCreditManagerView } from "../types.js";

import { isCreditManagerUsable } from "./is-credit-manager-usable.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

interface GetStrategyCreditManagersProps<CM extends StrategyCreditManagerView> {
  strategy: Pick<Strategy, "tokenOutAddress" | "creditManagers">;
  allCreditManagers: Record<Address, CM>;
}

export function getStrategyCreditManagers<
  CM extends StrategyCreditManagerView,
>({ strategy, allCreditManagers }: GetStrategyCreditManagersProps<CM>) {
  const lpAddress = lc(strategy.tokenOutAddress);

  const res = (strategy?.creditManagers || []).reduce<Record<Address, CM>>(
    (acc, cmAddress) => {
      const cm =
        allCreditManagers[cmAddress] ?? allCreditManagers[lc(cmAddress)];

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
