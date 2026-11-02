import {
  type Address,
  BaseError,
  type Chain,
  ContractFunctionRevertedError,
  createPublicClient,
  createTestClient,
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  http,
  type PublicClient,
  parseAbi,
  parseEventLogs,
  type Transport,
  walletActions,
  zeroAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { beforeAll, describe, expect, it } from "vitest";
import { iPoolConfigureActionsAbi } from "../../abi/310/configure/iPoolConfigureActions.js";
import { iMarketConfiguratorV310Abi } from "../../abi/310/generated.js";
import { iKillSwitchProxyAbi } from "../../abi/310/iKillSwitchProxy.js";
import { iMarketConfiguratorFactoryAbi } from "../../abi/310/iMarketConfiguratorFactory.js";
import type { RawTx } from "../../onchain/index.js";
import {
  BytecodeRepositoryContract,
  KillSwitchProxyContract,
  KillSwitchProxyNotAllowedError,
  killSwitchProxySalt,
  MarketConfiguratorContract,
  MarketConfiguratorFactoryContract,
} from "../../permissionless/index.js";
import { ANVIL_URL, GAS_LIMIT } from "../constants.js";
import {
  allowKillSwitchProxyOnFork,
  type ForkClient,
  waitForMined,
} from "../helpers/kill-switch.js";
import { useFixture } from "../helpers.js";

const BLOCK = 24_736_900n;

const BYTECODE_REPOSITORY: Address =
  "0x1cE2B1BE96a082b1b1539F80d5D8f82Ec06a0f9A";
const MARKET_CONFIGURATOR_FACTORY: Address =
  "0x7D60CfaF7c2cec210638A5e46E4000894830C034";
// existing market configurator with legacy (direct) emergency admin and its USDC pool
const LEGACY_MC: Address = "0x7A133FBd01736Fd076158307c9476cC3877F1AF5";
const USDC_POOL: Address = "0xC155444481854c60e7a29f4150373f479988F32D";

const ADMIN = getAddress("0x000000000000000000000000000000000000a11c");
const EMERGENCY_ADMIN = getAddress(
  "0x00000000000000000000000000000000000e3e46",
);
const STRANGER = getAddress("0x0000000000000000000000000000000000005742");
const CURATOR = "Kill Switch Curator";

const pauseCallData = encodeFunctionData({
  abi: iPoolConfigureActionsAbi,
  functionName: "pause",
});

const governanceAbi = parseAbi([
  "function admin() view returns (address)",
  "function vetoAdmin() view returns (address)",
  "function paused() view returns (bool)",
]);

function revertName(e: unknown): string | undefined {
  if (!(e instanceof BaseError)) return undefined;
  const revert = e.walk(err => err instanceof ContractFunctionRevertedError);
  return revert instanceof ContractFunctionRevertedError
    ? revert.data?.errorName
    : undefined;
}

describe("kill switch proxy as emergency admin", () => {
  let client: PublicClient<Transport, Chain>;
  let testClient: ForkClient;
  let bcr: BytecodeRepositoryContract;
  let mcf: MarketConfiguratorFactoryContract;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(() => {
    client = createPublicClient({
      chain: mainnet,
      transport: http(ANVIL_URL, { timeout: 120_000 }),
      pollingInterval: 100,
    });
    testClient = createTestClient({
      mode: "anvil",
      chain: mainnet,
      transport: http(ANVIL_URL, { timeout: 120_000 }),
      pollingInterval: 100,
    }).extend(walletActions);
    bcr = new BytecodeRepositoryContract(BYTECODE_REPOSITORY, client);
    mcf = new MarketConfiguratorFactoryContract(
      MARKET_CONFIGURATOR_FACTORY,
      client,
    );
  });

  async function send(from: Address, tx: RawTx) {
    await testClient.impersonateAccount({ address: from });
    await testClient.setBalance({ address: from, value: 10n ** 18n });
    const hash = await testClient.sendTransaction({
      account: from,
      to: tx.to,
      data: tx.callData,
      gas: GAS_LIMIT,
    });
    const receipt = await waitForMined(client, hash);
    expect(receipt.status).toBe("success");
    return receipt;
  }

  /**
   * Simulates `proxyCall` transaction and returns the name of custom error it reverts with
   */
  async function simulateRevert(
    from: Address,
    tx: RawTx,
  ): Promise<string | undefined> {
    const decoded = decodeFunctionData({
      abi: iKillSwitchProxyAbi,
      data: tx.callData,
    });
    if (decoded.functionName !== "proxyCall") {
      throw new Error(`expected proxyCall, got ${decoded.functionName}`);
    }
    try {
      await client.simulateContract({
        account: from,
        address: tx.to,
        abi: iKillSwitchProxyAbi,
        functionName: "proxyCall",
        args: decoded.args,
      });
    } catch (e) {
      return revertName(e) ?? String(e);
    }
    return undefined;
  }

  it("fails fast while kill switch proxy is not allowed", async () => {
    await expect(KillSwitchProxyContract.isAvailable(bcr)).resolves.toBe(false);
    await expect(
      mcf.createMarketConfiguratorWithKillSwitchTxs({
        admin: ADMIN,
        emergencyAdmin: EMERGENCY_ADMIN,
        adminFeeTreasury: zeroAddress,
        curatorName: CURATOR,
        deployGovernor: true,
      }),
    ).rejects.toBeInstanceOf(KillSwitchProxyNotAllowedError);
  });

  it("deploys market configurator with kill switch proxy in one batch", async () => {
    await allowKillSwitchProxyOnFork(client, testClient, BYTECODE_REPOSITORY);
    await expect(KillSwitchProxyContract.isAvailable(bcr)).resolves.toBe(true);

    const args = {
      admin: ADMIN,
      emergencyAdmin: EMERGENCY_ADMIN,
      adminFeeTreasury: zeroAddress,
      curatorName: CURATOR,
      deployGovernor: true,
    };
    const { killSwitchProxy, isKillSwitchProxyDeployed, txs } =
      await mcf.createMarketConfiguratorWithKillSwitchTxs(args);
    expect(isKillSwitchProxyDeployed).toBe(false);
    expect(txs).toHaveLength(2);

    await send(ADMIN, txs[0]);
    const receipt = await send(ADMIN, txs[1]);
    const [created] = parseEventLogs({
      abi: iMarketConfiguratorFactoryAbi,
      eventName: "CreateMarketConfigurator",
      logs: receipt.logs,
    });
    const mc = new MarketConfiguratorContract(
      created.args.marketConfigurator,
      client,
    );

    expect(await mc.contract.read.emergencyAdmin()).toBe(killSwitchProxy);
    await expect(
      new KillSwitchProxyContract(killSwitchProxy, client).state(),
    ).resolves.toEqual({
      caller: EMERGENCY_ADMIN,
      owner: ADMIN,
      isKilled: false,
    });
    await expect(mc.getEmergencyAdmin()).resolves.toEqual({
      type: "killSwitch",
      address: killSwitchProxy,
      caller: EMERGENCY_ADMIN,
      owner: ADMIN,
      isKilled: false,
      executor: EMERGENCY_ADMIN,
    });

    // governor is market configurator's admin via its timelock, proxy becomes its veto admin
    const timelock = await mc.contract.read.admin();
    const governor = await client.readContract({
      address: timelock,
      abi: governanceAbi,
      functionName: "admin",
    });
    await expect(
      client.readContract({
        address: governor,
        abi: governanceAbi,
        functionName: "vetoAdmin",
      }),
    ).resolves.toBe(killSwitchProxy);

    // same inputs resolve to the same, already deployed proxy
    const again = await mcf.createMarketConfiguratorWithKillSwitchTxs(args);
    expect(again.killSwitchProxy).toBe(killSwitchProxy);
    expect(again.isKillSwitchProxyDeployed).toBe(true);
    expect(again.txs).toHaveLength(1);
  });

  it("executes emergency actions of legacy emergency admin directly", async () => {
    const mc = new MarketConfiguratorContract(LEGACY_MC, client);
    const emergencyAdmin = await mc.getEmergencyAdmin();
    expect(emergencyAdmin.type).toBe("direct");

    const tx = mc.emergencyConfigurePool(USDC_POOL, pauseCallData);
    const routed = await mc.emergencyTx(tx);
    expect(routed).toBe(tx);

    await send(emergencyAdmin.executor, routed);
    await expect(
      client.readContract({
        address: USDC_POOL,
        abi: governanceAbi,
        functionName: "paused",
      }),
    ).resolves.toBe(true);
  });

  it("executes emergency actions through kill switch proxy until it is killed", async () => {
    await allowKillSwitchProxyOnFork(client, testClient, BYTECODE_REPOSITORY);
    const mc = new MarketConfiguratorContract(LEGACY_MC, client);

    // switch existing market configurator to kill switch proxy
    const proxy = await KillSwitchProxyContract.prepareDeploy(bcr, {
      deployer: ADMIN,
      owner: ADMIN,
      caller: EMERGENCY_ADMIN,
      salt: killSwitchProxySalt(CURATOR),
    });
    await send(ADMIN, proxy.tx);
    await send(
      await mc.contract.read.admin(),
      mc.setEmergencyAdmin(proxy.address),
    );

    const wrapped = await mc.emergencyTx(
      mc.emergencyConfigurePool(USDC_POOL, pauseCallData),
    );
    expect(wrapped.to).toBe(proxy.address);

    await expect(simulateRevert(STRANGER, wrapped)).resolves.toBe(
      "OnlyCallerException",
    );
    // emergency admin can't call market configurator directly anymore
    await expect(
      client.simulateContract({
        account: EMERGENCY_ADMIN,
        address: LEGACY_MC,
        abi: iMarketConfiguratorV310Abi,
        functionName: "emergencyConfigurePool",
        args: [USDC_POOL, pauseCallData],
      }),
    ).rejects.toSatisfy(
      e => revertName(e) === "CallerIsNotEmergencyAdminException",
    );

    await send(EMERGENCY_ADMIN, wrapped);
    await expect(
      client.readContract({
        address: USDC_POOL,
        abi: governanceAbi,
        functionName: "paused",
      }),
    ).resolves.toBe(true);

    const killSwitch = new KillSwitchProxyContract(proxy.address, client);
    await send(ADMIN, killSwitch.killTx());
    await expect(mc.getEmergencyAdmin()).resolves.toMatchObject({
      type: "killSwitch",
      isKilled: true,
    });
    await expect(
      mc.emergencyTx(mc.emergencyConfigurePool(USDC_POOL, pauseCallData)),
    ).rejects.toThrow(/killed/);
    await expect(simulateRevert(EMERGENCY_ADMIN, wrapped)).resolves.toBe(
      "KilledException",
    );
  });
});
