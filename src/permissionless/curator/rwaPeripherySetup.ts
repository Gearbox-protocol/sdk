import {
  type Address,
  type Chain,
  encodeAbiParameters,
  type Hex,
  hexToString,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { iVersionAbi } from "../../abi/iVersion.js";
import { iRWAUnderlyingAbi } from "../../abi/rwa/iRWAUnderlying.js";
import { iSecuritizeRWAFactoryAbi } from "../../abi/rwa/iSecuritizeRWAFactory.js";
import { RWA_FACTORY_SECURITIZE } from "../../model/rwa.js";
import {
  RWA_UNDERLYING_DEFAULT,
  RWA_UNDERLYING_ON_DEMAND,
} from "../../onchain/index.js";
import { DEFAULT_DEPLOY_SALT } from "../api/deploy/PermissionlessDeploy.js";
import type { AddPeripheryContractAction } from "./actions/addPeripheryContractActionData.js";
import {
  type DeployContractAction,
  isContractDeploymentQueued,
} from "./actions/deployContractActionData.js";
import type { GipMarketAction, MarketActions } from "./actions/types.js";
import {
  isPeripheryContractAdded,
  type PeripheryRegistryEntry,
} from "./actions/utils/isPeripheryContractAdded.js";

/** Contract type labels, as the Gearbox SDK names them. **/
export const SECURITIZE_RWA_FACTORY_TYPE = RWA_FACTORY_SECURITIZE;
export const DEFAULT_RWA_UNDERLYING_TYPE = RWA_UNDERLYING_DEFAULT;
export const ON_DEMAND_RWA_UNDERLYING_TYPE = RWA_UNDERLYING_ON_DEMAND;

/** `contractType()` prefix shared by every RWA underlying. **/
export const RWA_UNDERLYING_TYPE_PREFIX = "RWA_UNDERLYING::";

/**
 * Zapper deployed alongside default RWA markets, see periphery-v3
 * `script/DeploySecuritizeContracts.s.sol`: it is deployed with
 * `abi.encode(pool)` and registered as market periphery.
 **/
export const RWA_ZAPPER_CONTRACT_TYPE = "ZAPPER::ERC4626_UNDERLYING";
export const RWA_ZAPPER_VERSION = 310;

/**
 * Narrow read interface so RWA classification can be unit tested without a
 * chain. Use {@link contractReaderFromClient} to build one from a viem client.
 **/
export type ContractReader = (args: {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
}) => Promise<unknown>;

export function contractReaderFromClient(
  client: PublicClient<Transport, Chain>,
): ContractReader {
  return args => client.readContract(args as never);
}

/** A read's answer when it is hex; `null` when it reverts or is anything else. **/
async function readHexOrNull(
  read: ContractReader,
  args: Parameters<ContractReader>[0],
): Promise<Hex | null> {
  try {
    const result = await read(args);
    return typeof result === "string" && result.startsWith("0x")
      ? (result as Hex)
      : null;
  } catch {
    return null;
  }
}

/** Decodes a `bytes32` contract type into its string label. **/
export function parseContractType(value: Hex): string {
  return hexToString(value, { size: 32 });
}

/**
 * Reads `contractType()`. A revert (or a non-`bytes32` answer) means the
 * address is an ordinary token/contract that does not participate in the RWA
 * setup, so `null` is returned instead of throwing.
 **/
export async function readContractType(
  read: ContractReader,
  address: Address,
): Promise<string | null> {
  const value = await readHexOrNull(read, {
    address,
    abi: iVersionAbi,
    functionName: "contractType",
  });
  return value === null ? null : parseContractType(value);
}

async function readAddressOrNull(
  read: ContractReader,
  args: Parameters<ContractReader>[0],
): Promise<Address | null> {
  const value = await readHexOrNull(read, args);
  return value === null || value.toLowerCase() === zeroAddress
    ? null
    : (value as Address);
}

export interface SecuritizeRwaSetup {
  /** `contractType()` of the underlying, e.g. `RWA_UNDERLYING::DEFAULT`. **/
  underlyingType: string;
  factory: Address;
  degenNFT: Address;
  /**
   * A zapper is only deployed for the exact `RWA_UNDERLYING::DEFAULT` subtype.
   * Unknown subtypes are treated conservatively (no zapper).
   **/
  needsZapper: boolean;
}

/**
 * Classifies a market underlying:
 * - `null` — an ordinary (non-RWA) token, or an RWA token whose factory is not
 *   a Securitize one. Automation must be skipped.
 * - a {@link SecuritizeRwaSetup} — the underlying is served by a
 *   `RWA_FACTORY::SECURITIZE` factory.
 *
 * Once a Securitize factory is recognized, a missing Degen NFT is fatal: the
 * credit suites of such a market cannot work without it.
 **/
export async function resolveSecuritizeRwaSetup(args: {
  read: ContractReader;
  underlying: Address;
}): Promise<SecuritizeRwaSetup | null> {
  const { read, underlying } = args;

  // @dev a failing contractType() means an ordinary ERC-20 underlying
  const underlyingType = await readContractType(read, underlying);
  if (
    underlyingType === null ||
    !underlyingType.startsWith(RWA_UNDERLYING_TYPE_PREFIX)
  ) {
    return null;
  }

  const factory = await readAddressOrNull(read, {
    address: underlying,
    abi: iRWAUnderlyingAbi,
    functionName: "getFactory",
  });
  if (!factory) return null;

  const factoryType = await readContractType(read, factory);
  if (factoryType !== SECURITIZE_RWA_FACTORY_TYPE) return null;

  const degenNFT = await readAddressOrNull(read, {
    address: factory,
    abi: iSecuritizeRWAFactoryAbi,
    functionName: "getDegenNFT",
  });
  if (!degenNFT) {
    throw new Error(
      `Failed to resolve the Degen NFT of Securitize RWA factory ${factory} ` +
        `for underlying ${underlying}. Market creation cannot continue because ` +
        `a Securitize market is unusable without its Degen NFT.`,
    );
  }

  return {
    underlyingType,
    factory,
    degenNFT,
    needsZapper: underlyingType === DEFAULT_RWA_UNDERLYING_TYPE,
  };
}

export interface RwaZapperDeployParams {
  contractType: string;
  version: number;
  /** `abi.encode(pool)` **/
  encodedParams: Hex;
  salt: Hex;
  /**
   * Caller of `BytecodeRepository.deploy()`, which the CREATE2 address is
   * derived from. For GIP-queued deployments this is the TimeLock — see
   * {@link RwaPeripheryLookups.getDeployer}.
   **/
  owner: Address;
}

/** `abi.encode(pool)`: the zapper's constructor parameters. **/
const encodeZapperParams = (pool: Address): Hex =>
  encodeAbiParameters([{ type: "address" }], [pool]);

/**
 * Deterministic Bytecode Repository deployment parameters of the RWA zapper.
 * Mirrors `_deploy("ZAPPER::ERC4626_UNDERLYING", 3_10, abi.encode(pool))`.
 **/
export function getRwaZapperDeployParams(args: {
  pool: Address;
  owner: Address;
}): RwaZapperDeployParams {
  return {
    contractType: RWA_ZAPPER_CONTRACT_TYPE,
    version: RWA_ZAPPER_VERSION,
    encodedParams: encodeZapperParams(args.pool),
    salt: DEFAULT_DEPLOY_SALT,
    owner: args.owner,
  };
}

/** Turns deployment parameters into the persisted generic deployment action. **/
export function getRwaZapperDeployAction(args: {
  params: RwaZapperDeployParams;
  expectedAddress: Address;
}): DeployContractAction {
  const { params, expectedAddress } = args;
  return {
    type: "BCR::deployContract",
    params: {
      contractType: params.contractType,
      version: params.version,
      constructorParams: params.encodedParams,
      salt: params.salt,
      expectedAddress,
    },
  };
}

/** The three things a Securitize RWA market needs, in executable order. **/
export type RwaPeripheryRequirementKind =
  | "degenNftRegistration"
  | "zapperDeployment"
  | "zapperRegistration";

export interface RwaPeripheryRequirement {
  kind: RwaPeripheryRequirementKind;
  /** Contract the requirement is about: the Degen NFT or the zapper. **/
  address: Address;
  /** Action that satisfies it. **/
  action: MarketActions;
}

export interface RwaPeripherySetupPlan {
  /** `contractType()` of the underlying, e.g. `RWA_UNDERLYING::DEFAULT`. **/
  underlyingType: string;
  factory: Address;
  degenNFT: Address;
  /**
   * Deterministic zapper address of this market, derived from the deployer;
   * `null` for subtypes that get no zapper (see {@link SecuritizeRwaSetup}).
   **/
  zapper: Address | null;
  /** Requirements that are not satisfied yet, in executable order. **/
  missing: RwaPeripheryRequirement[];
}

/** Chain reads the planner needs, shared by every market of a GIP. **/
export interface RwaPeripheryLookups {
  read: ContractReader;
  /**
   * Caller of `BytecodeRepository.deploy()`, which the CREATE2 address is
   * derived from. GIP transactions are executed by
   * `MarketConfigurator.admin()` — the TimeLock — so that is the deployer.
   *
   * Only called for underlyings that actually need a zapper, so ordinary
   * ERC-20 and `ON_DEMAND` flows pay no extra RPC round trip.
   **/
  getDeployer: () => Promise<Address>;
  computeZapperAddress: (params: RwaZapperDeployParams) => Promise<Address>;
  /** Whether `address` already holds bytecode. **/
  isDeployed: (address: Address) => Promise<boolean>;
  /**
   * The periphery already registered on chain. Only called for RWA
   * underlyings, so ordinary markets pay no extra RPC round trip.
   **/
  getRegistered: () => Promise<readonly PeripheryRegistryEntry[]>;
}

/**
 * Full reconciliation plan of a Securitize RWA market: what it needs and which
 * of those requirements are still missing, in executable order — Degen NFT
 * registration, zapper deployment, zapper registration.
 *
 * `null` for ordinary (non-RWA) and non-Securitize underlyings.
 *
 * Each requirement is dropped independently when it is already taken care of:
 * a registration when the contract is registered on chain or queued anywhere in
 * the same GIP (`queuedActions`), a deployment when the expected address already
 * holds bytecode or an equivalent deployment is queued anywhere in the same GIP.
 **/
async function planRwaPeripheryRequirements(
  lookups: RwaPeripheryLookups,
  market: {
    underlying: Address;
    /**
     * Pool the zapper is built for: the previewed address while the market is
     * being created, the market address afterwards.
     **/
    pool: Address;
  },
  queuedActions: readonly GipMarketAction[],
): Promise<RwaPeripherySetupPlan | null> {
  const setup = await resolveSecuritizeRwaSetup({
    read: lookups.read,
    underlying: market.underlying,
  });
  if (!setup) return null;

  const registered = await lookups.getRegistered();
  const missing: RwaPeripheryRequirement[] = [];
  const queued = () => [
    ...queuedActions,
    ...missing.map(requirement => requirement.action),
  ];

  const isAdded = (address: Address, domain: "DEGEN_NFT" | "ZAPPER") =>
    isPeripheryContractAdded({
      address,
      domain,
      registered,
      queuedActions: queued(),
    });

  if (!isAdded(setup.degenNFT, "DEGEN_NFT")) {
    const registration: AddPeripheryContractAction = {
      type: "MARKET::addPeripheryContract",
      params: {
        peripheryContract: setup.degenNFT,
        domain: "DEGEN_NFT",
        type: "",
      },
    };
    missing.push({
      kind: "degenNftRegistration",
      address: setup.degenNFT,
      action: registration,
    });
  }

  // TODO: `RWA_UNDERLYING::ON_DEMAND` markets also need a zapper, but it cannot
  // be auto-queued here: on-demand underlyings additionally require a
  // `setPool` call and explicit depositor authorization
  // (`setDepositorStatus`) before the zapper is usable. Unknown RWA subtypes
  // are skipped for the same, conservative reason.
  let zapper: Address | null = null;
  if (setup.needsZapper) {
    const deployParams = getRwaZapperDeployParams({
      pool: market.pool,
      owner: await lookups.getDeployer(),
    });
    zapper = await lookups.computeZapperAddress(deployParams);

    // @dev deployment and registration are suppressed independently: a zapper
    // that is deployed but unregistered still needs `addPeripheryContract`,
    // and a queued registration says nothing about a missing deployment
    if (
      !(await lookups.isDeployed(zapper)) &&
      !isContractDeploymentQueued({
        expectedAddress: zapper,
        actions: queued(),
      })
    ) {
      missing.push({
        kind: "zapperDeployment",
        address: zapper,
        action: getRwaZapperDeployAction({
          params: deployParams,
          expectedAddress: zapper,
        }),
      });
    }

    if (!isAdded(zapper, "ZAPPER")) {
      const registration: AddPeripheryContractAction = {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: zapper,
          domain: "ZAPPER",
          type: RWA_ZAPPER_CONTRACT_TYPE,
        },
      };
      missing.push({
        kind: "zapperRegistration",
        address: zapper,
        action: registration,
      });
    }
  }

  return {
    underlyingType: setup.underlyingType,
    factory: setup.factory,
    degenNFT: setup.degenNFT,
    zapper,
    missing,
  };
}

