import type { Abi, Address } from "viem";

import { BaseContract } from "../base/index.js";
import { AddressMap } from "../utils/index.js";
import type { IHooks } from "../utils/internal/index.js";
import { Hooks } from "../utils/internal/index.js";
import type {
  Asset,
  RouterCASlice,
  RouterCMSlice,
  RouterHooks,
} from "./types.js";

export interface Leftovers {
  expectedBalances: AddressMap<Asset>;
  leftoverBalances: AddressMap<Asset>;
  tokensToClaim: AddressMap<Asset>;
}

export abstract class AbstractRouterContract<
    abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IHooks<RouterHooks>
{
  protected readonly hooks = new Hooks<RouterHooks>();

  public readonly addHook = this.hooks.addHook.bind(this.hooks);
  public readonly removeHook = this.hooks.removeHook.bind(this.hooks);

  protected getExpectedAndLeftover(
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
    keepAssets?: Address[],
  ): Leftovers {
    const b = balances || this.getDefaultExpectedAndLeftover(ca, keepAssets);
    const { leftoverBalances, expectedBalances, tokensToClaim } = b;

    const expected: AddressMap<Asset> = new AddressMap<Asset>();
    const leftover: AddressMap<Asset> = new AddressMap<Asset>();

    for (const token of cm.collateralTokens) {
      // When we pass expected balances explicitly, we need to mimic router behaviour by filtering out leftover tokens
      // for example, we can have stETH balance of 2, because 1 transforms to 2 because of rebasing
      // https://github.com/Gearbox-protocol/router-v3/blob/c230a3aa568bb432e50463cfddc877fec8940cf5/contracts/RouterV3.sol#L222
      const actual = expectedBalances.get(token)?.balance || 0n;
      expected.upsert(token, { token, balance: actual > 10n ? actual : 0n });
      leftover.upsert(token, {
        token,
        balance: leftoverBalances.get(token)?.balance || 1n,
      });
    }

    return {
      expectedBalances: expected,
      leftoverBalances: leftover,
      tokensToClaim,
    };
  }

  protected getDefaultExpectedAndLeftover(
    ca: RouterCASlice,
    keepAssets?: Address[],
  ): Leftovers {
    const expectedBalances = new AddressMap<Asset>();
    const leftoverBalances = new AddressMap<Asset>();
    const keepAssetsSet = new Set(keepAssets?.map(a => a.toLowerCase()));
    for (const { token: t, balance, mask } of ca.tokens) {
      const token = t as Address;
      const isEnabled = (mask & ca.enabledTokensMask) !== 0n;
      expectedBalances.upsert(token, { token, balance });
      const decimals = this.sdk.tokensMeta.decimals(token);
      // filter out dust, we don't want to swap it
      const minBalance = 10n ** BigInt(Math.max(8, decimals) - 8);
      // also: gearbox liquidator does not need to swap disabled tokens. third-party liquidators might want to do it
      if (
        keepAssetsSet.has(token.toLowerCase()) ||
        balance < minBalance ||
        !isEnabled
      ) {
        leftoverBalances.upsert(token, { token, balance });
      }
    }

    return {
      expectedBalances,
      leftoverBalances,
      tokensToClaim: new AddressMap<Asset>(),
    };
  }
}
