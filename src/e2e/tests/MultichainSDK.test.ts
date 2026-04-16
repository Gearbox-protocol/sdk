import { beforeAll, expect, it } from "vitest";
import { getAlchemyUrl } from "../../dev/providers.js";
import { MultichainSDK, type NetworkType } from "../../sdk/index.js";

function requireUrl(network: NetworkType): string {
  const url = getAlchemyUrl(network, process.env.ALCHEMY_KEY);
  if (!url) {
    throw new Error(`No Alchemy URL for ${network}`);
  }
  return url;
}

const MAINNET_RPC = requireUrl("Mainnet");
const PLASMA_RPC = requireUrl("Plasma");

let sdk: MultichainSDK;

beforeAll(async () => {
  sdk = new MultichainSDK({
    chains: {
      Mainnet: { rpcURLs: [MAINNET_RPC], timeout: 120_000 },
      Plasma: { rpcURLs: [PLASMA_RPC], timeout: 120_000 },
    },
  });
  await sdk.attach({
    perChain: {
      Mainnet: { ignoreUpdateablePrices: true },
      Plasma: { ignoreUpdateablePrices: true },
    },
  });
}, 120_000);

it("both chains have markets loaded", () => {
  expect(sdk.chain("Mainnet").marketRegister.markets.length).toBeGreaterThan(0);
  expect(sdk.chain("Plasma").marketRegister.markets.length).toBeGreaterThan(0);
});

it("chain() works by chainId after attach", () => {
  expect(sdk.chain(1).networkType).toBe("Mainnet");
  expect(sdk.chain(9745).networkType).toBe("Plasma");
});

it("state round-trip via hydrate", () => {
  const state = sdk.state;

  const sdk2 = new MultichainSDK({
    chains: {
      Mainnet: { rpcURLs: [MAINNET_RPC], timeout: 120_000 },
      Plasma: { rpcURLs: [PLASMA_RPC], timeout: 120_000 },
    },
  });
  sdk2.hydrate(state);

  const human1 = sdk.stateHuman();
  const human2 = sdk2.stateHuman();
  expect(human1).toEqual(human2);
});

it("hydrate with allowMissingChains then attach missing chain", async () => {
  const state = sdk.state;
  const partialState = {
    ...state,
    chains: state.chains.filter(c => c.network !== "Plasma"),
  };

  const sdk2 = new MultichainSDK({
    chains: {
      Mainnet: { rpcURLs: [MAINNET_RPC], timeout: 120_000 },
      Plasma: { rpcURLs: [PLASMA_RPC], timeout: 120_000 },
    },
  });

  sdk2.hydrate(partialState, { allowMissingChains: true });

  expect(sdk2.chain("Mainnet").attached).toBe(true);
  expect(sdk2.chain("Plasma").attached).toBe(false);

  await sdk2.chain("Plasma").attach({
    ignoreUpdateablePrices: true,
  });

  expect(sdk2.chain("Plasma").attached).toBe(true);
  expect(sdk2.chain("Mainnet").marketRegister.markets.length).toBeGreaterThan(
    0,
  );
  expect(sdk2.chain("Plasma").marketRegister.markets.length).toBeGreaterThan(0);
}, 120_000);
