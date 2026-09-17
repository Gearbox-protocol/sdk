# Adapter safe-price sources and exceptions

Source notes for the proposed [action eligibility design](./plans/action-limits-and-execution-eligibility.md).
Classification should describe the adapter's return **if the call succeeds**,
not execution validity. The facade ORs these flags; false never clears an
earlier true. Use actual calldata to select the ABI overload. Unreviewed versions,
getters, administration and reverting-only methods should remain unsupported.

## Reviewed source snapshots

- [Integrations 39e70f05](https://github.com/Gearbox-protocol/integrations-v3/tree/39e70f05e09ef4224febb3a8c9890afe48adbec9/contracts/adapters) supplies the older adapter layout and Infinifi/Upshift.
- [Integrations 096d9b18](https://github.com/Gearbox-protocol/integrations-v3/tree/096d9b18f943de1ee73b28daa530f27f31f57577/contracts/integrations) is the integration dependency checked out by periphery; it supplies Midas Gateway and the newer Midas/Securitize versions.
- [Kelp before removal, 48efe2f7](https://github.com/Gearbox-protocol/integrations-v3/tree/48efe2f73c00bcb34976ae29768c32a8321c6e8b/contracts/adapters/kelp) supplies both Kelp v310 implementations.
- [ERC4626 v310, d9934d77](https://github.com/Gearbox-protocol/integrations-v3/blob/d9934d77657878f60ba81ecd73546a6a4aaf833a/contracts/adapters/erc4626/ERC4626Adapter.sol) and [v311, 574b1fba](https://github.com/Gearbox-protocol/integrations-v3/blob/574b1fba045183714f2df205a62dfba9d803ebcb/contracts/adapters/erc4626/ERC4626Adapter.sol) supply historical plain-vault return behavior.
- [Account migrator v310](https://github.com/Gearbox-protocol/periphery-v3/blob/7f87c6502819c95d0faba464836fc57c1cd80608/contracts/migration/AccountMigratorAdapterV31.sol) is supplied by periphery.

## Exceptions to preserve when updating rules

- Diff methods normally return false when input balance is at most the leftover,
  true otherwise. Kelp uses strict `<`: equality executes and returns true if
  successful. Balancer V3 router diff methods always return true; wrappers and
  staking methods can always return false. Names alone do not determine flags.
- ERC4626 v312 dispatches virtual internals. Mellow v312 withdrawals return true,
  except inherited `redeemDiff` no-ops return false. Upshift withdraw/redeem and
  Mellow DVV deposit/mint overrides revert; their executing paths are unsupported,
  even when an inherited diff method can no-op.
- Curve v311 variants inherit `CurveV1_Base`; stETH overrides preserve its flags.
  Signed/unsigned index overloads agree, as do Midas Gateway request overloads.
- Securitize `claim`/`transferRedeemer` change from false in v310 to true in v311.
  Midas Redemption v311 removes v310's request and withdrawal operations.
- Mellow ERC4626 v311 is unsupported: [574b1fba](https://github.com/Gearbox-protocol/integrations-v3/commit/574b1fba045183714f2df205a62dfba9d803ebcb)
  changed flags without a version bump, including true on `redeemDiff` no-ops.
  Curve v310 also [changed without a bump](https://github.com/Gearbox-protocol/integrations-v3/commit/3cbf8bfbbc7837b23864ad9e5eca5ac65958d8ce).
  These need runtime-code identity or a verified deployment inventory; do not
  extrapolate from later versions or assume numeric version ranges are safe.

## State-dependent calls

Use guaranteed pre-call balance bounds, never expected quote outputs. Resolve a
branch only when the entire range lies on one side; overlapping or invalid
ranges remain state-dependent. Missing metadata and getter errors are not zero.
Kelp withdrawal needs rsETH, native Uniswap V4 needs WETH, and two Pendle methods
need PT from `market.readTokens()`/`YT.PT()`; available balances alone may not
resolve these calls. Future withdrawal schedules are outside the classifier;
classify request or claim calldata when it is executable.
