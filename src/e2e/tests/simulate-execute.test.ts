import {
  type Address,
  erc20Abi,
  type Hex,
  http,
  parseEventLogs,
  parseUnits,
} from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { createAnvilClient } from "../../dev/createAnvilClient.js";
import type { PrepareRequest } from "../../new-sdk/index.js";
import { GearboxSDK } from "../../new-sdk/index.js";
import { AdaptersPlugin } from "../../plugins/adapters/AdaptersPlugin.js";
import { checkPrerequisites } from "../../preview/index.js";
import { calcBorrowedAmountPlusInterestAndFees } from "../../sdk/accounts/intents/utils/borrowed-amount-plus-interest-and-fees.js";
import {
  type CreditAccountDataPayload,
  MAX_UINT256,
  MultichainSDK,
  type OnchainSDK,
  PERCENTAGE_FACTOR,
  type RawTx,
  sendRawTx,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { getAnvilWallet, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

/**
 * The invariant the sdk-first plan rests on: what `simulate` projected is what
 * the chain does once `execute().buildTx` is sent — per field, per direction, on
 * a mainnet fork. `min` below is `sim.preview`, the router floor after
 * slippage `S`.
 *
 * Bounds, never equalities, after a send that swaps: `totalValue` sits between
 * the floor and the pre-slippage expectation; a borrow leg's debt is bracketed
 * by the re-read principal and principal + interest + fees. A repay leg is the
 * exception: with the send block pinned to the sim's block timestamp there is
 * no accrual between the two, and the projected debt is exact.
 */

const BLOCK = 24_728_000n;
const CHAIN_ID = 1;
const CREDIT_MANAGER: Address = "0x748a02cc6dd9090bd6bbcd1fd45790b50524ae87";
const TARGET_TOKEN: Address = "0x1774A6b4aba3B999461a1682f6776cAc66dD1987"; // stkcvxpmcrvUSD
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

/** Router slippage, in `PERCENTAGE_FACTOR` units. */
const S = 50;
const X2 = 200n;
const X3 = 300n;
const COLLATERAL = parseUnits("1000", 6);
const WALLET_USDC = parseUnits("5000", 6);

type Plugins = { adapters: AdaptersPlugin };

describe("simulate → execute on a mainnet fork", () => {
  let multichain: MultichainSDK<Plugins>;
  let gearbox: GearboxSDK<"onchain">;
  let chain: OnchainSDK<Plugins>;
  let wallet: ReturnType<typeof getAnvilWallet>;
  let borrower: Address;
  let underlying: Address;
  const anvil = createAnvilClient({ transport: http(ANVIL_URL) });

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    multichain = new MultichainSDK<Plugins>({
      chains: { Mainnet: { rpcURLs: [ANVIL_URL], timeout: 120_000 } },
      plugins: { adapters: () => new AdaptersPlugin(true) },
    });
    await multichain.attach({
      perChain: { Mainnet: { blockNumber: BLOCK } },
      redstone: { historicTimestamp: true, gateways: REDSTONE_GATEWAYS },
    });
    chain = multichain.chain(CHAIN_ID);
    gearbox = new GearboxSDK({
      mode: "onchain",
      networks: ["Mainnet"],
      onchain: multichain,
    });
    wallet = getAnvilWallet(chain);
    borrower = wallet.account.address;
    underlying =
      chain.marketRegister.findCreditManager(CREDIT_MANAGER).creditManager
        .underlying;
  });

  // ---- helpers ------------------------------------------------------------

  // resolved lazily: `gearbox` exists only after `beforeAll`
  const simulate = () => gearbox.opportunities.simulate;
  const execute = () => gearbox.opportunities.execute;

  async function mined(hash: Hex) {
    const receipt = await chain.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(receipt.status).toBe("success");
    return receipt;
  }

  async function fund(): Promise<void> {
    await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
    await mined(
      await wallet.writeContract({
        address: USDC,
        abi: erc20Abi,
        functionName: "approve",
        args: [CREDIT_MANAGER, MAX_UINT256],
      }),
    );
  }

  /** The chain as the simulations will read it: nothing mined after this. */
  async function sync(): Promise<void> {
    const block = await chain.client.getBlock({ blockTag: "latest" });
    await chain.syncState({
      blockNumber: block.number,
      timestamp: block.timestamp,
      ignoreUpdateablePrices: true,
    });
  }

  async function send(request: PrepareRequest): Promise<RawTx> {
    const tx = await execute().buildTx(request);
    const prerequisites = await checkPrerequisites({
      sdk: chain,
      to: tx.to,
      calldata: tx.callData,
      sender: borrower,
      value: BigInt(tx.value),
    });
    expect(
      prerequisites.filter(p => p.satisfied !== true),
      "prerequisites the send still needs",
    ).toEqual([]);
    await mined(await sendRawTx(wallet, { tx }));
    return tx;
  }

  async function account(creditAccount: Address) {
    const data = await chain.accounts.getCreditAccountData(creditAccount);
    if (!data) throw new Error(`account ${creditAccount} not found`);
    return data;
  }

  const OPEN_KEY = {
    chainId: CHAIN_ID,
    creditManager: CREDIT_MANAGER,
    targetCollateral: TARGET_TOKEN,
  };
  const OPEN_PARAMS = {
    collateral: [{ token: USDC, balance: COLLATERAL }],
    leverage: X2,
    slippage: S,
  };

  /** Simulates the 2x open on the synced state and sends it. */
  async function openPosition(): Promise<{
    creditAccount: Address;
    before: CreditAccountDataPayload;
    preview: Extract<
      Awaited<
        ReturnType<ReturnType<typeof simulate>["openNewStrategy"]>
      >["data"],
      { ok: true }
    >["preview"];
  }> {
    await fund();
    await sync();
    const sim = await simulate().openNewStrategy(OPEN_KEY, OPEN_PARAMS);
    if (!sim.data.ok) throw new Error(`open sim failed: ${sim.data.reason}`);
    const tx = await execute().buildTx({
      kind: "open",
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
      wallet: borrower,
      sim: sim.data,
      collateral: OPEN_PARAMS.collateral,
      ethAmount: 0n,
    });
    const receipt = await mined(await sendRawTx(wallet, { tx }));
    const [log] = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    const creditAccount = log.args.creditAccount;
    return {
      creditAccount,
      before: await account(creditAccount),
      preview: sim.data.preview,
    };
  }

  function position(creditAccount: Address) {
    return { chainId: CHAIN_ID, creditAccount };
  }

  /** `min ≤ actual ≤ min · (1 + S / (10000 − S))` — floor and pre-slippage ceiling. */
  function expectValueBracket(actual: bigint, min: bigint): void {
    expect(actual).toBeGreaterThanOrEqual(min);
    expect(actual).toBeLessThanOrEqual(
      (min * PERCENTAGE_FACTOR) / (PERCENTAGE_FACTOR - BigInt(S)),
    );
  }

  /** `principal ≤ projected ≤ principal + interest + fees` — no rate is read. */
  function expectDebtBracket(
    after: CreditAccountDataPayload,
    projected: bigint,
  ): void {
    expect(after.debt).toBeLessThanOrEqual(projected);
    expect(projected).toBeLessThanOrEqual(
      calcBorrowedAmountPlusInterestAndFees(after),
    );
  }

  /**
   * Repay legs: pin every block from the sim to the send to the sim's block
   * timestamp, so `decreaseDebt` clears no accrual and the projection is exact.
   */
  async function pinTo(timestamp: number): Promise<void> {
    await anvil.setNextBlockTimestamp({ timestamp: BigInt(timestamp) });
  }

  function adjustPreview(
    sim: Awaited<ReturnType<ReturnType<typeof simulate>["adjustLeverage"]>>,
  ) {
    if (!sim.data.ok) throw new Error(`sim failed: ${sim.data.reason}`);
    const [meta] = sim.meta.chains;
    if (meta?.status !== "success") throw new Error("sim did not succeed");
    return {
      sim: sim.data,
      preview: sim.data.preview,
      timestamp: meta.timestamp,
    };
  }

  // ---- open ---------------------------------------------------------------

  describe("openNewStrategy", () => {
    it("borrows exactly the preview's debt", async () => {
      const { before, preview } = await openPosition();

      expect(before.debt).toBe(preview.debt);
    });

    it("ends with at least the value of the preview's floor assets", async () => {
      const { before, preview } = await openPosition();
      const { priceOracle } =
        chain.marketRegister.findByCreditManager(CREDIT_MANAGER);
      const floor = preview.minAssets.reduce(
        (sum, a) => sum + priceOracle.convert(a.token, underlying, a.balance),
        0n,
      );

      expect(before.totalValue).toBeGreaterThanOrEqual(floor);
    });

    it("without the allowance, checkPrerequisites reports it and the send reverts before any block", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await sync();
      const sim = await simulate().openNewStrategy(OPEN_KEY, OPEN_PARAMS);
      if (!sim.data.ok) throw new Error(sim.data.reason);
      const tx = await execute().buildTx({
        kind: "open",
        chainId: CHAIN_ID,
        creditManager: CREDIT_MANAGER,
        wallet: borrower,
        sim: sim.data,
        collateral: OPEN_PARAMS.collateral,
        ethAmount: 0n,
      });

      const prerequisites = await checkPrerequisites({
        sdk: chain,
        to: tx.to,
        calldata: tx.callData,
        sender: borrower,
      });
      expect(
        prerequisites.some(
          p => p.kind === "allowance" && p.satisfied === false,
        ),
      ).toBe(true);
      const blockBefore = await chain.client.getBlockNumber();
      await expect(sendRawTx(wallet, { tx })).rejects.toThrow();
      expect(await chain.client.getBlockNumber()).toBe(blockBefore);
    });
  });

  // ---- account operations -------------------------------------------------

  describe("depositStrategy — borrow leg", () => {
    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().depositStrategy(position(creditAccount), {
          token: USDC,
          amount: parseUnits("500", 6),
          positionToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is bracketed by the re-read principal and principal + interest + fees", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().depositStrategy(position(creditAccount), {
          token: USDC,
          amount: parseUnits("500", 6),
          positionToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectDebtBracket(await account(creditAccount), preview.accountDebt);
    });
  });

  describe("adjustLeverage up — borrow leg", () => {
    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().adjustLeverage(position(creditAccount), {
          targetLeverage: X3,
          token: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is bracketed by the re-read principal and principal + interest + fees", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().adjustLeverage(position(creditAccount), {
          targetLeverage: X3,
          token: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectDebtBracket(await account(creditAccount), preview.accountDebt);
    });
  });

  describe("adjustLeverage down — repay leg", () => {
    // precondition: repaying from 2x to 1.5x on 1000 of collateral returns ~500
    // of debt, far above the interest and fees a few blocks accrue
    const X1_5 = 150n;

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await simulate().adjustLeverage(position(creditAccount), {
          targetLeverage: X1_5,
          token: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is exact with the send block pinned to the sim's timestamp", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await simulate().adjustLeverage(position(creditAccount), {
          targetLeverage: X1_5,
          token: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expect(
        calcBorrowedAmountPlusInterestAndFees(await account(creditAccount)),
      ).toBe(preview.accountDebt);
    });
  });

  describe("withdrawStrategy — repay leg", () => {
    const W = parseUnits("200", 6);

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await simulate().withdrawStrategy(position(creditAccount), {
          amount: W,
          to: borrower,
          sourceToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is exact with the send block pinned to the sim's timestamp", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await simulate().withdrawStrategy(position(creditAccount), {
          amount: W,
          to: borrower,
          sourceToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expect(
        calcBorrowedAmountPlusInterestAndFees(await account(creditAccount)),
      ).toBe(preview.accountDebt);
    });

    it("maxWithdraw leaves the account at the debt floor, still open", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const max = await simulate().maxWithdraw(position(creditAccount));
      expect(max.meta.chains[0]?.status).toBe("success");
      const { sim, timestamp } = adjustPreview(
        await simulate().withdrawStrategy(position(creditAccount), {
          amount: max.data,
          to: borrower,
          sourceToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      const { minDebt } =
        chain.marketRegister.findCreditManager(CREDIT_MANAGER).creditFacade;
      const positions = await gearbox.positions.list(borrower);
      const still = positions.data.find(
        p =>
          p.kind === "strategy" &&
          p.creditAccount.toLowerCase() === creditAccount.toLowerCase(),
      );
      expect(still, "position still listed").toBeDefined();
      if (still?.kind !== "strategy") throw new Error("unreachable");
      expect(still.totalDebt.value).toBeGreaterThanOrEqual(minDebt);
    });
  });

  describe("addCollateral — debt untouched", () => {
    const AMOUNT = parseUnits("300", 6);

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().addCollateral(position(creditAccount), {
          token: underlying,
          amount: AMOUNT,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is bracketed by the re-read principal and principal + interest + fees", async () => {
      const { creditAccount, before } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().addCollateral(position(creditAccount), {
          token: underlying,
          amount: AMOUNT,
        }),
      );
      expect(preview.accountDebt).toBe(
        calcBorrowedAmountPlusInterestAndFees(before),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectDebtBracket(await account(creditAccount), preview.accountDebt);
    });
  });

  describe("withdrawCollateral — debt untouched", () => {
    // withdraw part of the underlying added first, so no swap is involved
    const ADDED = parseUnits("300", 6);
    const OUT = parseUnits("100", 6);

    async function withUnderlying(creditAccount: Address) {
      await sync();
      const { sim } = adjustPreview(
        await simulate().addCollateral(position(creditAccount), {
          token: underlying,
          amount: ADDED,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });
    }

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await withUnderlying(creditAccount);
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().withdrawCollateral(position(creditAccount), {
          token: underlying,
          amount: OUT,
          to: borrower,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });

    it("accountDebt is bracketed by the re-read principal and principal + interest + fees", async () => {
      const { creditAccount } = await openPosition();
      await withUnderlying(creditAccount);
      await sync();
      const { sim, preview } = adjustPreview(
        await simulate().withdrawCollateral(position(creditAccount), {
          token: underlying,
          amount: OUT,
          to: borrower,
        }),
      );
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      expectDebtBracket(await account(creditAccount), preview.accountDebt);
    });
  });

  // ---- pool ---------------------------------------------------------------

  describe("pool", () => {
    let pool: Address;
    let shares: Address;

    beforeAll(() => {
      const market = chain.marketRegister.findByCreditManager(CREDIT_MANAGER);
      pool = market.pool.pool.address;
      shares = pool;
    });

    async function balance(token: Address): Promise<bigint> {
      return chain.client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [borrower],
      });
    }

    async function approve(token: Address, spender: Address): Promise<void> {
      await mined(
        await wallet.writeContract({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, MAX_UINT256],
        }),
      );
    }

    it("deposit: shares received are at most what the loaded-block rate promised", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await approve(USDC, pool);
      await sync();
      const sim = simulate().deposit(
        { chainId: CHAIN_ID, pool },
        { amount: COLLATERAL, wallet: borrower },
      );
      if (!sim.ok) throw new Error(`deposit sim failed: ${sim.reason}`);
      const before = await balance(shares);
      await send({
        kind: "pool",
        chainId: CHAIN_ID,
        pool,
        wallet: borrower,
        op: "deposit",
        sim,
      });

      expect((await balance(shares)) - before).toBeLessThanOrEqual(
        sim.preview.tokenOut.balance,
      );
    });

    it("withdraw: underlying received is at least what the loaded-block rate promised", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await approve(USDC, pool);
      await sync();
      const deposit = simulate().deposit(
        { chainId: CHAIN_ID, pool },
        { amount: COLLATERAL, wallet: borrower },
      );
      if (!deposit.ok) throw new Error(`deposit sim failed: ${deposit.reason}`);
      await send({
        kind: "pool",
        chainId: CHAIN_ID,
        pool,
        wallet: borrower,
        op: "deposit",
        sim: deposit,
      });
      await sync();
      const sim = simulate().withdraw(
        { chainId: CHAIN_ID, pool },
        { amount: COLLATERAL / 2n, wallet: borrower },
      );
      if (!sim.ok) throw new Error(`withdraw sim failed: ${sim.reason}`);
      const before = await balance(USDC);
      await send({
        kind: "pool",
        chainId: CHAIN_ID,
        pool,
        wallet: borrower,
        op: "withdraw",
        sim,
      });

      expect((await balance(USDC)) - before).toBeGreaterThanOrEqual(
        sim.preview.tokenOut.balance,
      );
    });
  });
});
