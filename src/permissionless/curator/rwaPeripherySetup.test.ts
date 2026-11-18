import assert from "node:assert/strict";
import { type Address, encodeAbiParameters, type Hex, stringToHex } from "viem";
import { describe, it } from "vitest";
import {
  type ContractReader,
  DEFAULT_DEPLOY_SALT,
  DEFAULT_RWA_UNDERLYING_TYPE,
  findIncompleteRwaPeripherySetups,
  getRwaZapperDeployAction,
  getRwaZapperDeployParams,
  insertRwaZapperDeployment,
  isRwaZapperRegistration,
  ON_DEMAND_RWA_UNDERLYING_TYPE,
  parseContractType,
  planRwaPeripheryActions,
  RWA_UNDERLYING_TYPE_PREFIX,
  RWA_ZAPPER_CONTRACT_TYPE,
  RWA_ZAPPER_VERSION,
  type RwaZapperDeployParams,
  readContractType,
  reconcileRwaPeripheryActions,
  resolveSecuritizeRwaSetup,
  SECURITIZE_RWA_FACTORY_TYPE,
} from "../index.js";
import type { DeployContractAction } from "./actions/deployContractActionData.js";
import type { MarketActions } from "./actions/types.js";

const UNDERLYING = "0xaaaa000000000000000000000000000000000001" as Address;
const FACTORY = "0xaaaa000000000000000000000000000000000002" as Address;
const DEGEN_NFT = "0xaaaa000000000000000000000000000000000003" as Address;
const POOL = "0xaaaa000000000000000000000000000000000004" as Address;
const AUTHOR = "0xaaaa000000000000000000000000000000000005" as Address;
const ZAPPER = "0xaaaa000000000000000000000000000000000006" as Address;
const STRANGER = "0xaaaa000000000000000000000000000000000007" as Address;
/** `MarketConfigurator.admin()` — the caller of `BytecodeRepository.deploy()`. */
const TIMELOCK = "0xaaaa000000000000000000000000000000000008" as Address;

/** `abi.encode(pool)`: the zapper constructor parameters of {@link POOL}. */
const POOL_PARAMS = encodeAbiParameters([{ type: "address" }], [POOL]);

/** Sentinel telling the fake reader to behave like a reverting call. */
const REVERT = Symbol("revert");

type FakeContracts = Record<
  string,
  Record<string, string | typeof REVERT | undefined>
>;

function makeReader(contracts: FakeContracts): ContractReader {
  return async ({ address, functionName }) => {
    const contract = contracts[address.toLowerCase()];
    const value = contract?.[functionName];
    if (value === undefined || value === REVERT) {
      throw new Error(`call to ${functionName} on ${address} reverted`);
    }
    return value;
  };
}

const asType = (label: string): Hex => stringToHex(label, { size: 32 });

/** An ordinary ERC-20: every RWA getter reverts. */
const plainToken: FakeContracts = {};

const securitizeContracts = (
  underlyingType: string,
  overrides: FakeContracts = {},
): FakeContracts => ({
  [UNDERLYING.toLowerCase()]: {
    contractType: asType(underlyingType),
    getFactory: FACTORY,
  },
  [FACTORY.toLowerCase()]: {
    contractType: asType(SECURITIZE_RWA_FACTORY_TYPE),
    getDegenNFT: DEGEN_NFT,
  },
  ...overrides,
});

function plan(args: {
  contracts: FakeContracts;
  queuedActions?: MarketActions[];
  registered?: { address: Address; domain: string }[];
  deployed?: boolean;
  onComputeZapper?: (params: RwaZapperDeployParams) => void;
  onGetDeployer?: () => void;
}) {
  return planRwaPeripheryActions({
    read: makeReader(args.contracts),
    underlying: UNDERLYING,
    pool: POOL,
    queuedActions: args.queuedActions,
    getRegistered: async () => args.registered ?? [],
    getDeployer: async () => {
      args.onGetDeployer?.();
      return TIMELOCK;
    },
    isDeployed: async () => args.deployed ?? false,
    computeZapperAddress: async params => {
      args.onComputeZapper?.(params);
      return ZAPPER;
    },
  });
}

