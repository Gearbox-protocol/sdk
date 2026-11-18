import { type Address, stringToHex } from "viem";
import { describe, expect, it } from "vitest";
import type { CreateMarketParams } from "../actions/actionTypes.js";
import {
  DEFAULT_RWA_UNDERLYING_TYPE,
  RWA_ZAPPER_CONTRACT_TYPE,
  SECURITIZE_RWA_FACTORY_TYPE,
} from "../rwaPeripherySetup.js";
import {
  createStubClient,
  createTestSdk,
  marketState,
  TIMELOCK,
  USDC,
} from "../testing/sdkHarness.js";

const FACTORY: Address = "0xfac0000000000000000000000000000000000001";
const NFT: Address = "0x0000000000000000000000000000000000000123";
const ZAPPER: Address = "0x2a00000000000000000000000000000000000001";

/** A client on which {@link USDC} is a Securitize default RWA underlying. **/
const rwaClient = (deployer: { owner?: unknown } = {}) =>
  createStubClient({
    client: { getCode: async () => undefined },
    readContract: args => {
      const address = args.address?.toLowerCase();
      switch (args.functionName) {
        case "contractType":
          if (address === USDC)
            return stringToHex(DEFAULT_RWA_UNDERLYING_TYPE, { size: 32 });
          if (address === FACTORY)
            return stringToHex(SECURITIZE_RWA_FACTORY_TYPE, { size: 32 });
          return undefined;
        case "getFactory":
          return address === USDC ? FACTORY : undefined;
        case "getDegenNFT":
          return address === FACTORY ? NFT : undefined;
        case "computeAddress":
          // @dev [contractType, version, encodedParams, salt, owner]
          deployer.owner = args.args?.[4];
          return ZAPPER;
        default:
          return undefined;
      }
    },
  });

const NEW_MARKET: CreateMarketParams = {
  minorVersion: 310,
  name: "Securitize USDC",
  symbol: "dUSDC",
  underlying: USDC,
  underlyingPriceFeed: "0x1010101010101010101010101010101010101010",
  interestRateModel: {
    type: "LINEAR",
    params: {
      U_1: 70,
      U_2: 90,
      R_base: 0,
      R_slope1: 5,
      R_slope2: 20,
      R_slope3: 100,
      isBorrowingMoreU2Forbidden: true,
    },
  },
  rateKeeperParams: { type: "TUMBLER", epochSeconds: 604_800 },
  lossPolicyParams: { type: "ALIAS" },
};

describe("addRwaPeriphery", () => {
  it("adds the Degen NFT, zapper deployment and zapper registration", async () => {
    const deployer: { owner?: unknown } = {};
    const { sdk } = await createTestSdk({ client: rwaClient(deployer) });
    const market = sdk
      .market({ initialState: marketState() })
      .addRwaPeriphery();
    const preview = await market.preview();
    expect(preview.inputActions).toMatchObject([
      {
        type: "MARKET::addPeripheryContract",
        params: { peripheryContract: NFT, domain: "DEGEN_NFT" },
      },
      {
        type: "BCR::deployContract",
        params: {
          contractType: RWA_ZAPPER_CONTRACT_TYPE,
          expectedAddress: ZAPPER,
        },
      },
      {
        type: "MARKET::addPeripheryContract",
        params: { peripheryContract: ZAPPER, domain: "ZAPPER" },
      },
    ]);
    // @dev the TimeLock deploys the zapper, so it owns the CREATE2 address
    expect(deployer.owner).toBe(TIMELOCK);
    expect(market.recordedActions()).toEqual([{ kind: "rwaPeriphery" }]);
  });

  it("adds nothing for an ordinary underlying, nor twice", async () => {
    const { sdk } = await createTestSdk();
    const ordinary = await sdk
      .market({ initialState: marketState() })
      .addRwaPeriphery()
      .preview();
    expect(ordinary.inputActions).toEqual([]);

    const { sdk: rwa } = await createTestSdk({ client: rwaClient() });
    const twice = await rwa
      .market({ initialState: marketState() })
      .addRwaPeriphery()
      .addRwaPeriphery()
      .preview();
    expect(twice.inputActions).toHaveLength(3);
  });

  it("follows the createMarket action of a new market", async () => {
    const { sdk } = await createTestSdk({
      client: rwaClient(),
      marketSuite: null,
    });
    const preview = await sdk
      .newMarket(NEW_MARKET)
      .addRwaPeriphery()
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 1_000 } })
      .preview();
    expect(preview.inputActions.map(action => action.type)).toEqual([
      "MARKET::createMarket",
      "MARKET::addPeripheryContract",
      "BCR::deployContract",
      "MARKET::addPeripheryContract",
      "POOL::setTotalDebtLimit",
    ]);
  });
});
