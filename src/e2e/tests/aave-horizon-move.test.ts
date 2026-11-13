import {
  type Address,
  createPublicClient,
  erc20Abi,
  type Hex,
  http,
  isAddressEqual,
  parseEventLogs,
  parseUnits,
  zeroAddress,
} from "viem";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  iBotListV310Abi,
  iCreditFacadeV310Abi,
} from "../../abi/310/generated.js";
import {
  type AnvilClient,
  createAnvilClient,
} from "../../dev/createAnvilClient.js";
import { calcBorrowedAmountPlusInterestAndFees } from "../../onchain/accounts/intents/utils/borrowed-amount-plus-interest-and-fees.js";
import {
  chains,
  MAX_UINT256,
  MultichainSDK,
  type OnchainSDK,
  sendRawTx,
} from "../../onchain/index.js";
import {
  iAaveHorizonBridgeAbi,
  iAaveV3PoolAbi,
} from "../../onchain/market/adapters/abi/aave/index.js";
import { GearboxSDK } from "../../sdk/index.js";
import { type AnvilInstance, startAnvilFork, stopAnvil } from "../anvil.js";
import { GAS_LIMIT } from "../constants.js";
import { signRegisterVaultMessages } from "../helpers/securitize.js";
import { getAnvilWallet } from "../helpers.js";

const TESTNET_RPC_URL =
  "https://anvil.gearbox.foundation/rpc/aave-vbill-demo-v2";
/** Clear of the 8545 of the fixture tests and the 8546 of fixture generation. */
const FORK_PORT = 8547;
const MARKET_CONFIGURATOR: Address =
  "0xa770ce584adb6491a2138da6eaec33243bdcd248";
const RWA_FACTORY: Address = "0xd1cc46e404d0d7da695e74b3f0d00a42033f0837";
const CREDIT_MANAGER: Address = "0x51729cEd7156158C7D3d95C0cbc3Cf75e240Ba8e"; // VBILL Securitize
const BRIDGE: Address = "0x0a637A81A61650DBE409A3e8857ED59F1556f5D2";
const RLUSD: Address = "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD";
const VBILL: Address = "0x2255718832bC9fD3bE1CaF75084F4803DA14FF01";
/** At 3x, the debt clears the market's 50 000 minimum. */
const COLLATERAL = parseUnits("30000", 18);