/**
 * Builds the actions that must follow `MARKET::createMarket` for a Securitize
 * RWA underlying, in order: Degen NFT registration, zapper deployment, zapper
 * registration. Empty for ordinary (non-RWA) and non-Securitize underlyings.
 **/
export async function planRwaPeripheryActions(
  args: RwaPeripheryLookups & {
    underlying: Address;
    /**
     * Pool the zapper is built for: the previewed address while the market is
     * being created, the market address afterwards.
     **/
    pool: Address;
    /** Actions queued anywhere in the same GIP. **/
    queuedActions?: readonly GipMarketAction[];
  },
): Promise<MarketActions[]> {
  const plan = await planRwaPeripheryRequirements(
    args,
    args,
    args.queuedActions ?? [],
  );
  return plan?.missing.map(requirement => requirement.action) ?? [];
}

/** Whether an action registers an auto-queued RWA zapper as periphery. **/
export function isRwaZapperRegistration(
  action: GipMarketAction,
): action is AddPeripheryContractAction {
  return (
    action.type === "MARKET::addPeripheryContract" &&
    action.params.domain === "ZAPPER" &&
    action.params.type === RWA_ZAPPER_CONTRACT_TYPE
  );
}

export interface IncompleteRwaPeripherySetup<TMarket> {
  market: TMarket;
  plan: RwaPeripherySetupPlan;
}

