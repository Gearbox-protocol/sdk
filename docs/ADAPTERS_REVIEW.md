# Removal of `@gearbox-protocol/integrations-v3` dependency & adapter review

Date: 2026-07-09

## Summary

The SDK no longer depends on the `@gearbox-protocol/integrations-v3` npm package. All adapter ABIs
it consumed are now vendored locally under `src/plugins/adapters/abi/adapters/` (plus
`src/abi/ierc4626Adapter.ts` for the one ABI shared with core SDK code). Adapters and versions that
are neither deployed on any supported network nor present in current `integrations-v3/contracts/adapters`
sources were dropped. Non-protocol adapters (`ADAPTER::ACCOUNT_MIGRATOR`) were kept unconditionally.

Verification: `tsc --noEmit` clean, all 558 unit tests pass, and a live 5-chain attach
(`scripts/list-adapters.ts`) resolves every deployed adapter to a concrete class with zero
`PlaceholderAdapterContract` fallbacks.

## How "used in practice" was determined

New script [scripts/list-adapters.ts](scripts/list-adapters.ts) attaches a `MultichainSDK` with the
`AdaptersPlugin` to **Mainnet, Monad, Somnia, Etherlink, Plasma** and enumerates
`marketRegister.markets → creditManagers → creditManager.adapters`, deduplicating
`contractType@version` pairs across all chains.

Run it with:

```bash
LOG_LEVEL=warn fnox exec -- pnpm exec tsx scripts/list-adapters.ts
```

RPC sources (via `fnox.local.toml`): `RPC_URL` (Mainnet), `MONAD_PROVIDER`, `SOMNIA_PROVIDER`,
`ETHERLINK_PROVIDER` (full RPC URLs), and `ALCHEMY_KEY` for Plasma.

## Adapters found on-chain (31 contractType@version pairs)

Somnia currently has no adapters deployed.

| contractType | version | networks |
|---|---|---|
| `ADAPTER::BALANCER_V3_ROUTER` | 310, 311 | Mainnet, Plasma |
| `ADAPTER::CURVE_STABLE_NG` | 310 | Etherlink, Mainnet, Plasma |
| `ADAPTER::CURVE_STABLE_NG` | 311 | Mainnet, Monad, Plasma |
| `ADAPTER::CURVE_V1_2ASSETS` | 311 | Mainnet |
| `ADAPTER::CURVE_V1_3ASSETS` | 311 | Mainnet |
| `ADAPTER::CVX_V1_BASE_REWARD_POOL` | 310, 311 | Mainnet |
| `ADAPTER::CVX_V1_BOOSTER` | 310 | Mainnet |
| `ADAPTER::DAI_USDS_EXCHANGE` | 310 | Mainnet |
| `ADAPTER::ERC4626_VAULT` | 311 | Mainnet |
| `ADAPTER::ERC4626_VAULT` | 312 | Mainnet, Monad, Plasma |
| `ADAPTER::FLUID_DEX` | 310 | Mainnet, Plasma |
| `ADAPTER::INFINIFI_GATEWAY` | 310 | Mainnet |
| `ADAPTER::INFINIFI_UNWINDING` | 310 | Mainnet |
| `ADAPTER::KELP_DEPOSIT_POOL` | 310 | Mainnet |
| `ADAPTER::KELP_WITHDRAWAL` | 310 | Mainnet |
| `ADAPTER::LIDO_V1` | 310 | Mainnet |
| `ADAPTER::LIDO_WSTETH_V1` | 310 | Mainnet |
| `ADAPTER::MELLOW_CLAIMER` | 310 | Mainnet |
| `ADAPTER::MELLOW_DVV` | 310 | Mainnet |
| `ADAPTER::MELLOW_ERC4626_VAULT` | 312 | Mainnet |
| `ADAPTER::MELLOW_WRAPPER` | 310 | Mainnet |
| `ADAPTER::MIDAS_ISSUANCE_VAULT` | 310 | Monad |
| `ADAPTER::MIDAS_REDEMPTION_VAULT` | 310 | Monad |
| `ADAPTER::PENDLE_ROUTER` | 310 | Mainnet, Plasma |
| `ADAPTER::PENDLE_ROUTER` | 311 | Mainnet |
| `ADAPTER::UNISWAP_V2_ROUTER` | 310 | Mainnet |
| `ADAPTER::UNISWAP_V3_ROUTER` | 310 | Mainnet, Monad |
| `ADAPTER::UNISWAP_V4_GATEWAY` | 310 | Mainnet, Monad |
| `ADAPTER::UPSHIFT_VAULT` | 310 | Mainnet |