const approveDelegationAbi = [
  {
    type: "function",
    name: "approveDelegation",
    inputs: [
      { name: "delegatee", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const finalizeOpenAbi = [
  {
    type: "function",
    name: "finalizeOpen",
    inputs: [
      { name: "creditAccount", type: "address" },
      { name: "rwaToken", type: "address" },
      {
        name: "claimCall",
        type: "tuple",
        components: [
          { name: "target", type: "address" },
          { name: "callData", type: "bytes" },
        ],
      },
      { name: "depositPhantomToken", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const testnet = createPublicClient({
  transport: http(TESTNET_RPC_URL, { timeout: 10_000, retryCount: 0 }),
});

/** Why the testnet does not answer, or `undefined` when it does. */
async function rpcDown(): Promise<string | undefined> {
  try {
    await testnet.getBlockNumber();
    return undefined;
  } catch (e) {
    return e instanceof Error ? e.message.split("\n")[0] : String(e);
  }
}

const down = process.env.CI ? undefined : await rpcDown();
if (down) {
  process.emitWarning(
    `aave horizon move: skipped, ${TESTNET_RPC_URL} does not answer: ${down}`,
  );
}

/**
 * Runs on a local anvil forked from the testnet, so a run neither leaves its
 * accounts on the shared testnet nor races another run for the wallet, and
 * mines at once rather than on the testnet's interval.
 */
describe.skipIf(!!process.env.CI || !!down)("aave horizon move", () => {
  let fork: AnvilInstance | undefined;
  let anvil: AnvilClient;
  let snapshotId: Hex;
  let multichain: MultichainSDK;
  let gearbox: GearboxSDK<"onchain">;
  let sdk: OnchainSDK;
  /** Hardhat account #0, registered as a VBILL investor when the testnet was deployed. */
  let wallet: ReturnType<typeof getAnvilWallet>;
  let investor: Address;
  let aToken: Address;
  let debtToken: Address;

  beforeAll(async () => {
    fork = await startAnvilFork({
      forkUrl: TESTNET_RPC_URL,
      forkBlockNumber: await testnet.getBlockNumber(),
      port: FORK_PORT,
      storageCaching: false,
    });
    anvil = createAnvilClient({
      chain: chains.Mainnet,
      transport: http(fork.url, { timeout: 120_000 }),
      pollingInterval: 100,
    });
    multichain = new MultichainSDK({
      chains: { Mainnet: { rpcURLs: [fork.url], timeout: 120_000 } },
    });
    await multichain.attach({
      perChain: {
        Mainnet: {
          marketConfigurators: [MARKET_CONFIGURATOR],
          rwaFactories: [RWA_FACTORY],
          ignoreUpdateablePrices: true,
        },
      },
    });
    sdk = multichain.chain(chains.Mainnet.id);
    gearbox = new GearboxSDK({
      mode: "onchain",
      networks: ["Mainnet"],
      onchain: multichain,
    });
    wallet = getAnvilWallet(sdk, fork.url);
    investor = wallet.account.address;

    const pool = await sdk.client.readContract({
      address: BRIDGE,
      abi: iAaveHorizonBridgeAbi,
      functionName: "pool",
    });
    ({ variableDebtTokenAddress: debtToken } = await sdk.client.readContract({
      address: pool,
      abi: iAaveV3PoolAbi,
      functionName: "getReserveData",
      args: [RLUSD],
    }));
    aToken = await sdk.client.readContract({
      address: pool,
      abi: iAaveV3PoolAbi,
      functionName: "getReserveAToken",
      args: [VBILL],
    });

    // both paths borrow as the investor, so the bridge needs the delegation
    await mined(
      await wallet.writeContract({
        address: debtToken,
        abi: approveDelegationAbi,
        functionName: "approveDelegation",
        args: [BRIDGE, MAX_UINT256],
      }),
    );
    snapshotId = (await anvil.snapshot()) as Hex;
  }, 300_000);

  beforeEach(async () => {
    await anvil.revert({ id: snapshotId });
    snapshotId = (await anvil.snapshot()) as Hex;
  });

  afterAll(async () => {
    if (fork) {
      await stopAnvil(fork);
    }
  });

  async function mined(hash: Hex) {
    const receipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(receipt.status).toBe("success");
    return receipt;
  }

  function balanceOf(token: Address, owner: Address): Promise<bigint> {
    return sdk.client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
    });
  }

  /** The chain as `prepare` will read it: nothing mined after this. */
  async function sync(): Promise<void> {
    const block = await sdk.client.getBlock({ blockTag: "latest" });
    await sdk.syncState({
      blockNumber: block.number,
      timestamp: block.timestamp,
      ignoreUpdateablePrices: true,
    });
  }

  /** Opens the 3x VBILL position and checks the opening permitted the bot. */
  async function openPosition(): Promise<{
    creditAccount: Address;
    bot: Address;
    debt: bigint;
  }> {
    await anvil.deal({ erc20: RLUSD, account: investor, amount: COLLATERAL });
    // each account gets a wallet of its own, so the spender is new every time
    const approvalTarget = await sdk.accounts.getApprovalAddress({
      creditManager: CREDIT_MANAGER,
      borrower: investor,
    });
    await mined(
      await wallet.writeContract({
        address: RLUSD,
        abi: erc20Abi,
        functionName: "approve",
        args: [approvalTarget, MAX_UINT256],
      }),
    );
    await sync();
    const collateral = [{ token: RLUSD, balance: COLLATERAL }];
    const sim = await gearbox.opportunities.prepare.openAavePosition(
      { chainId: chains.Mainnet.id, creditManager: CREDIT_MANAGER },
      {
        collateral,
        leverage: 300n,
        slippage: 50,
        targetToken: VBILL,
        wallet: investor,
      },
    );
    if (!sim.ok) throw new Error(`open sim failed: ${sim.error.code}`);

    const requirements = await sdk.accounts.getOpenAccountRequirements(
      investor,
      CREDIT_MANAGER,
      { tokenOutAddress: VBILL },
    );
    if (requirements?.protocol !== "securitize") {
      throw new Error("expected securitize open requirements");
    }
    const tx = await gearbox.opportunities.execute.buildTx({
      kind: "open",
      chainId: chains.Mainnet.id,
      creditManager: CREDIT_MANAGER,
      wallet: investor,
      sim,
      collateral,
      ethAmount: 0n,
      targetToken: VBILL,
      signaturesToCache: await signRegisterVaultMessages(
        wallet,
        requirements.requiredSignatures,
      ),
    });
    const opened = await mined(await sendRawTx(wallet, { tx, gas: GAS_LIMIT }));
    const [{ args: open }] = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: opened.logs,
      eventName: "OpenCreditAccount",
    });
    const [{ args: permitted }] = parseEventLogs({
      abi: iBotListV310Abi,
      logs: opened.logs,
      eventName: "SetBotPermissions",
    });
    expect(isAddressEqual(permitted.creditAccount, open.creditAccount)).toBe(
      true,
    );
    expect(permitted.permissions).toBeGreaterThan(0n);
    return {
      creditAccount: open.creditAccount,
      bot: permitted.bot,
      debt: sim.data.state.totalDebt.value,
    };
  }

  /**
   * Runs `move` and checks the position left the account for the investor's
   * own on Aave: the loan repaid, the VBILL supplied, the debt borrowed.
   */
  async function expectMoved(
    creditAccount: Address,
    debt: bigint,
    move: () => Promise<void>,
  ): Promise<void> {
    const rwa = await balanceOf(VBILL, creditAccount);
    expect(rwa).toBeGreaterThan(0n);
    const supplied = await balanceOf(aToken, investor);
    const owed = await balanceOf(debtToken, investor);

    await move();

    const after = await sdk.accounts.getCreditAccountData(creditAccount);
    if (!after) throw new Error(`account ${creditAccount} not found`);
    expect(calcBorrowedAmountPlusInterestAndFees(after)).toBe(0n);
    expect(await balanceOf(VBILL, creditAccount)).toBe(0n);
    // a 1:1 aToken, give or take the index rounding of the supply
    expect(
      (await balanceOf(aToken, investor)) - supplied,
    ).toBeGreaterThanOrEqual(rwa - 1n);
    expect(
      (await balanceOf(debtToken, investor)) - owed,
    ).toBeGreaterThanOrEqual(debt);
  }

  it("the bot moves the position to Aave", async () => {
    const { creditAccount, bot, debt } = await openPosition();

    await expectMoved(creditAccount, debt, async () => {
      await mined(
        await wallet.writeContract({
          address: bot,
          abi: finalizeOpenAbi,
          functionName: "finalizeOpen",
          args: [
            creditAccount,
            VBILL,
            { target: zeroAddress, callData: "0x" },
            zeroAddress,
          ],
          gas: GAS_LIMIT,
        }),
      );
    });
  }, 300_000);

  it("moveToAave moves the position, and the margin left over reaches the wallet", async () => {
    const { creditAccount, debt } = await openPosition();
    const held = await balanceOf(RLUSD, investor);

    await expectMoved(creditAccount, debt, async () => {
      await sync();
      const sim = await gearbox.opportunities.prepare.moveToAave(
        { chainId: chains.Mainnet.id, creditAccount },
        { token: VBILL, to: investor },
      );
      if (!sim.ok) throw new Error(`move sim failed: ${sim.error.code}`);
      const tx = await gearbox.opportunities.execute.buildTx({
        kind: "account",
        chainId: chains.Mainnet.id,
        creditAccount,
        wallet: investor,
        sim,
      });
      await mined(await sendRawTx(wallet, { tx, gas: GAS_LIMIT }));
    });

    expect(await balanceOf(RLUSD, investor)).toBeGreaterThan(held);
  }, 300_000);
});