/** Compact, order-preserving view of a planned action list. */
const summarize = (actions: MarketActions[]) =>
  actions.map(action =>
    action.type === "MARKET::addPeripheryContract"
      ? `register:${action.params.domain}`
      : action.type === "BCR::deployContract"
        ? `deploy:${action.params.contractType}`
        : action.type,
  );

describe("parseContractType / readContractType", () => {
  it("decodes a bytes32 contract type", () => {
    assert.equal(
      parseContractType(asType(SECURITIZE_RWA_FACTORY_TYPE)),
      SECURITIZE_RWA_FACTORY_TYPE,
    );
  });

  it("returns null when contractType() reverts", async () => {
    assert.equal(await readContractType(makeReader({}), UNDERLYING), null);
  });
});

describe("resolveSecuritizeRwaSetup", () => {
  it("skips ordinary ERC-20 underlyings", async () => {
    assert.equal(
      await resolveSecuritizeRwaSetup({
        read: makeReader(plainToken),
        underlying: UNDERLYING,
      }),
      null,
    );
  });

  it("skips underlyings without a factory", async () => {
    assert.equal(
      await resolveSecuritizeRwaSetup({
        read: makeReader({
          [UNDERLYING.toLowerCase()]: {
            contractType: asType(DEFAULT_RWA_UNDERLYING_TYPE),
            getFactory: REVERT,
          },
        }),
        underlying: UNDERLYING,
      }),
      null,
    );
  });

  it("skips non-RWA contract types even when they expose a Securitize factory", async () => {
    const setup = await resolveSecuritizeRwaSetup({
      read: makeReader(securitizeContracts("TOKEN::WITH_SECURITIZE_FACTORY")),
      underlying: UNDERLYING,
    });
    assert.equal(setup, null);
    assert.equal(
      DEFAULT_RWA_UNDERLYING_TYPE.startsWith(RWA_UNDERLYING_TYPE_PREFIX),
      true,
    );
  });

  it("skips factories that are not RWA_FACTORY::SECURITIZE", async () => {
    assert.equal(
      await resolveSecuritizeRwaSetup({
        read: makeReader({
          ...securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
          [FACTORY.toLowerCase()]: {
            contractType: asType("RWA_FACTORY::SOMETHING_ELSE"),
            getDegenNFT: DEGEN_NFT,
          },
        }),
        underlying: UNDERLYING,
      }),
      null,
    );
  });

  it("resolves a default Securitize underlying", async () => {
    const setup = await resolveSecuritizeRwaSetup({
      read: makeReader(securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE)),
      underlying: UNDERLYING,
    });
    assert.deepEqual(setup, {
      underlyingType: DEFAULT_RWA_UNDERLYING_TYPE,
      factory: FACTORY,
      degenNFT: DEGEN_NFT,
      needsZapper: true,
    });
  });

  it("does not request a zapper for on-demand or unknown subtypes", async () => {
    for (const subtype of [
      ON_DEMAND_RWA_UNDERLYING_TYPE,
      "RWA_UNDERLYING::SOMETHING_NEW",
    ]) {
      const setup = await resolveSecuritizeRwaSetup({
        read: makeReader(securitizeContracts(subtype)),
        underlying: UNDERLYING,
      });
      assert.equal(setup?.needsZapper, false, subtype);
    }
  });

  it("fails loudly when a Securitize factory has no Degen NFT", async () => {
    await assert.rejects(
      () =>
        resolveSecuritizeRwaSetup({
          read: makeReader(
            securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE, {
              [FACTORY.toLowerCase()]: {
                contractType: asType(SECURITIZE_RWA_FACTORY_TYPE),
                getDegenNFT: REVERT,
              },
            }),
          ),
          underlying: UNDERLYING,
        }),
      /Failed to resolve the Degen NFT/,
    );
  });
});