/** Runs `fn` at most once, so lazy RPC lookups are shared between markets. **/
function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => (pending ??= fn());
}

/**
 * Securitize RWA markets of a GIP whose periphery setup is incomplete.
 *
 * The whole GIP is evaluated, not a single action: a registration counts as done
 * when its normalized address/domain pair is registered on chain or queued
 * anywhere in the GIP, and the zapper deployment counts as done when its
 * deterministic address already holds bytecode or an equivalent
 * `BCR::deployContract` is queued anywhere in the GIP (the Bytecode Repository
 * is global).
 *
 * The expected zapper address always comes from `getDeployer()` — the TimeLock
 * that executes the governance batch — never from the address a legacy GIP
 * happened to queue: an author-derived address can no longer be produced by
 * anyone, so deploying it would revert.
 *
 * Markets with a complete setup, ordinary ERC-20 markets and non-Securitize RWA
 * markets are omitted. Ordinary ERC-20s stop after their failed
 * `contractType()` read.
 **/
export async function findIncompleteRwaPeripherySetups<
  TMarket extends {
    address: Address;
    underlyingAsset: Address;
    transactions: GipMarketAction[];
  },
>(
  args: RwaPeripheryLookups & { markets: readonly TMarket[] },
): Promise<IncompleteRwaPeripherySetup<TMarket>[]> {
  if (args.markets.length === 0) return [];

  // @dev a periphery contract queued for one market of the GIP is registered
  // for the whole configurator, so every market sees every queued action
  const queuedActions = args.markets.flatMap(market => market.transactions);
  const lookups: RwaPeripheryLookups = {
    read: args.read,
    computeZapperAddress: args.computeZapperAddress,
    isDeployed: args.isDeployed,
    getDeployer: once(args.getDeployer),
    getRegistered: once(args.getRegistered),
  };

  const found = await Promise.all(
    args.markets.map(async market => {
      const plan = await planRwaPeripheryRequirements(
        lookups,
        // @dev the zapper constructor takes the pool, i.e. the market address
        { underlying: market.underlyingAsset, pool: market.address },
        queuedActions,
      );
      return plan && plan.missing.length > 0 ? { market, plan } : null;
    }),
  );

  return found.filter(
    (entry): entry is IncompleteRwaPeripherySetup<TMarket> => entry !== null,
  );
}