## Adapters in `integrations-v3/contracts/adapters` (34 concrete)

| protocol dir | contract | contractType | version |
|---|---|---|---|
| balancer | `BalancerV3RouterAdapter` | `ADAPTER::BALANCER_V3_ROUTER` | 311 |
| balancer | `BalancerV3WrapperAdapter` | `ADAPTER::BALANCER_V3_WRAPPER` | 310 |
| camelot | `CamelotV3Adapter` | `ADAPTER::CAMELOT_V3_ROUTER` | 310 |
| convex | `ConvexV1BaseRewardPoolAdapter` | `ADAPTER::CVX_V1_BASE_REWARD_POOL` | 311 |
| convex | `ConvexV1BoosterAdapter` | `ADAPTER::CVX_V1_BOOSTER` | 310 |
| curve | `CurveV1Adapter2Assets` | `ADAPTER::CURVE_V1_2ASSETS` | 311 |
| curve | `CurveV1Adapter3Assets` | `ADAPTER::CURVE_V1_3ASSETS` | 311 |
| curve | `CurveV1Adapter4Assets` | `ADAPTER::CURVE_V1_4ASSETS` | 311 |
| curve | `CurveV1AdapterStableNG` | `ADAPTER::CURVE_STABLE_NG` | 311 |
| curve | `CurveV1AdapterStETH` | `ADAPTER::CURVE_V1_STECRV_POOL` | 311 |
| erc4626 | `ERC4626Adapter` | `ADAPTER::ERC4626_VAULT` | 312 |
| erc4626 | `ERC4626ReferralAdapter` | `ADAPTER::ERC4626_VAULT_REFERRAL` | 310 |
| fluid | `FluidDexAdapter` | `ADAPTER::FLUID_DEX` | 310 |
| infinifi | `InfinifiGatewayAdapter` | `ADAPTER::INFINIFI_GATEWAY` | 310 |
| infinifi | `InfinifiUnwindingGatewayAdapter` | `ADAPTER::INFINIFI_UNWINDING` | 310 |
| lido | `LidoV1Adapter` | `ADAPTER::LIDO_V1` | 310 |
| lido | `WstETHV1Adapter` | `ADAPTER::LIDO_WSTETH_V1` | 310 |
| mellow | `Mellow4626VaultAdapter` | `ADAPTER::MELLOW_ERC4626_VAULT` | 312 |
| mellow | `MellowClaimerAdapter` | `ADAPTER::MELLOW_CLAIMER` | 310 |
| mellow | `MellowDVVAdapter` | `ADAPTER::MELLOW_DVV` | 310 |
| mellow | `MellowWrapperAdapter` | `ADAPTER::MELLOW_WRAPPER` | 310 |
| midas | `MidasIssuanceVaultAdapter` | `ADAPTER::MIDAS_ISSUANCE_VAULT` | 310 |
| midas | `MidasRedemptionVaultAdapter` | `ADAPTER::MIDAS_REDEMPTION_VAULT` | 310 |
| pendle | `PendleRouterAdapter` | `ADAPTER::PENDLE_ROUTER` | 311 |
| securitize | `SecuritizeOnRampAdapter` | `ADAPTER::SECURITIZE_ONRAMP` | 310 |
| securitize | `SecuritizeRedemptionGatewayAdapter` | `ADAPTER::SECURITIZE_REDEMPTION` | 310 |
| sky | `DaiUsdsAdapter` | `ADAPTER::DAI_USDS_EXCHANGE` | 310 |
| sky | `StakingRewardsAdapter` | `ADAPTER::STAKING_REWARDS` | 312 |
| traderjoe | `TraderJoeRouterAdapter` | `ADAPTER::TRADERJOE_ROUTER` | 310 |
| uniswap | `UniswapV2Adapter` | `ADAPTER::UNISWAP_V2_ROUTER` | 310 |
| uniswap | `UniswapV3Adapter` | `ADAPTER::UNISWAP_V3_ROUTER` | 310 |
| uniswap | `UniswapV4Adapter` | `ADAPTER::UNISWAP_V4_GATEWAY` | 310 |
| upshift | `UpshiftVaultAdapter` | `ADAPTER::UPSHIFT_VAULT` | 311 |
| velodrome | `VelodromeV2RouterAdapter` | `ADAPTER::VELODROME_V2_ROUTER` | 310 |

Notes:

- Kelp adapters exist in the published npm package (and on Mainnet) but are **not** in current
  integrations-v3 sources.
- Securitize adapters exist in integrations-v3 sources but are not yet in the published npm package.