describe("getRwaZapperDeployParams", () => {
  it("matches DeploySecuritizeContracts.s.sol", () => {
    const params = getRwaZapperDeployParams({ pool: POOL, owner: AUTHOR });
    assert.equal(params.contractType, RWA_ZAPPER_CONTRACT_TYPE);
    assert.equal(params.version, RWA_ZAPPER_VERSION);
    assert.equal(params.owner, AUTHOR);
    assert.equal(params.salt, DEFAULT_DEPLOY_SALT);
    assert.equal(params.salt, stringToHex("SALT", { size: 32 }));
    assert.equal(params.encodedParams, POOL_PARAMS);
  });
});

describe("getRwaZapperDeployAction", () => {
  it("persists everything the BCR transaction needs", () => {
    const params = getRwaZapperDeployParams({ pool: POOL, owner: TIMELOCK });
    assert.deepEqual(
      getRwaZapperDeployAction({ params, expectedAddress: ZAPPER }),
      {
        type: "BCR::deployContract",
        params: {
          contractType: RWA_ZAPPER_CONTRACT_TYPE,
          version: RWA_ZAPPER_VERSION,
          constructorParams: POOL_PARAMS,
          salt: DEFAULT_DEPLOY_SALT,
          expectedAddress: ZAPPER,
        },
      },
    );
  });
});

describe("planRwaPeripheryActions", () => {
  it("adds nothing for a normal ERC-20 underlying", async () => {
    let computed = false;
    let deployerRead = false;
    const actions = await plan({
      contracts: plainToken,
      onComputeZapper: () => {
        computed = true;
      },
      onGetDeployer: () => {
        deployerRead = true;
      },
    });
    assert.deepEqual(actions, []);
    assert.equal(computed, false);
    // reading MarketConfigurator.admin() is an extra RPC call ordinary markets
    // must not pay for
    assert.equal(deployerRead, false);
  });

  it("deploys and registers in order for a default underlying", async () => {
    let seen: RwaZapperDeployParams | undefined;
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      onComputeZapper: params => {
        seen = params;
      },
    });

    assert.deepEqual(actions, [
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: DEGEN_NFT,
          domain: "DEGEN_NFT",
          type: "",
        },
      },
      {
        type: "BCR::deployContract",
        params: {
          contractType: RWA_ZAPPER_CONTRACT_TYPE,
          version: RWA_ZAPPER_VERSION,
          constructorParams: POOL_PARAMS,
          salt: DEFAULT_DEPLOY_SALT,
          expectedAddress: ZAPPER,
        },
      },
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: ZAPPER,
          domain: "ZAPPER",
          type: RWA_ZAPPER_CONTRACT_TYPE,
        },
      },
    ]);

    // deterministic parameters: previewed pool, default salt, and the TimeLock
    // as deployer — governance executes the deploy through MarketConfigurator
    // .admin(), so that is the BCR's msg.sender
    assert.equal(seen?.encodedParams, POOL_PARAMS);
    assert.equal(seen?.owner, TIMELOCK);
    assert.notEqual(seen?.owner, AUTHOR);
    assert.equal(seen?.salt, DEFAULT_DEPLOY_SALT);
    assert.equal(seen?.contractType, RWA_ZAPPER_CONTRACT_TYPE);
    assert.equal(seen?.version, RWA_ZAPPER_VERSION);
  });

  it("skips the deployment when the zapper already has bytecode", async () => {
    // a deployed-but-unregistered zapper still gets its registration action
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      deployed: true,
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      "register:ZAPPER",
    ]);
  });

  it("skips the deployment when an equivalent one is queued in the GIP", async () => {
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      queuedActions: [
        {
          type: "BCR::deployContract",
          params: {
            contractType: RWA_ZAPPER_CONTRACT_TYPE,
            version: RWA_ZAPPER_VERSION,
            constructorParams: POOL_PARAMS,
            salt: DEFAULT_DEPLOY_SALT,
            expectedAddress: ZAPPER,
          },
        },
      ],
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      "register:ZAPPER",
    ]);
  });

  it("still queues the deployment when only the registration is queued", async () => {
    // suppression is independent: a queued registration says nothing about a
    // missing deployment
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      queuedActions: [
        {
          type: "MARKET::addPeripheryContract",
          params: {
            peripheryContract: ZAPPER,
            domain: "ZAPPER",
            type: RWA_ZAPPER_CONTRACT_TYPE,
          },
        },
      ],
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
    ]);
  });

  it("skips a Degen NFT that is already registered on chain", async () => {
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      registered: [{ address: DEGEN_NFT, domain: "DEGEN_NFT" }],
    });
    assert.deepEqual(summarize(actions), [
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
      "register:ZAPPER",
    ]);
  });

  it("skips a Degen NFT that is already queued in the same GIP", async () => {
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      queuedActions: [
        {
          type: "MARKET::addPeripheryContract",
          params: {
            peripheryContract: DEGEN_NFT,
            domain: "DEGEN_NFT",
            type: "",
          },
        },
      ],
    });
    assert.deepEqual(summarize(actions), [
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
      "register:ZAPPER",
    ]);
  });

  it("skips a zapper registration that is already registered on chain", async () => {
    const actions = await plan({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
      registered: [{ address: ZAPPER, domain: "ZAPPER" }],
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
    ]);
  });

  it("adds only the Degen NFT for on-demand underlyings", async () => {
    let computed = false;
    let deployerRead = false;
    const actions = await plan({
      contracts: securitizeContracts(ON_DEMAND_RWA_UNDERLYING_TYPE),
      onComputeZapper: () => {
        computed = true;
      },
      onGetDeployer: () => {
        deployerRead = true;
      },
    });
    assert.deepEqual(summarize(actions), ["register:DEGEN_NFT"]);
    assert.equal(computed, false);
    assert.equal(deployerRead, false);
  });

  it("adds only the Degen NFT for unknown RWA subtypes", async () => {
    const actions = await plan({
      contracts: securitizeContracts("RWA_UNDERLYING::SOMETHING_NEW"),
    });
    assert.deepEqual(summarize(actions), ["register:DEGEN_NFT"]);
  });

  it("adds nothing for a non-Securitize RWA factory", async () => {
    const actions = await plan({
      contracts: {
        ...securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
        [FACTORY.toLowerCase()]: {
          contractType: asType("RWA_FACTORY::OTHER"),
          getDegenNFT: DEGEN_NFT,
        },
      },
    });
    assert.deepEqual(actions, []);
  });
});