/**
 * Applies a {@link RwaPeripherySetupPlan} to a market's queued actions, adding
 * every missing action in executable order in a single step.
 *
 * A legacy GIP registered — and sometimes deployed — an author-derived zapper
 * address that nobody can produce any more; leaving it queued would make the
 * batch revert, so such actions are dropped in favour of the reconciled ones.
 * Every other action keeps its position, and nothing already queued (here or in
 * `otherActions`) is duplicated.
 **/
export function reconcileRwaPeripheryActions(args: {
  actions: readonly MarketActions[];
  /** Missing requirements in executable order. **/
  missing: readonly RwaPeripheryRequirement[];
  /** Pool the zapper is deployed for, i.e. the market address. **/
  pool: Address;
  /** Deterministic zapper address, `null` when the market gets none. **/
  zapper?: Address | null;
  /** Actions queued for the other markets of the same GIP. **/
  otherActions?: readonly MarketActions[];
}): MarketActions[] {
  const zapper = args.zapper?.toLowerCase() ?? null;
  const poolParams = encodeZapperParams(args.pool).toLowerCase();

  const isStale = (action: MarketActions): boolean => {
    if (zapper === null) return false;
    if (isRwaZapperRegistration(action)) {
      return action.params.peripheryContract.toLowerCase() !== zapper;
    }
    // @dev only this pool's zapper deployment; unrelated (and generic) BCR
    // deployments are never touched
    return (
      action.type === "BCR::deployContract" &&
      action.params.contractType === RWA_ZAPPER_CONTRACT_TYPE &&
      action.params.constructorParams.toLowerCase() === poolParams &&
      action.params.expectedAddress.toLowerCase() !== zapper
    );
  };

  const kept = args.actions.filter(action => !isStale(action));

  const additions: MarketActions[] = [];
  for (const { action } of args.missing) {
    const queued = [...kept, ...(args.otherActions ?? []), ...additions];

    if (
      action.type === "MARKET::addPeripheryContract" &&
      isPeripheryContractAdded({
        address: action.params.peripheryContract,
        domain: action.params.domain,
        queuedActions: queued,
      })
    ) {
      continue;
    }
    if (
      action.type === "BCR::deployContract" &&
      isContractDeploymentQueued({
        expectedAddress: action.params.expectedAddress,
        actions: queued,
      })
    ) {
      continue;
    }

    additions.push(action);
  }

  if (additions.length === 0) return kept;

  // `MARKET::addPeripheryContract` reverts unless the zapper exists, so a
  // deployment added for an already queued registration goes before it.
  const anchor =
    zapper === null
      ? -1
      : kept.findIndex(
          action =>
            isRwaZapperRegistration(action) &&
            action.params.peripheryContract.toLowerCase() === zapper,
        );

  return anchor === -1
    ? [...kept, ...additions]
    : [...kept.slice(0, anchor), ...additions, ...kept.slice(anchor)];
}