## Adapters in the SDK before this change

42 concrete adapter contract classes in `src/plugins/adapters/contracts/`, covering every entry of
the integrations-v3 table above plus: `AccountMigratorAdapterContract` (non-protocol),
`KelpLRTDepositPoolAdapterContract`, `KelpLRTWithdrawalManagerAdapterContract`,
`CurveV1AdapterDeposit` (`ADAPTER::CURVE_V1_WRAPPER`), `MellowDepositQueueAdapterContract`,
`MellowRedeemQueueAdapterContract`, `SecuritizeSwapAdapterContract`.

Additionally, `AdapterType` / `AdapterContractType` contained type-only entries with no
implementation class: `YEARN_V2`, `EQUALIZER_ROUTER`, `BALANCER_VAULT`, `INFRARED_VAULT`,
`KODIAK_ISLAND_GATEWAY`, `MELLOW_LRT_VAULT`.

## Keep / drop decision

Rule: keep a `contractType@version` if it is (a) deployed on at least one of the 5 networks, or
(b) present in `integrations-v3/contracts/adapters` sources, or (c) a non-protocol adapter.

### Kept

| contractType | versions kept | reason |
|---|---|---|
| `ACCOUNT_MIGRATOR` | 310 | non-protocol, unconditional |
| `BALANCER_V3_ROUTER` | 310, 311 | on-chain (both), sources (311) |
| `BALANCER_V3_WRAPPER` | 310 | sources |
| `CAMELOT_V3_ROUTER` | 310 | sources |
| `CURVE_STABLE_NG` | 310, 311 | on-chain (both), sources (311) |
| `CURVE_V1_2ASSETS` | 311 | on-chain, sources |
| `CURVE_V1_3ASSETS` | 311 | on-chain, sources |
| `CURVE_V1_4ASSETS` | 311 | sources |
| `CURVE_V1_STECRV_POOL` | 311 | sources |
| `CVX_V1_BASE_REWARD_POOL` | 310, 311 | on-chain (both), sources (311) |
| `CVX_V1_BOOSTER` | 310 | on-chain, sources |
| `DAI_USDS_EXCHANGE` | 310 | on-chain, sources |
| `ERC4626_VAULT` | 311, 312 | on-chain (both), sources (312) |
| `ERC4626_VAULT_REFERRAL` | 310 | sources |
| `FLUID_DEX` | 310 | on-chain, sources |
| `INFINIFI_GATEWAY` | 310 | on-chain, sources |
| `INFINIFI_UNWINDING` | 310 | on-chain, sources |
| `KELP_DEPOSIT_POOL` | 310 | on-chain (Mainnet) |
| `KELP_WITHDRAWAL` | 310 | on-chain (Mainnet) |
| `LIDO_V1` | 310 | on-chain, sources |
| `LIDO_WSTETH_V1` | 310 | on-chain, sources |
| `MELLOW_CLAIMER` | 310 | on-chain, sources |
| `MELLOW_DVV` | 310 | on-chain, sources |
| `MELLOW_ERC4626_VAULT` | 312 | on-chain, sources |
| `MELLOW_WRAPPER` | 310 | on-chain, sources |
| `MIDAS_ISSUANCE_VAULT` | 310 | on-chain, sources |
| `MIDAS_REDEMPTION_VAULT` | 310 | on-chain, sources |
| `PENDLE_ROUTER` | 310, 311 | on-chain (both), sources (311) |
| `SECURITIZE_ONRAMP` | 310 | sources |
| `SECURITIZE_REDEMPTION` | 310 | sources |
| `STAKING_REWARDS` | 312 | sources |
| `TRADERJOE_ROUTER` | 310 | sources |
| `UNISWAP_V2_ROUTER` | 310 | on-chain, sources |
| `UNISWAP_V3_ROUTER` | 310 | on-chain, sources |
| `UNISWAP_V4_GATEWAY` | 310 | on-chain, sources |
| `UPSHIFT_VAULT` | 310, 311 | on-chain (310), sources (311) |
| `VELODROME_V2_ROUTER` | 310 | sources |

### Dropped

Adapter classes deleted (in neither category):

- `SecuritizeSwapAdapterContract` (`ADAPTER::SECURITIZE_SWAP`)
- `MellowDepositQueueAdapterContract` (`ADAPTER::MELLOW_DEPOSIT_QUEUE_QUEUE`)
- `MellowRedeemQueueAdapterContract` (`ADAPTER::MELLOW_REDEEM_QUEUE_QUEUE`)
- `CurveV1AdapterDeposit` (`ADAPTER::CURVE_V1_WRAPPER`)

