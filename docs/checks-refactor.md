## `@gearbox-protocol/sdk/preview` удалён

| Сейчас | После |
|---|---|
| `checkOperation`, `checkSimulation` | `@gearbox-protocol/sdk/onchain` **или** `sdk.preview.checkOperation` / `checkSimulation` |
| `checkPrerequisites` | **удалён** — вошёл в `checkOperation` |
| `PrerequisiteResult`, `BalanceResult` | **удалены** — те же факты как `insufficientBalance` / `insufficientAllowance` / `rwaOpenRequirementsNotMet` в массиве ошибок |

Теперь вызывать надо через preview namespace

```ts
const errors = await sdk.preview.checkOperation(
  { chainId, preview, sender },
  { minHealthFactor, minSafeHealthFactor, currentHealthFactor },
);

const creditErrors = await sdk.preview.checkSimulation(
  { chainId, state },
  { minHealthFactor, minSafeHealthFactor, currentHealthFactor },
);

const poolErrors = await sdk.preview.checkSimulation({
  chainId,
  pool,
  state,
  isDeposit,
});
```

## Изменения в checks

Checks возвращают вообще все `Error[]`, не первую, пустой массив = все ок.

### `checkOperation` (credit manager)

**Async**, **`sender` обязателен**, `balances` нет. Open/adjust — полный набор; repay — market + funding; close — только market. Wallet/RWA бывшего `checkPrerequisites` внутри массива — approve/sign доставать по `code`.

| Сейчас (`code`) | Раньше | Примечания |
|---|---|---|
| `creditManagerPaused` | `marketPaused` + `{ creditManager }` | Нет `"pool" in detail`. |
| `marketExpired` | `marketExpired` | |
| `debtOutOfRange` | `debtOutOfRange` | Open/adjust. |
| `insufficientPoolLiquidity` | `insufficientPoolLiquidity` | Open/adjust; переименованы поля: `binding` -> `limit`, `solutionAmount` ->`maxBorrowAmount` |
| `forbiddenToken` | `forbiddenToken` | Open/adjust. |
| `quotaCountExceeded` | `quotaCountExceeded` | Open/adjust. |
| `quotaLimitReached` | `quotaLimitReached` | Open/adjust. |
| `insufficientCollateral` | `insufficientCollateral` | Open/adjust. Переименовано поле `required` -> `healthFactorThreshold`. |
| `insufficientBalance` | `checkPrerequisites` `BalanceResult` (`kind: "balance"`); при `balances` — `insufficientSourceBalance` | Open/adjust/repay. Async. Добавлено `holderKind?: "wallet" \| "creditAccount"`. `required` / `held` — `TokenAmount`. |
| `insufficientAllowance` | `checkPrerequisites` `AllowanceResult` (`kind: "allowance"`) | Open/adjust/repay. Async. `required` / `allowed` — `TokenAmount` (token на `required`). |
| `rwaOpenRequirementsNotMet` | `checkPrerequisites` `RWAOpenRequirementsResult` (`kind: "rwaOpenRequirements"`) | RWA open. Async. Sign/register по `code`. |
| `unexpectedFailure` | `PrerequisiteResult.error` (read/RPC) | Open/adjust/repay. Async. «Can't verify»; тот же `code`, что у prepare. |

### `checkOperation` (pool)

**Async**, **`sender` обязателен**, `balances` нет. Deposit/mint/withdraw/redeem.

| Сейчас (`code`) | Раньше | Примечания |
|---|---|---|
| `poolPaused` | `marketPaused` + `{ pool }` | |
| `poolSunset` | `poolSunset` | Только deposit. |
| `insufficientPoolLiquidity` | `insufficientPoolLiquidity` | `binding` → `limit`. |
| `insufficientBalance` | `checkPrerequisites` `BalanceResult` (`kind: "balance"`); при `balances` — `insufficientSourceBalance` | Async. `required` / `held` — `TokenAmount`. |
| `insufficientAllowance` | `checkPrerequisites` `AllowanceResult` (`kind: "allowance"`) | Async. `required` / `allowed` — `TokenAmount`. |
| `unexpectedFailure` | `PrerequisiteResult.error` (read/RPC) | Async. «Can't verify». |

### `checkSimulation` (credit manager)

Standalone sync; на `sdk.preview` — async. Вход `{ chainId, state }`. Нет funding/RWA, нет `forbiddenToken` / `quotaLimitReached` (`OperationState` — снимок после, без того что операция добавила; engine уже проверил).

| Сейчас (`code`) | Раньше | Примечания |
|---|---|---|
| `creditManagerPaused` | `marketPaused` + `{ creditManager }` | Нет `"pool" in detail`. |
| `marketExpired` | `marketExpired` | |
| `debtOutOfRange` | `debtOutOfRange` | |
| `quotaCountExceeded` | `quotaCountExceeded` | Engine это не весит. |
| `insufficientCollateral` | `insufficientCollateral` | Thresholds (`minHealthFactor`, `minSafeHealthFactor`, `currentHealthFactor`) передаются в параметрах `checkSimulation`. Переименовано `required` → `healthFactorThreshold`. |

### `checkSimulation` (pool)

Новый branch (`{ chainId, pool, state, isDeposit }`). Те же pool-state checks, что у parsed tx — клиентские `pool.paused` / `op` / `tokenOut > sim.availableLiquidity` можно убрать.

| Сейчас (`code`) | Раньше | Примечания |
|---|---|---|
| `poolPaused` | `marketPaused` + `{ pool }`; клиентский `pool.paused` | |
| `poolSunset` | `poolSunset`; клиентский `pool.sunset && op === "pool-deposit"` | Только deposit. |
| `insufficientPoolLiquidity` | клиентский `tokenOut > sim.availableLiquidity` | Сравнивает с `pool.availableLiquidity`, не с урезанным `PoolSimulation.availableLiquidity`. Равенство уже error. |

## `previewOperation`

Malformed транзакция больше не попадает в поле warning, теперь это явный error.

Шесть кодов (`malformedBracket`, `adapterCallOutsideBracket`...) схлопнуты в один `malformedTransaction` все детали - в message (фронту оно все равно их различать без нужды)

Остальные `error.code`:

| Сейчас | Раньше |
|---|---|
| `unsupportedTarget` | то же |
| `unsupportedPoolFunction` | то же |
| `unsupportedZapperFunction` | то же |
| `unsupportedOperation` | то же |
| `invalidDelayedIntent` | то же |
| `poolOperationPreviewError` | `previewSimulationFailed` |
| `malformedTransaction` | шесть malformed-кодов на `warning` |
| `creditAccountNotFound` | throw, не в union |


В случае успеха, в data-shape:
- warning теперь только unpriceable token может быть
- PoolPositionOperationPreview добавлены `zapper?` и `holder` (чтобы не парсить calldata дважды).
- `OpenStrategyPositionPreview` - к `RWAOpenCreditAccount` добавилось `rwaArgs`.

## Добавилось: `sdk.liquidations.checkLiquidation`

```ts
await sdk.liquidations.checkLiquidation({ details, liquidator });
```

`details` — из `getLiquidationDetails` с **тем же** `liquidator`. 