describe("isRwaZapperRegistration", () => {
  it("recognizes only the RWA zapper registration", () => {
    const actions: MarketActions[] = [
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: DEGEN_NFT,
          domain: "DEGEN_NFT",
          type: "",
        },
      },
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: ZAPPER,
          domain: "ZAPPER",
          type: RWA_ZAPPER_CONTRACT_TYPE,
        },
      },
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: STRANGER,
          domain: "ZAPPER",
          type: "ZAPPER::SOMETHING_ELSE",
        },
      },
    ];
    assert.deepEqual(
      actions.filter(isRwaZapperRegistration).map(action => action.params),
      [
        {
          peripheryContract: ZAPPER,
          domain: "ZAPPER",
          type: RWA_ZAPPER_CONTRACT_TYPE,
        },
      ],
    );
  });
});

const zapperAction = (zapper: Address): MarketActions => ({
  type: "MARKET::addPeripheryContract",
  params: {
    peripheryContract: zapper,
    domain: "ZAPPER",
    type: RWA_ZAPPER_CONTRACT_TYPE,
  },
});

const degenAction: MarketActions = {
  type: "MARKET::addPeripheryContract",
  params: { peripheryContract: DEGEN_NFT, domain: "DEGEN_NFT", type: "" },
};

const deployAction = (expectedAddress: Address): DeployContractAction =>
  getRwaZapperDeployAction({
    params: getRwaZapperDeployParams({ pool: POOL, owner: TIMELOCK }),
    expectedAddress,
  });