Type-only entries removed from `AdapterType` / `AdapterContractType` (never had a class, not
deployed, no sources): `YEARN_V2`, `EQUALIZER_ROUTER`, `BALANCER_VAULT`, `INFRARED_VAULT`,
`KODIAK_ISLAND_GATEWAY`, `MELLOW_LRT_VAULT`.

Stale version entries pruned from `adapterConstructorAbi` / `adapterActionSignatures`:

- `ERC4626_VAULT@310`
- `MELLOW_ERC4626_VAULT@310`, `@311`
- `STAKING_REWARDS@310`, `@311`
- `CURVE_V1_2ASSETS@310`, `CURVE_V1_3ASSETS@310`, `CURVE_V1_4ASSETS@310`
- `CURVE_V1_STECRV_POOL@310`
- action signatures for `BALANCER_VAULT@310`, `EQUALIZER_ROUTER@310`, `KODIAK_ISLAND_GATEWAY@310`

## Adapters in integrations-v3 but missing from the SDK

The diff by `contractType` found **no missing adapters** — every concrete adapter in
`integrations-v3/contracts/adapters` already had an SDK class. However, it surfaced a naming bug:

- **Fixed:** the SDK used `ADAPTER::TRADER_JOE_ROUTER` while `TraderJoeRouterAdapter.sol` declares
  `ADAPTER::TRADERJOE_ROUTER`. The SDK `createAdapter` switch could therefore never match the real
  deployed contract type. Renamed everywhere in the SDK (`types.ts`, `createAdapter.ts`,
  `conctructorAbi.ts`, `actionAbi.ts`) to `TRADERJOE_ROUTER`.

## File-level changes

- **Added** [scripts/list-adapters.ts](scripts/list-adapters.ts) — multichain on-chain adapter inventory.
- **Added** `src/plugins/adapters/abi/adapters/` — 31 files with 36 vendored ABI constants
  (extracted verbatim from `@gearbox-protocol/integrations-v3@1.54.2` dist), re-exported from
  [src/plugins/adapters/abi/index.ts](src/plugins/adapters/abi/index.ts).
- **Added** [src/abi/ierc4626Adapter.ts](src/abi/ierc4626Adapter.ts) — `ierc4626AdapterAbi` lives in
  core `src/abi/` because `CreditAccountsServiceV310` (core SDK) uses it too; the adapters plugin
  imports it from there.
- **Rewrote imports** in all 34 remaining `src/plugins/adapters/contracts/*.ts` files and
  `src/sdk/accounts/CreditAccountsServiceV310.ts` from `@gearbox-protocol/integrations-v3` to local paths.
- **Deleted** 4 adapter classes (see "Dropped") and their entries in
  [createAdapter.ts](src/plugins/adapters/createAdapter.ts),
  [contracts/index.ts](src/plugins/adapters/contracts/index.ts),
  [types.ts](src/plugins/adapters/types.ts); also removed a duplicated Infinifi re-export in the index.
- **Pruned** [abi/conctructorAbi.ts](src/plugins/adapters/abi/conctructorAbi.ts),
  [abi/actionAbi.ts](src/plugins/adapters/abi/actionAbi.ts), and unused patterns
  (`CURVE_V1_WRAPPER_ADAPTER_ABI`, `MELLOW_DEPOSIT_QUEUE_ADAPTER_ABI`) in
  [abi/conctructorAbiPatterns.ts](src/plugins/adapters/abi/conctructorAbiPatterns.ts).
- **Removed dead duplicates** from [abi/targetContractAbi.ts](src/plugins/adapters/abi/targetContractAbi.ts):
  `iInfinifiUnwindingGatewayAbi`, `iMidasRedemptionVaultAdapterAbi`, `iUniswapV4GatewayAbi`,
  `iUpshiftVaultGatewayAbi` (superseded by the vendored copies).
- **Updated test** [classifyLegacyOperation.test.ts](src/plugins/adapters/classifyLegacyOperation.test.ts)
  (removed deleted `CurveV1AdapterDeposit` case).
- **Removed** `@gearbox-protocol/integrations-v3` from `dependencies` in [package.json](package.json).

## Behavioral notes

- `parseAdapterDeployParams` / `getAdapterDeployParamsAbi` no longer decode the dropped
  types/versions (e.g. historical `ERC4626_VAULT@310` deploy params). This is intentional per the
  keep rule.
- Unknown contract types still fall back to a generic `AbstractAdapterContract` (or
  `PlaceholderAdapterContract` at the SDK level) in non-strict mode, so hydrating old state does not throw.
