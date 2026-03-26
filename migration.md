# Migration Guide: Shared Register Bug Fix

## Overview

This release fixes a bug where calling `GearboxSDK.attach()` twice for the same chain corrupted the first SDK instance. The root cause was a process-wide singleton (`ChainContractsRegister.for()`) whose internal state was shared across SDK instances via `Object.assign`.

## Breaking Changes

### `ChainContractsRegister.for()` removed

The static factory method `ChainContractsRegister.for(client)` has been removed along with the internal `static #chains` singleton map.

**Before:**

```typescript
const register = ChainContractsRegister.for(client);
```

**After:**

```typescript
const register = new ChainContractsRegister(client);
```

### `CrossChainMultisigContract` and `InstanceManagerContract` now require `register`

These two classes now require a `ChainContractsRegister` as the third constructor argument. This is needed because they use `register.parseFunctionData()` internally to parse cross-contract calls (e.g., in `getBatchData()` and `mustParseFunctionData()`).

**Before:**

```typescript
const ccm = new CrossChainMultisigContract(ccmAddress, client);
const im = new InstanceManagerContract(imAddress, client);
```

**After:**

```typescript
const register = new ChainContractsRegister(client);
const ccm = new CrossChainMultisigContract(ccmAddress, client, register);
const im = new InstanceManagerContract(imAddress, client, register);
```

Contracts auto-register themselves in the shared register on construction, so `register.parseFunctionData()` can resolve any contract you've created with that register.

### `Construct.register` may throw

`Construct` (the base class for all SDK contracts) no longer guarantees that `this.register` is always available. If a subclass is constructed with `{ client }` instead of `{ register }`, accessing `this.register` will throw. This only affects code that creates `BaseContract` subclasses without a register.

- **SDK-internal path** (`SDKConstruct` and its subclasses): unaffected, register is always the SDK itself.
- **Permissionless path** (most classes like `BytecodeRepositoryContract`, `PriceFeedStoreContract`, etc.): unaffected, these classes don't access `this.register`.
- **CCM and IM**: now require register, so `this.register` is always available for them.

### `labelAddress` behavior without register

When a `BaseContract` is constructed without a register, `labelAddress()` returns the raw address string instead of a labeled version. This is a cosmetic difference only and does not affect contract functionality.

## Non-Breaking Changes

All other permissionless class constructors remain `(addr, client)` and are unaffected:

- `AddressProviderContract`
- `BytecodeRepositoryContract`
- `GovernorContract`
- `MarketConfiguratorContract`
- `MarketConfiguratorFactoryContract`
- `PriceFeedStoreContract`
- `RoutingManagerContract`
- `TokenCompressorContract`
- `TreasurySplitterContract`
- `WithdrawalCompressorContract`

## Migration Examples

### Typical permissionless app setup

```typescript
import { ChainContractsRegister } from "@gearbox-protocol/sdk";
import {
  AddressProviderContract,
  BytecodeRepositoryContract,
  CrossChainMultisigContract,
  InstanceManagerContract,
} from "@gearbox-protocol/sdk/permissionless";

const register = new ChainContractsRegister(client);
const ap = new AddressProviderContract(apAddress, client);

const [bcrAddr, imAddr, ccmAddr] = await Promise.all([
  ap.getAddressOrRevert(BYTECODE_REPOSITORY, 0n),
  ap.getAddressOrRevert(INSTANCE_MANAGER, 0n),
  ap.getAddressOrRevert(CROSS_CHAIN_GOVERNANCE, 0n),
]);

const bcr = new BytecodeRepositoryContract(bcrAddr, client);
const im = new InstanceManagerContract(imAddr, client, register);
const ccm = new CrossChainMultisigContract(ccmAddr, client, register);
```

### Replacing `ChainContractsRegister.for()` for call parsing

**Before (gov app):**

```typescript
const parsedCalls = batch.calls.map(c => ({
  ...ChainContractsRegister.for(client).parseFunctionData(c.target, c.callData),
  chainId: c.chainId,
}));
```

**After:** Use `batch.parsedCalls` returned by `getBatchData()`:

```typescript
const parsedCalls = batch.parsedCalls.map((pc, i) => ({
  ...pc,
  chainId: batch.calls[i].chainId,
}));
```

### Backend: remove `_im` side-effect trick

The pattern of creating an unused `InstanceManagerContract` purely to populate the shared register is no longer needed:

**Before:**

```typescript
const ccm = new CrossChainMultisigContract(CCM_ADDRESS, client);
const _im = new InstanceManagerContract(IM_ADDRESS, client); // side-effect only
```

**After:**

```typescript
const register = new ChainContractsRegister(client);
const ccm = new CrossChainMultisigContract(CCM_ADDRESS, client, register);
const im = new InstanceManagerContract(IM_ADDRESS, client, register);
```