/** Address a legacy GIP derived from its author and can no longer produce. */
const LEGACY_ZAPPER = "0xaaaa000000000000000000000000000000000009" as Address;
const OTHER_POOL = "0xaaaa00000000000000000000000000000000000a" as Address;
const OTHER_UNDERLYING =
  "0xaaaa00000000000000000000000000000000000b" as Address;

const market = (
  address: Address,
  transactions: MarketActions[],
  underlyingAsset: Address = UNDERLYING,
) => ({ address, underlyingAsset, transactions });

/** A second Securitize market: same factory, hence the same Degen NFT. */
const twoMarketContracts = (
  underlyingType: string = DEFAULT_RWA_UNDERLYING_TYPE,
): FakeContracts => ({
  ...securitizeContracts(underlyingType),
  [OTHER_UNDERLYING.toLowerCase()]: {
    contractType: asType(underlyingType),
    getFactory: FACTORY,
  },
});

function findIncomplete(args: {
  markets: ReturnType<typeof market>[];
  contracts?: FakeContracts;
  registered?: { address: Address; domain: string }[];
  deployed?: readonly Address[];
  onGetDeployer?: () => void;
  onComputeZapper?: (params: RwaZapperDeployParams) => void;
  onIsDeployed?: () => void;
  onGetRegistered?: () => void;
}) {
  return findIncompleteRwaPeripherySetups({
    markets: args.markets,
    read: makeReader(
      args.contracts ?? securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE),
    ),
    getDeployer: async () => {
      args.onGetDeployer?.();
      return TIMELOCK;
    },
    computeZapperAddress: async params => {
      args.onComputeZapper?.(params);
      // the deterministic address depends on the pool the zapper is built for
      return params.encodedParams === POOL_PARAMS ? ZAPPER : STRANGER;
    },
    isDeployed: async address => {
      args.onIsDeployed?.();
      return (args.deployed ?? []).some(
        deployed => deployed.toLowerCase() === address.toLowerCase(),
      );
    },
    getRegistered: async () => {
      args.onGetRegistered?.();
      return args.registered ?? [];
    },
  });
}

/** The missing requirements of a single market, in order. */
const kinds = async (
  args: Parameters<typeof findIncomplete>[0],
): Promise<string[]> => {
  const found = await findIncomplete(args);
  return found.flatMap(entry =>
    entry.plan.missing.map(requirement => requirement.kind),
  );
};