/**
 * Inserts an RWA zapper deployment right before the registration it serves.
 *
 * `MARKET::addPeripheryContract` reverts unless the zapper is already deployed,
 * so ordering matters. Legacy GIPs registered an author-derived address that
 * nobody can produce any more; such a registration is rewritten to the address
 * this deployment actually lands on.
 *
 * Unrelated actions keep their position, and neither the deployment nor the
 * registration is duplicated. Without a registration to anchor to, the
 * deployment is simply appended.
 **/
export function insertRwaZapperDeployment(args: {
  actions: readonly MarketActions[];
  deployment: DeployContractAction;
}): MarketActions[] {
  const { deployment } = args;
  const expectedAddress = deployment.params.expectedAddress;
  const expected = expectedAddress.toLowerCase();

  const registrationQueued = args.actions.some(isRwaZapperRegistration);
  const queuedDeployment = args.actions.find(
    (action): action is DeployContractAction =>
      action.type === "BCR::deployContract" &&
      action.params.expectedAddress.toLowerCase() === expected,
  );

  // Without a registration there is no ordering anchor. Preserve an existing
  // deployment in place, or append the new one.
  if (!registrationQueued) {
    return queuedDeployment ? [...args.actions] : [...args.actions, deployment];
  }

  const result: MarketActions[] = [];
  let registered = false;

  for (const action of args.actions) {
    // A matching deployment is reinserted immediately before registration,
    // even when an older GIP queued it later or separated it by other actions.
    if (
      action.type === "BCR::deployContract" &&
      action.params.expectedAddress.toLowerCase() === expected
    ) {
      continue;
    }

    if (!isRwaZapperRegistration(action)) {
      result.push(action);
      continue;
    }

    // @dev a market has exactly one RWA zapper, so any further registration
    // would become a duplicate of the (possibly rewritten) first one
    if (registered) continue;
    registered = true;

    result.push(queuedDeployment ?? deployment);
    result.push(
      action.params.peripheryContract.toLowerCase() === expected
        ? action
        : {
            ...action,
            params: { ...action.params, peripheryContract: expectedAddress },
          },
    );
  }

  return result;
}
