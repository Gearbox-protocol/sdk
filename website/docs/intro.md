# Gearbox SDK

Core types and utilities for [Gearbox Protocol](https://gearbox.fi).

## Installation

```bash
npm install @gearbox-protocol/sdk
# or
yarn add @gearbox-protocol/sdk
```

## Modules

The SDK is organized into several modules, each available as a separate entry point:

| Module | Import | Description |
|--------|--------|-------------|
| **SDK** | `@gearbox-protocol/sdk` | Main SDK — markets, pools, accounts, router, chain config |
| **Dev Utilities** | `@gearbox-protocol/sdk/dev` | Development helpers — RPC providers, error handling, minting |
| **History** | `@gearbox-protocol/sdk/history` | History parsing and operation mapping |
| **Permissionless** | `@gearbox-protocol/sdk/permissionless` | Permissionless deployment flows and bindings |
| **Common Utils** | `@gearbox-protocol/sdk/common-utils` | Shared utilities used across modules |
| **Plugins** | `@gearbox-protocol/sdk/plugins/*` | Optional add-ons: adapters, zappers, bots, and more |
| **Rewards** | `@gearbox-protocol/sdk/rewards/*` | Rewards and APY |

## Quick Start

```typescript
import { GearboxSDK } from "@gearbox-protocol/sdk";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const sdk = await GearboxSDK.attach({ client });
```

## API Reference

Browse the auto-generated API reference for each module in the sidebar.