describe("findIncompleteRwaPeripherySetups", () => {
  it("reports all three requirements of an untouched default market in order", async () => {
    let seen: RwaZapperDeployParams | undefined;
    const found = await findIncomplete({
      markets: [market(POOL, [])],
      onComputeZapper: params => {
        seen = params;
      },
    });

    assert.equal(found.length, 1);
    assert.equal(found[0].market.address, POOL);
    assert.deepEqual(
      found[0].plan.missing.map(({ kind }) => kind),
      ["degenNftRegistration", "zapperDeployment", "zapperRegistration"],
    );
    assert.equal(found[0].plan.underlyingType, DEFAULT_RWA_UNDERLYING_TYPE);
    assert.equal(found[0].plan.degenNFT, DEGEN_NFT);
    assert.equal(found[0].plan.zapper, ZAPPER);

    // the actions are exactly the ones a freshly created market gets, in the
    // order they have to execute
    assert.deepEqual(
      summarize(found[0].plan.missing.map(({ action }) => action)),
      [
        "register:DEGEN_NFT",
        `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
        "register:ZAPPER",
      ],
    );
    assert.deepEqual(found[0].plan.missing[1].action, deployAction(ZAPPER));

    // deterministic parameters: the pool, default salt, v310 and the TimeLock —
    // never the GIP author, whose address nobody can deploy from any more
    assert.equal(seen?.encodedParams, POOL_PARAMS);
    assert.equal(seen?.salt, DEFAULT_DEPLOY_SALT);
    assert.equal(seen?.version, RWA_ZAPPER_VERSION);
    assert.equal(seen?.owner, TIMELOCK);
    assert.notEqual(seen?.owner, AUTHOR);
  });

  it("reports only the Degen NFT registration when the zapper is done", async () => {
    assert.deepEqual(
      await kinds({
        markets: [market(POOL, [deployAction(ZAPPER), zapperAction(ZAPPER)])],
      }),
      ["degenNftRegistration"],
    );
  });

  it("reports only the deployment when the zapper is registered", async () => {
    const found = await findIncomplete({
      markets: [market(POOL, [degenAction, zapperAction(ZAPPER)])],
    });
    assert.deepEqual(
      found[0].plan.missing.map(({ kind }) => kind),
      ["zapperDeployment"],
    );
    assert.deepEqual(found[0].plan.missing[0].action, deployAction(ZAPPER));
  });

  it("reports only the registration when the zapper deployment is queued", async () => {
    assert.deepEqual(
      await kinds({
        markets: [market(POOL, [degenAction, deployAction(ZAPPER)])],
      }),
      ["zapperRegistration"],
    );
  });

  it("reports only the registration for a deployed but unregistered zapper", async () => {
    assert.deepEqual(
      await kinds({
        markets: [market(POOL, [degenAction])],
        deployed: [ZAPPER],
      }),
      ["zapperRegistration"],
    );
  });

  it("stays silent for a market whose setup is complete on chain", async () => {
    const found = await findIncomplete({
      markets: [market(POOL, [])],
      registered: [
        { address: DEGEN_NFT, domain: "DEGEN_NFT" },
        { address: ZAPPER, domain: "ZAPPER" },
      ],
      deployed: [ZAPPER],
    });
    assert.deepEqual(found, []);
  });

  it("stays silent when everything is queued in the GIP", async () => {
    const found = await findIncomplete({
      markets: [
        market(POOL, [degenAction, deployAction(ZAPPER), zapperAction(ZAPPER)]),
      ],
    });
    assert.deepEqual(found, []);
  });

  it("counts registrations and deployments queued for another market", async () => {
    // periphery is registered per configurator and the Bytecode Repository is
    // global, so a sibling market's actions satisfy these requirements
    const found = await findIncomplete({
      contracts: twoMarketContracts(),
      markets: [
        market(POOL, [degenAction, deployAction(ZAPPER), zapperAction(ZAPPER)]),
        market(OTHER_POOL, [], OTHER_UNDERLYING),
      ],
    });

    assert.equal(found.length, 1);
    assert.equal(found[0].market.address, OTHER_POOL);
    // the shared Degen NFT is already queued; only its own zapper is missing
    assert.deepEqual(
      found[0].plan.missing.map(({ kind }) => kind),
      ["zapperDeployment", "zapperRegistration"],
    );
    assert.equal(found[0].plan.zapper, STRANGER);
  });

  it("reports the TimeLock-derived zapper for a legacy registration", async () => {
    // the queued address was derived from the GIP author: deploying it is
    // impossible, so the correct address is reported as missing instead
    const found = await findIncomplete({
      markets: [market(POOL, [degenAction, zapperAction(LEGACY_ZAPPER)])],
      deployed: [LEGACY_ZAPPER],
    });
    assert.deepEqual(
      found[0].plan.missing.map(({ kind }) => kind),
      ["zapperDeployment", "zapperRegistration"],
    );
    assert.deepEqual(
      found[0].plan.missing.map(({ address }) => address),
      [ZAPPER, ZAPPER],
    );
  });

  it("asks only for the Degen NFT of an on-demand market", async () => {
    // on-demand underlyings also need setPool and depositor authorization, so
    // their zapper is deliberately left out of the automation
    const found = await findIncomplete({
      contracts: securitizeContracts(ON_DEMAND_RWA_UNDERLYING_TYPE),
      markets: [market(POOL, [])],
    });
    assert.deepEqual(
      found[0].plan.missing.map(({ kind }) => kind),
      ["degenNftRegistration"],
    );
    assert.equal(found[0].plan.zapper, null);
  });

  it("ignores ordinary ERC-20 markets without extra RPC calls", async () => {
    let calls = 0;
    const count = () => {
      calls += 1;
    };
    const found = await findIncomplete({
      contracts: plainToken,
      markets: [market(POOL, [])],
      onGetDeployer: count,
      onComputeZapper: count,
      onIsDeployed: count,
      onGetRegistered: count,
    });
    assert.deepEqual(found, []);
    assert.equal(calls, 0);
  });

  it("ignores RWA markets served by a non-Securitize factory", async () => {
    const found = await findIncomplete({
      contracts: securitizeContracts(DEFAULT_RWA_UNDERLYING_TYPE, {
        [FACTORY.toLowerCase()]: {
          contractType: asType("RWA_FACTORY::SOMETHING_ELSE"),
          getDegenNFT: DEGEN_NFT,
        },
      }),
      markets: [market(POOL, [])],
    });
    assert.deepEqual(found, []);
  });

  it("shares the registry and deployer lookups between markets", async () => {
    let registryReads = 0;
    let deployerReads = 0;
    await findIncomplete({
      contracts: twoMarketContracts(),
      markets: [market(POOL, []), market(OTHER_POOL, [], OTHER_UNDERLYING)],
      onGetRegistered: () => {
        registryReads += 1;
      },
      onGetDeployer: () => {
        deployerReads += 1;
      },
    });
    assert.equal(registryReads, 1);
    assert.equal(deployerReads, 1);
  });
});

describe("reconcileRwaPeripheryActions", () => {
  const otherAction: MarketActions = {
    type: "ORACLE::setPriceFeed",
    params: { token: UNDERLYING, priceFeed: FACTORY },
  };

  const requirements = {
    degen: {
      kind: "degenNftRegistration" as const,
      address: DEGEN_NFT,
      action: degenAction,
    },
    deployment: {
      kind: "zapperDeployment" as const,
      address: ZAPPER,
      action: deployAction(ZAPPER),
    },
    registration: {
      kind: "zapperRegistration" as const,
      address: ZAPPER,
      action: zapperAction(ZAPPER),
    },
  };

  it("appends every missing action in executable order", () => {
    const actions = reconcileRwaPeripheryActions({
      actions: [otherAction],
      missing: [
        requirements.degen,
        requirements.deployment,
        requirements.registration,
      ],
      pool: POOL,
      zapper: ZAPPER,
    });
    assert.deepEqual(actions, [
      otherAction,
      degenAction,
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
    ]);
  });

  it("inserts a deployment before an already queued registration", () => {
    // addPeripheryContract reverts unless the zapper exists by then
    const actions = reconcileRwaPeripheryActions({
      actions: [degenAction, zapperAction(ZAPPER), otherAction],
      missing: [requirements.deployment],
      pool: POOL,
      zapper: ZAPPER,
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
      "register:ZAPPER",
      "ORACLE::setPriceFeed",
    ]);
    // unrelated actions keep their identity, not just their position
    assert.equal(actions[0], degenAction);
    assert.equal(actions[3], otherAction);
  });

  it("repairs a legacy registration queued for an author-derived address", () => {
    const actions = reconcileRwaPeripheryActions({
      actions: [zapperAction(LEGACY_ZAPPER), otherAction],
      missing: [requirements.deployment, requirements.registration],
      pool: POOL,
      zapper: ZAPPER,
    });
    assert.deepEqual(actions, [
      otherAction,
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
    ]);
  });

  it("repairs a legacy deployment of this pool's zapper", () => {
    const legacyDeployment = deployAction(LEGACY_ZAPPER);
    const otherPoolDeployment = getRwaZapperDeployAction({
      params: getRwaZapperDeployParams({ pool: OTHER_POOL, owner: TIMELOCK }),
      expectedAddress: STRANGER,
    });
    const genericDeployment: MarketActions = {
      type: "BCR::deployContract",
      params: {
        contractType: "ZAPPER::SOMETHING_ELSE",
        version: 310,
        constructorParams: POOL_PARAMS,
        salt: DEFAULT_DEPLOY_SALT,
        expectedAddress: LEGACY_ZAPPER,
      },
    };

    const actions = reconcileRwaPeripheryActions({
      actions: [
        legacyDeployment,
        otherPoolDeployment,
        genericDeployment,
        zapperAction(LEGACY_ZAPPER),
      ],
      missing: [requirements.deployment, requirements.registration],
      pool: POOL,
      zapper: ZAPPER,
    });

    // only this pool's stale RWA zapper deployment and registration are gone
    assert.deepEqual(actions, [
      otherPoolDeployment,
      genericDeployment,
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
    ]);
  });

  it("suppresses duplicates of actions queued anywhere in the GIP", () => {
    const actions = reconcileRwaPeripheryActions({
      actions: [otherAction],
      missing: [requirements.degen, requirements.deployment],
      pool: POOL,
      zapper: ZAPPER,
      otherActions: [degenAction, deployAction(ZAPPER)],
    });
    assert.deepEqual(actions, [otherAction]);
  });

  it("leaves everything alone for a market without a zapper", () => {
    // an on-demand market only needs its Degen NFT; a zapper registration it
    // already carries is none of this reconciliation's business
    const queued = [zapperAction(LEGACY_ZAPPER), otherAction];
    const actions = reconcileRwaPeripheryActions({
      actions: queued,
      missing: [requirements.degen],
      pool: POOL,
      zapper: null,
    });
    assert.deepEqual(actions, [...queued, degenAction]);
  });
});

describe("insertRwaZapperDeployment", () => {
  const otherAction: MarketActions = {
    type: "ORACLE::setPriceFeed",
    params: { token: UNDERLYING, priceFeed: FACTORY },
  };

  it("inserts the deployment right before the registration", () => {
    const actions = insertRwaZapperDeployment({
      actions: [degenAction, zapperAction(ZAPPER), otherAction],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(summarize(actions), [
      "register:DEGEN_NFT",
      `deploy:${RWA_ZAPPER_CONTRACT_TYPE}`,
      "register:ZAPPER",
      "ORACLE::setPriceFeed",
    ]);
    // unrelated actions keep their identity, not just their position
    assert.equal(actions[0], degenAction);
    assert.equal(actions[3], otherAction);
  });

  it("rewrites a legacy registration to the deployed address", () => {
    const actions = insertRwaZapperDeployment({
      actions: [zapperAction(LEGACY_ZAPPER), otherAction],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
      otherAction,
    ]);
  });

  it("moves an already queued deployment directly before registration", () => {
    const actions = insertRwaZapperDeployment({
      actions: [deployAction(ZAPPER), otherAction, zapperAction(LEGACY_ZAPPER)],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [
      otherAction,
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
    ]);
  });

  it("moves a deployment queued after registration before it", () => {
    const actions = insertRwaZapperDeployment({
      actions: [zapperAction(LEGACY_ZAPPER), otherAction, deployAction(ZAPPER)],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [
      deployAction(ZAPPER),
      zapperAction(ZAPPER),
      otherAction,
    ]);
  });

  it("drops a registration that the rewrite would duplicate", () => {
    const actions = insertRwaZapperDeployment({
      actions: [zapperAction(LEGACY_ZAPPER), zapperAction(ZAPPER)],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [deployAction(ZAPPER), zapperAction(ZAPPER)]);
  });

  it("appends the deployment when nothing registers the zapper", () => {
    const actions = insertRwaZapperDeployment({
      actions: [degenAction, otherAction],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [degenAction, otherAction, deployAction(ZAPPER)]);
  });

  it("does not duplicate a deployment when no registration exists", () => {
    const existing = deployAction(ZAPPER);
    const actions = insertRwaZapperDeployment({
      actions: [degenAction, existing, otherAction],
      deployment: deployAction(ZAPPER),
    });
    assert.deepEqual(actions, [degenAction, existing, otherAction]);
  });
});
