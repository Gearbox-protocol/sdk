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
import { calcBorrowedAmountPlusInterestAndFees } from "../../onchain/accounts/intents/utils/borrowed-amount-plus-interest-and-fees.js";
import {
  type CreditAccountDataPayload,
  MAX_UINT256,
  MultichainSDK,
  type OnchainSDK,
  PERCENTAGE_FACTOR,
  type RawTx,
  sendRawTx,
} from "../../onchain/index.js";
import { checkPrerequisites } from "../../preview/index.js";
import type { PrepareRequest } from "../../sdk/index.js";
import { GearboxSDK } from "../../sdk/index.js";
import { ANVIL_URL, GAS_LIMIT } from "../constants.js";
import { getAnvilWallet, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

/**
 * The invariant the sdk-first plan rests on: what `prepare` projected is what
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

/** A market whose underlying is the wrapped native coin, for the flows paid in it. */
const WETH_CM: Address = "0x9fF97B167Dd442bd5f277098bf1154C5807D3566";
const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WSTETH: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
/** Above the 10 WETH this manager's facade wants as a debt floor at 2x. */
const NATIVE_COLLATERAL = parseUnits("12", 18);
const NATIVE_TOP_UP = parseUnits("2", 18);

/** Router slippage, in `PERCENTAGE_FACTOR` units. */
const S = 50;
const X2 = 200n;
const X3 = 300n;
const COLLATERAL = parseUnits("1000", 6);
const WALLET_USDC = parseUnits("5000", 6);

describe("prepare → execute on a mainnet fork", () => {
  let multichain: MultichainSDK;
  let gearbox: GearboxSDK<"onchain">;
  let chain: OnchainSDK;
  let wallet: ReturnType<typeof getAnvilWallet>;
  let borrower: Address;
  let underlying: Address;
  const anvil = createAnvilClient({ transport: http(ANVIL_URL) });

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    multichain = new MultichainSDK({
      chains: { Mainnet: { rpcURLs: [ANVIL_URL], timeout: 120_000 } },
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
  const prepare = () => gearbox.opportunities.prepare;
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
    await mined(await sendRawTx(wallet, { tx, gas: GAS_LIMIT }));
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
  };
  const OPEN_PARAMS = {
    collateral: [{ token: USDC, balance: COLLATERAL }],
    leverage: X2,
    slippage: S,
    targetToken: TARGET_TOKEN,
  };

  /** Simulates the 2x open on the synced state and sends it. */
  async function openPosition(): Promise<{
    creditAccount: Address;
    before: CreditAccountDataPayload;
    preview: Extract<
      Awaited<
        ReturnType<ReturnType<typeof prepare>["openNewStrategy"]>
      >["data"],
      { ok: true }
    >["preview"];
  }> {
    await fund();
    await sync();
    const sim = await prepare().openNewStrategy(OPEN_KEY, OPEN_PARAMS);
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
    const receipt = await mined(
      await sendRawTx(wallet, { tx, gas: GAS_LIMIT }),
    );
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

  /**
   * `min ≤ actual ≤ min · (1 + S / (10000 − S))` — floor and pre-slippage
   * ceiling.
   *
   * The floor gets a millionth of slack because both sides price the position
   * with the oracle, and the price the SDK holds can sit one unit of the feed's
   * 1e-8 scale away from the one the account is read with — a couple of dozen
   * wei on a position this size, four orders of magnitude below the slippage
   * this bracket is here to catch.
   */
  function expectValueBracket(actual: bigint, min: bigint): void {
    expect(actual).toBeGreaterThanOrEqual(min - min / 1_000_000n);
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

  /** A flow with a single route: the simulation is the preview. */
  function adjustPreview(
    sim: Awaited<ReturnType<ReturnType<typeof prepare>["depositStrategy"]>>,
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

  /**
   * The instant route of a flow that quotes two, which is the one this market
   * offers: nothing here redeems through an issuer.
   */
  function routedPreview(
    sim: Awaited<ReturnType<ReturnType<typeof prepare>["adjustLeverage"]>>,
  ) {
    if (!sim.data.ok) throw new Error(`sim failed: ${sim.data.reason}`);
    const [meta] = sim.meta.chains;
    if (meta?.status !== "success") throw new Error("sim did not succeed");
    const { instant } = sim.data;
    if (!instant) {
      throw new Error(`no instant route: ${sim.data.refused.instant}`);
    }
    return {
      sim: instant,
      preview: instant.preview,
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
        (sum, a) =>
          sum + priceOracle.convert(a.token.address, underlying, a.value),
        0n,
      );

      expect(before.totalValue).toBeGreaterThanOrEqual(floor);
    });

    it("without the allowance, checkPrerequisites reports it and the send reverts before any block", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await sync();
      const sim = await prepare().openNewStrategy(OPEN_KEY, OPEN_PARAMS);
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
      await expect(sendRawTx(wallet, { tx })).rejects.toThrow();
    });
  });

  // ---- account operations -------------------------------------------------

  describe("depositStrategy — borrow leg", () => {
    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await prepare().depositStrategy(position(creditAccount), {
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
        await prepare().depositStrategy(position(creditAccount), {
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

  describe("depositStrategy — target leverage", () => {
    // 500 on top of the 1000 the position was opened with, taken from 2x to
    // 3x: the debt is the one the target asks for, not the one the ratio kept
    const ADDED = parseUnits("500", 6);

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await prepare().depositStrategy(position(creditAccount), {
          token: USDC,
          amount: ADDED,
          positionToken: TARGET_TOKEN,
          targetLeverage: X3,
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
      const { creditAccount, before } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await prepare().depositStrategy(position(creditAccount), {
          token: USDC,
          amount: ADDED,
          positionToken: TARGET_TOKEN,
          targetLeverage: X3,
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
      // the target was above the leverage held, so the loan grew
      expect(preview.accountDebt).toBeGreaterThan(before.debt);
    });
  });

  describe("adjustLeverage up — borrow leg", () => {
    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = routedPreview(
        await prepare().adjustLeverage(position(creditAccount), {
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
      const { sim, preview } = routedPreview(
        await prepare().adjustLeverage(position(creditAccount), {
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
      const { sim, preview, timestamp } = routedPreview(
        await prepare().adjustLeverage(position(creditAccount), {
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
      const { sim, preview, timestamp } = routedPreview(
        await prepare().adjustLeverage(position(creditAccount), {
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
      const { sim, preview, timestamp } = routedPreview(
        await prepare().withdrawStrategy(position(creditAccount), {
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
      const { sim, preview, timestamp } = routedPreview(
        await prepare().withdrawStrategy(position(creditAccount), {
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
      const max = await prepare().maxWithdraw(position(creditAccount));
      expect(max.meta.chains[0]?.status).toBe("success");
      const { sim, timestamp } = routedPreview(
        await prepare().withdrawStrategy(position(creditAccount), {
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

    it("asking past the net value exits: debt, quotas and balances all go", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      // Total value is more than the account's net value by exactly the debt,
      // so this is unambiguously the exit rather than a partial withdrawal.
      const { totalValue } = await account(creditAccount);
      const { sim, preview, timestamp } = routedPreview(
        await prepare().withdrawStrategy(position(creditAccount), {
          amount: totalValue,
          to: borrower,
          sourceToken: TARGET_TOKEN,
          slippage: S,
        }),
      );
      expect(preview.accountDebt).toBe(0n);
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      const after = await account(creditAccount);
      expect(calcBorrowedAmountPlusInterestAndFees(after)).toBe(0n);
      expect(after.tokens.filter(t => t.quota > 0n)).toEqual([]);
      expect(after.tokens.filter(t => t.balance > 1n)).toEqual([]);
    });

    it("MAX_UINT256 exits through one many-to-one route, and the wallet gets the underlying", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const before = await chain.client.readContract({
        address: underlying,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [borrower],
      });
      const { totalValue } = await account(creditAccount);
      const { sim, preview } = routedPreview(
        await prepare().withdrawStrategy(position(creditAccount), {
          amount: MAX_UINT256,
          to: borrower,
          slippage: S,
        }),
      );
      // one route for the whole position, and the payout is the underlying it
      // was sold into
      const swaps = sim.operations.filter(op => op.type === "swap");
      expect(swaps).toHaveLength(1);
      expect(swaps[0]?.from.map(a => a.token.toLowerCase())).toEqual([
        TARGET_TOKEN.toLowerCase(),
      ]);
      const payouts = sim.operations.filter(
        op => op.type === "withdrawCollateral",
      );
      expect(payouts.map(op => op.token.toLowerCase())).toEqual([
        underlying.toLowerCase(),
      ]);
      expect(preview.accountDebt).toBe(0n);
      // no pinning here: the exit settles the loan by the `full` flag rather
      // than by a quoted amount, so nothing below is exact to the block
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      const after = await account(creditAccount);
      expect(calcBorrowedAmountPlusInterestAndFees(after)).toBe(0n);
      expect(after.tokens.filter(t => t.quota > 0n)).toEqual([]);
      expect(after.tokens.filter(t => t.balance > 1n)).toEqual([]);
      // the payout names no amount, so the wallet gets whatever is left once the
      // loan is settled. The projection is a floor twice over — the route's
      // slippage and the interest the `full` repayment reserves — so the only
      // ceiling that holds is the position's own worth before it was sold
      const paid =
        (await chain.client.readContract({
          address: underlying,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [borrower],
        })) - before;
      expect(paid).toBeGreaterThanOrEqual(payouts[0]?.amount ?? 0n);
      expect(paid).toBeLessThanOrEqual(totalValue);
    });
  });

  describe("repayStrategy — repay leg, nothing sold", () => {
    const PART = parseUnits("300", 6);
    /** Interest the wallet covers on top of the quote when settling. */
    const BUFFER = parseUnits("10", 6);

    it("accountDebt is exact with the send block pinned to the sim's timestamp", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await prepare().repayStrategy(position(creditAccount), {
          token: underlying,
          amount: PART,
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

    it("maxRepay plus a buffer clears the debt and the quotas with it", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const max = await prepare().maxRepay(position(creditAccount));
      expect(max.meta.chains[0]?.status).toBe("success");
      const { sim, preview, timestamp } = adjustPreview(
        await prepare().repayStrategy(position(creditAccount), {
          token: underlying,
          amount: max.data + BUFFER,
        }),
      );
      expect(preview.accountDebt).toBe(0n);
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      const after = await account(creditAccount);
      expect(calcBorrowedAmountPlusInterestAndFees(after)).toBe(0n);
      // a quota outliving its debt would keep charging an account that owes
      // nothing, so the repayment takes them with it
      expect(after.tokens.filter(t => t.quota > 0n)).toEqual([]);
    });

    it("MAX_UINT256 settles the debt without the caller sizing the buffer", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview, timestamp } = adjustPreview(
        await prepare().repayStrategy(position(creditAccount), {
          token: underlying,
          amount: MAX_UINT256,
        }),
      );
      // the wallet is charged the debt plus the margin, and the facade is
      // asked for everything outstanding rather than for that figure
      const paid = sim.operations.find(op => op.type === "addCollateral");
      expect(paid?.amount).toBeGreaterThan(preview.accountDebt);
      expect(
        sim.operations.find(op => op.type === "decreaseDebt"),
      ).toMatchObject({ full: true });
      expect(preview.accountDebt).toBe(0n);
      await pinTo(timestamp);
      await send({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });

      const after = await account(creditAccount);
      expect(calcBorrowedAmountPlusInterestAndFees(after)).toBe(0n);
      expect(after.tokens.filter(t => t.quota > 0n)).toEqual([]);
    });
  });

  describe("addCollateral — debt untouched", () => {
    const AMOUNT = parseUnits("300", 6);

    it("totalValue lands between the floor and the pre-slippage expectation", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const { sim, preview } = adjustPreview(
        await prepare().addCollateral(position(creditAccount), {
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
        await prepare().addCollateral(position(creditAccount), {
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
        await prepare().addCollateral(position(creditAccount), {
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
        await prepare().withdrawCollateral(position(creditAccount), {
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
        await prepare().withdrawCollateral(position(creditAccount), {
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

  // ---- the native coin ----------------------------------------------------

  /**
   * A market whose underlying is the wrapped native coin takes the coin itself:
   * the facade wraps the transaction's value and hands the wrapped token back to
   * the caller, which the multicall then adds as collateral. So the wallet needs
   * an allowance, but no balance of the wrapped token at all — and the value has
   * to reach the transaction, which is the part only a send can prove.
   */
  describe("paying in the native coin", () => {
    const collateral = [{ token: WETH, balance: NATIVE_COLLATERAL }];

    async function coinBalance(): Promise<bigint> {
      return chain.client.getBalance({ address: borrower });
    }

    async function wrappedBalance(): Promise<bigint> {
      return chain.client.readContract({
        address: WETH,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [borrower],
      });
    }

    async function openWithCoin(): Promise<{
      creditAccount: Address;
      debt: bigint;
    }> {
      await mined(
        await wallet.writeContract({
          address: WETH,
          abi: erc20Abi,
          functionName: "approve",
          args: [WETH_CM, MAX_UINT256],
        }),
      );
      await sync();
      const sim = await prepare().openNewStrategy(
        { chainId: CHAIN_ID, creditManager: WETH_CM },
        { collateral, leverage: X2, slippage: S, targetToken: WSTETH },
      );
      if (!sim.data.ok) throw new Error(`open sim failed: ${sim.data.reason}`);
      const tx = await execute().buildTx({
        kind: "open",
        chainId: CHAIN_ID,
        creditManager: WETH_CM,
        wallet: borrower,
        sim: sim.data,
        collateral,
        ethAmount: NATIVE_COLLATERAL,
      });
      expect(BigInt(tx.value)).toBe(NATIVE_COLLATERAL);
      const receipt = await mined(
        await sendRawTx(wallet, { tx, gas: GAS_LIMIT }),
      );
      const [log] = parseEventLogs({
        abi: iCreditFacadeV310Abi,
        logs: receipt.logs,
        eventName: "OpenCreditAccount",
      });
      return {
        creditAccount: log.args.creditAccount,
        debt: sim.data.preview.debt,
      };
    }

    it("opens on the coin alone, leaving no wrapped token in the wallet", async () => {
      const before = await coinBalance();
      const { creditAccount, debt } = await openWithCoin();

      expect(before - (await coinBalance())).toBeGreaterThanOrEqual(
        NATIVE_COLLATERAL,
      );
      expect(await wrappedBalance()).toBe(0n);
      expect((await account(creditAccount)).debt).toBe(debt);
    });

    it("deposits the coin into an open position: the value rides on the transaction", async () => {
      const { creditAccount } = await openWithCoin();
      await sync();
      const { sim, preview } = adjustPreview(
        await prepare().depositStrategy(position(creditAccount), {
          token: WETH,
          amount: NATIVE_TOP_UP,
          value: NATIVE_TOP_UP,
          positionToken: WSTETH,
          slippage: S,
        }),
      );
      const tx = await execute().buildTx({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount,
        wallet: borrower,
        sim,
      });
      expect(BigInt(tx.value)).toBe(NATIVE_TOP_UP);
      const before = await coinBalance();
      await mined(await sendRawTx(wallet, { tx, gas: GAS_LIMIT }));

      expect(before - (await coinBalance())).toBeGreaterThanOrEqual(
        NATIVE_TOP_UP,
      );
      expect(await wrappedBalance()).toBe(0n);
      expectValueBracket(
        (await account(creditAccount)).totalValue,
        preview.totalValue,
      );
    });
  });

  // ---- refusals -----------------------------------------------------------

  /**
   * The refusals the engine reads off the live market rather than off its
   * arguments: the underlying this manager was configured with, the debt band
   * it enforces, the balances the account actually holds. The reasons are
   * values, so nothing here sends or throws.
   */
  describe("what the market itself refuses", () => {
    it("takes no collateral but the underlying the manager was configured with", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const sim = await prepare().depositStrategy(position(creditAccount), {
        token: TARGET_TOKEN,
        amount: parseUnits("1", 18),
        slippage: S,
      });

      if (sim.data.ok || sim.data.reason !== "unsupportedCollateralToken") {
        throw new Error("expected unsupportedCollateralToken");
      }
      expect(sim.data.detail.token).toBe(TARGET_TOKEN);
    });

    it("refuses a deposit whose debt would pass the manager's own maxDebt", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const ceiling =
        chain.marketRegister.findCreditManager(CREDIT_MANAGER).creditFacade
          .maxDebt;
      const sim = await prepare().depositStrategy(position(creditAccount), {
        // at the leverage held, this much collateral draws more than the ceiling
        token: USDC,
        amount: ceiling * 2n,
        positionToken: TARGET_TOKEN,
        slippage: S,
      });

      if (sim.data.ok || sim.data.reason !== "debtOutOfRange") {
        throw new Error("expected debtOutOfRange");
      }
      // The ceiling comes back with the refusal, so a form can clamp to it
      // instead of asking again to find out where it is.
      expect(sim.data.detail.maxDebt.balance).toBe(ceiling);
      expect(sim.data.detail.requested.balance).toBeGreaterThan(ceiling);
    });

    it("refuses a leverage the collateral cannot carry, and reports it per route", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const sim = await prepare().adjustLeverage(position(creditAccount), {
        targetLeverage: 5_000n,
        token: TARGET_TOKEN,
        slippage: S,
      });

      // 50x on this market's thresholds ends the transaction under water, which
      // the facade refuses; the redemption route does not exist here at all
      if (sim.data.ok || sim.data.reason !== "insufficientCollateral") {
        throw new Error("expected insufficientCollateral");
      }
      expect(sim.data.refused).toEqual({
        instant: "insufficientCollateral",
        delayed: "noDelayedRoute",
      });
      expect(sim.data.detail.healthFactor).toBeLessThan(
        sim.data.detail.required,
      );
    });

    it("refuses to move out collateral the account does not hold", async () => {
      const { creditAccount } = await openPosition();
      await sync();
      const sim = await prepare().withdrawCollateral(position(creditAccount), {
        token: USDC,
        amount: parseUnits("100", 6),
        to: borrower,
      });

      if (sim.data.ok || sim.data.reason !== "insufficientSourceBalance") {
        throw new Error("expected insufficientSourceBalance");
      }
      // The detail is optional on this reason because most of its sites refuse
      // before there is a balance to compare. This one is the ledger walk, so
      // it names both sides; `held` is whatever dust the open left behind.
      expect(sim.data.detail?.required).toEqual({
        token: USDC,
        balance: parseUnits("100", 6),
      });
      expect(sim.data.detail?.held.token).toBe(USDC);
      expect(sim.data.detail?.held.balance).toBeLessThan(parseUnits("100", 6));
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
      const sim = prepare().deposit(
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

      // the rate is read a block before the mint, and a share only ever grows,
      // so the mint is that figure or a hair under it — never above
      const minted = (await balance(shares)) - before;
      const promised = sim.preview.tokenOut.balance;
      expect(minted).toBeLessThanOrEqual(promised);
      expect(minted).toBeGreaterThanOrEqual(promised - promised / 1_000_000n);
    });

    it("withdraw: underlying received is at least what the loaded-block rate promised", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await approve(USDC, pool);
      await sync();
      const deposit = prepare().deposit(
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
      const sim = prepare().withdraw(
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

    it("redeem: the shares asked for are burned, and the underlying they were worth arrives", async () => {
      await anvil.deal({ erc20: USDC, account: borrower, amount: WALLET_USDC });
      await approve(USDC, pool);
      await sync();
      const deposit = prepare().deposit(
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
      const held = await balance(shares);
      const burned = held / 2n;
      const sim = prepare().redeem(
        { chainId: CHAIN_ID, pool },
        { amount: burned, wallet: borrower },
      );
      if (!sim.ok) throw new Error(`redeem sim failed: ${sim.reason}`);
      const before = await balance(USDC);
      await send({
        kind: "pool",
        chainId: CHAIN_ID,
        pool,
        wallet: borrower,
        op: "redeem",
        sim,
      });

      // redeem is denominated in shares, so that side of it is exact
      expect(held - (await balance(shares))).toBe(burned);
      // the underlying is the loaded-block rate applied to those shares. The
      // send lands a block later, and a share only ever grows, so the payout is
      // that figure or a hair above it — never below.
      const paid = (await balance(USDC)) - before;
      const promised = sim.preview.tokenOut.balance;
      expect(paid).toBeGreaterThanOrEqual(promised);
      expect(paid).toBeLessThanOrEqual(promised + promised / 1_000_000n + 1n);
    });
  });
});
