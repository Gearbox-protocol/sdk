# План: `getStrategyInfoSnapshot` в `ApyPlugin`

## Summary

Добавить в `ApyPlugin` публичный метод:

```ts
plugin.getStrategyInfoSnapshot({
  slippage,
  quotaReserve,
  curatorFilter,
  strategyPayloadsList,
  showHiddenStrategies,
})
```

Метод собирает snapshot стратегий для текущей сети SDK: released strategies, CMs, available/disabled списки и `strategiesInfo`.

Ограничение текущей сетью выполняется через:

```ts
const allowedChains = { [this.sdk.chainId]: this.sdk.networkType };
```

Поэтому после `getReleasedStrategiesList` дополнительный фильтр по `chainId` не нужен.

## Type Updates

Учитывать последние изменения в типах стратегий:

- Использовать `CreditManagerDataSlice`, а не старое имя `CreditManagerData_Legacy`.
- `GearboxSDKFullState` и `GearboxSDKFullStateByChain` теперь generic:

```ts
GearboxSDKFullState<CM extends CreditManagerDataSlice>
GearboxSDKFullStateByChain<CM extends CreditManagerDataSlice>
```

- `StrategiesCMListByChain` тоже generic:

```ts
StrategiesCMListByChain<CM extends CreditManagerDataSlice>
```

- Все вызовы helper-функций должны передавать один и тот же CM type:

```ts
const sdkStateByChain: GearboxSDKFullStateByChain<CreditManagerDataSlice>;
const cmsOfStrategiesByChain:
  | StrategiesCMListByChain<CreditManagerDataSlice>
  | undefined;
```

Добавить типы для метода:

```ts
export interface GetStrategyInfoSnapshotArgs {
  slippage: number;
  quotaReserve: number;
  curatorFilter: CuratorFilter;
  strategyPayloadsList: NotValidatedStrategy[] | undefined;
  showHiddenStrategies: boolean;
}

export interface StrategyInfoSnapshot<
  CM extends CreditManagerDataSlice = CreditManagerDataSlice,
> {
  availableStrategies: StrategyRecord | null | Error;
  disabledStrategies: StrategyRecord;
  availableList: Strategy[] | null | Error;
  disabledList: Strategy[] | null | Error;
  cmsOfStrategiesByChain: StrategiesCMListByChain<CM> | undefined;
  strategiesInfo: Record<
    number,
    PartialRecord<Strategy["id"], StrategyInfoResult<CM>>
  >;
}
```

Для `getStrategyInfo` нужен state shape с `pools`, поэтому в реализации либо расширить собираемый internal state полем:

```ts
pools?: Record<Address, PoolSlice>;
```

либо добавить это поле в `GearboxSDKFullState<CM>`, если этот state должен стать общим источником для strategy info.

## Implementation Changes

Добавить `getStrategyInfoSnapshot` в `src/plugins/apy/ApyPlugin.ts`.

Метод должен бросать `"apy plugin not loaded"`, если APY plugin не загружен.

Pipeline:

1. Собрать `allowedChains` только для текущей сети.

2. Собрать `sdkStateByChain` для текущей сети:
   - `lastSyncBlock.blockTimestamp_js = Number(this.sdk.timestamp)`;
   - `tokens.tokenDataList` из SDK token metadata;
   - `creditManagers` из `this.sdk.marketRegister.creditManagers`;
   - `pools` из `this.sdk.marketRegister.pools`, если поле добавляется в общий state или internal state для `getStrategyInfo`.

3. Посчитать released strategies:

```ts
const releasedStrategies = getReleasedStrategiesList<CreditManagerDataSlice>(
  strategyPayloadsList,
  allowedChains,
  sdkStateByChain,
  curatorFilter,
  showHiddenStrategies,
);
```

4. Посчитать CMs стратегий:

```ts
const cmsOfStrategiesByChain =
  getStrategyCreditManagersList<CreditManagerDataSlice>(
    releasedStrategies,
    sdkStateByChain,
    curatorFilter,
  );
```

5. Посчитать available/disabled:

```ts
const { available, disabled, availableList, disabledList } =
  getAvailableAndDisabledStrategies<CreditManagerDataSlice>(
    releasedStrategies,
    cmsOfStrategiesByChain,
    curatorFilter,
  );
```

6. Собрать `apyListByNetwork` из текущего APY snapshot:

```ts
const apyListByNetwork = {
  [this.sdk.chainId]: this.apySnapshot.apy,
};
```

7. Собрать `allPricesByChain` из SDK market/oracle state:
   - пройти по `this.sdk.marketRegister.markets`;
   - ключ market prices: `market.pool.pool.address`;
   - цены брать из `market.priceOracle.mainPrices`;
   - включать только successful answers;
   - цены должны быть USD с 8 decimals, как ожидает `PriceUtils`.

8. Проверить decimals:
   - для расчёта использовать decimals из `sdkStateByChain[chainId].tokens.tokenDataList[token].decimals`;
   - сверить с `this.sdk.tokensMeta.decimals(token)`;
   - если отличаются, использовать `tokenDataList.decimals` и логировать warning;
   - если decimals отсутствуют, использовать fallback `18` и логировать warning.

9. Посчитать `strategiesInfo` напрямую по `releasedStrategies`:

```ts
const strategiesInfo =
  releasedStrategies?.reduce<
    StrategyInfoSnapshot<CreditManagerDataSlice>["strategiesInfo"]
  >((acc, strategy) => {
    const info = getStrategyInfo<Strategy["id"], CreditManagerDataSlice>({
      strategy,
      creditManagers: cmsOfStrategiesByChain,
      sdkStateByChain,
      apyListByNetwork,
      allPricesByChain,
      quotaReserve,
      slippage,
    });

    if (info) {
      acc[strategy.chainId] ??= {};
      acc[strategy.chainId][strategy.id] = info;
    }

    return acc;
  }, {}) ?? {};
```

10. Вернуть snapshot:

```ts
return {
  availableStrategies: available,
  disabledStrategies: disabled,
  availableList,
  disabledList,
  cmsOfStrategiesByChain,
  strategiesInfo,
};
```

## Tests

Покрыть:

- `strategyPayloadsList === undefined`: available/list null, disabled empty, `strategiesInfo` empty.
- `allowedChains` текущей сети исключает стратегии других сетей на этапе `getReleasedStrategiesList`.
- `showHiddenStrategies` и `releaseAt` работают через `lastSyncBlock.blockTimestamp_js`.
- generic-типы `GearboxSDKFullStateByChain<CreditManagerDataSlice>` и `StrategiesCMListByChain<CreditManagerDataSlice>` проходят typecheck.
- `curatorFilter` отсекает CMs по `marketConfigurator`.
- available/disabled совпадают с `getAvailableAndDisabledStrategies`.
- `strategiesInfo` считается по released strategies без повторного chain filter.
- strategy без подходящих CMs не попадает в `strategiesInfo`.
- цены берутся из `market.priceOracle.mainPrices` нужного pool.
- при совпадающих decimals `availableToBorrowMoney` считается ожидаемо.
- при несовпадающих decimals используется `tokenDataList.decimals` и пишется warning.
- при отсутствующих decimals используется fallback `18` и пишется warning.
- если `ApyPlugin` не loaded, метод бросает `"apy plugin not loaded"`.

## Assumptions

- Метод живёт в `ApyPlugin`.
- `apyListByNetwork` строится из `this.apySnapshot.apy`.
- `allPricesByChain` не передаётся снаружи, а собирается из SDK market/oracle state.
- Основной CM type для метода: `CreditManagerDataSlice`.
- Ограничение текущей сетью делается только через `allowedChains` в `getReleasedStrategiesList`.
- Decimal mismatch не является runtime error: метод логирует warning и продолжает расчёт.
