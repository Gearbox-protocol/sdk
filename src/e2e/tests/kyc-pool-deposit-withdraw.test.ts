import {
  type Address,
  createTestClient,
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  http,
  type PublicClient,
  parseEther,
  parseUnits,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { dealActions } from "viem-deal";
import { beforeAll, describe, expect, it } from "vitest";
import {
  chains,
  type KYCDefaultTokenMeta,
  type KYCOnDemandTokenMeta,
  MAX_UINT256,
  OnchainSDK,
  PoolService,
  type PoolServiceCall,
} from "../../sdk/index.js";

const KYC_RPC_URL = "https://anvil.gearbox.foundation/rpc/Securitize";

const MARKET_CONFIGURATOR: Address =
  "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad";
const KYC_FACTORY: Address = "0x867b5b0cd9999959f696cef4ecf7777a39516d27";

const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// KYC Default pool: PoolV3(Mock Diesel Default compliant USD Coin)
const DEFAULT_POOL: Address = "0xA052899a26a7847E694631B53D1c4C83d0FE1529";
const DC_USDC: Address = "0x42d3618A6c0770d413c93D4d1bEcC041C27D7524";

// KYC On-Demand pool: PoolV3(Mock Diesel On-demand compliant USD Coin)
const ON_DEMAND_POOL: Address = "0x4284dC6CdDC8Da0fE9aa369ab682706912605954";
const OC_USDC: Address = "0x5a1C395181b397e7f389629b3575e091a20d160d";

const ANVIL_ACCOUNT = privateKeyToAccount(generatePrivateKey());

const anvil = createTestClient({
  mode: "anvil",
  transport: http(KYC_RPC_URL),
  chain: chains.Mainnet,
  pollingInterval: 100,
}).extend(dealActions);

async function getBalances(
  client: PublicClient,
  account: Address,
  tokens: Address[],
): Promise<Record<Address, bigint>> {
  const results = await client.multicall({
    contracts: tokens.map(token => ({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
    })),
  });
  return Object.fromEntries(
    tokens.map((token, i) => [token, results[i].result ?? 0n]),
  );
}

function encodePoolCall(call: PoolServiceCall): {
  to: Address;
  data: Hex;
  value?: bigint;
} {
  return {
    to: call.target,
    data: encodeFunctionData({
      abi: call.abi,
      functionName: call.functionName,
      args: call.args,
    }),
    value: call.value,
  };
}

describe.skipIf(!!process.env.CI)("KYC pool deposit and withdraw", () => {
  let sdk: OnchainSDK;

  beforeAll(async () => {
    sdk = new OnchainSDK("Mainnet", {
      rpcURLs: [KYC_RPC_URL],
      timeout: 120_000,
    });
    await sdk.attach({
      marketConfigurators: [MARKET_CONFIGURATOR],
      kycFactories: [KYC_FACTORY],
      ignoreUpdateablePrices: true,
    });
    await sdk.tokensMeta.loadTokenData();
    await sdk.marketRegister.loadZappers();
    await anvil.setBalance({
      address: ANVIL_ACCOUNT.address,
      value: parseEther("1000"),
    });
  });

  describe("KYC default underlying (dcUSDC)", () => {
    it("should recognize dcUSDC as KYC default underlying", () => {
      const meta = sdk.tokensMeta.mustGet(DC_USDC);
      expect(sdk.tokensMeta.isKYCUnderlying(meta)).toBe(true);
      expect(meta.contractType).toBe("KYC_UNDERLYING::DEFAULT");

      const kycMeta = meta as KYCDefaultTokenMeta;
      expect(kycMeta.kycFactory.toLowerCase()).toBe(KYC_FACTORY.toLowerCase());
      expect(kycMeta.asset).toBeDefined();
    });

    it("should deposit and withdraw from KYC default pool", async () => {
      const wallet = createWalletClient({
        chain: sdk.client.chain,
        transport: http(KYC_RPC_URL, { timeout: 120_000 }),
        account: ANVIL_ACCOUNT,
        pollingInterval: 100,
      });
      const account = wallet.account.address;
      const poolService = new PoolService(sdk);

      const tokensIn = poolService.getDepositTokensIn(DEFAULT_POOL);
      expect(tokensIn).toEqual([USDC]);

      const tokenIn = tokensIn[0];
      const tokensOut = poolService.getDepositTokensOut(DEFAULT_POOL, tokenIn);
      expect(tokensOut).toEqual([DEFAULT_POOL]);
      const tokenOut = tokensOut[0];

      const depositMeta = poolService.getDepositMetadata(
        DEFAULT_POOL,
        tokenIn,
        tokenOut,
      );
      expect(depositMeta.type).toBe("kyc-default");

      const depositAmount = parseUnits("100", 6);
      await anvil.deal({
        erc20: tokenIn,
        account,
        amount: 2n * depositAmount,
      });

      let hash = await wallet.writeContract({
        address: tokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [depositMeta.approveTarget, MAX_UINT256],
      });
      await sdk.client.waitForTransactionReceipt({
        hash,
        pollingInterval: 100,
      });

      const beforeDeposit = await getBalances(sdk.client, account, [
        tokenIn,
        DEFAULT_POOL,
      ]);

      const depositCall = poolService.addLiquidity({
        collateral: { token: tokenIn, balance: depositAmount },
        pool: DEFAULT_POOL,
        wallet: account,
        meta: depositMeta,
        referralCode: 0n,
      });
      if (!depositCall) {
        throw new Error("addLiquidity returned undefined for KYC default pool");
      }

      const encoded = encodePoolCall(depositCall);
      hash = await wallet.sendTransaction(encoded);
      const depositReceipt = await sdk.client.waitForTransactionReceipt({
        hash,
        pollingInterval: 100,
      });
      expect(depositReceipt.status).toBe("success");

      const afterDeposit = await getBalances(sdk.client, account, [
        tokenIn,
        DEFAULT_POOL,
      ]);
      expect(afterDeposit[tokenIn]).toBeLessThan(beforeDeposit[tokenIn]);
      expect(afterDeposit[DEFAULT_POOL]).toBeGreaterThan(0n);

      const sharesReceived = afterDeposit[DEFAULT_POOL];

      // --- Withdrawal ---
      const withdrawTokensIn = poolService.getWithdrawalTokensIn(DEFAULT_POOL);
      expect(withdrawTokensIn).toEqual([DEFAULT_POOL]);

      const withdrawTokenIn = withdrawTokensIn[0];
      const withdrawTokensOut = poolService.getWithdrawalTokensOut(
        DEFAULT_POOL,
        withdrawTokenIn,
      );
      expect(withdrawTokensOut).toEqual([USDC]);

      const withdrawalMeta = poolService.getWithdrawalMetadata(
        DEFAULT_POOL,
        withdrawTokenIn,
        withdrawTokensOut[0],
      );
      expect(withdrawalMeta.type).toBe("kyc-default");

      hash = await wallet.writeContract({
        address: withdrawTokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [withdrawalMeta.approveTarget!, MAX_UINT256],
      });
      await sdk.client.waitForTransactionReceipt({
        hash,
        pollingInterval: 100,
      });

      const withdrawCall = poolService.removeLiquidity({
        pool: DEFAULT_POOL,
        amount: sharesReceived,
        wallet: account,
        permit: undefined,
        meta: withdrawalMeta,
      });

      const withdrawEncoded = encodePoolCall(withdrawCall);
      hash = await wallet.sendTransaction(withdrawEncoded);
      const withdrawReceipt = await sdk.client.waitForTransactionReceipt({
        hash,
        pollingInterval: 100,
      });
      expect(withdrawReceipt.status).toBe("success");

      const afterWithdraw = await getBalances(sdk.client, account, [
        tokenIn,
        DEFAULT_POOL,
      ]);
      expect(afterWithdraw[DEFAULT_POOL]).toBe(0n);
    });
  });

  describe("KYC on-demand underlying (ocUSDC)", () => {
    it("should recognize ocUSDC as KYC on-demand underlying", () => {
      const meta = sdk.tokensMeta.mustGet(OC_USDC);
      expect(sdk.tokensMeta.isKYCUnderlying(meta)).toBe(true);
      expect(meta.contractType).toBe("KYC_UNDERLYING::ON_DEMAND");

      const kycMeta = meta as KYCOnDemandTokenMeta;
      expect(kycMeta.kycFactory.toLowerCase()).toBe(KYC_FACTORY.toLowerCase());
      expect(kycMeta.asset).toBeDefined();
      expect(kycMeta.liquidityProvider).toBeDefined();
      expect(kycMeta.liquidityProvider.addr).toBeDefined();
    });

    it("should return correct deposit routing for on-demand pool", () => {
      const poolService = new PoolService(sdk);
      const kycMeta = sdk.tokensMeta.mustGet(OC_USDC) as KYCOnDemandTokenMeta;

      const tokensIn = poolService.getDepositTokensIn(ON_DEMAND_POOL);
      expect(tokensIn).toEqual([kycMeta.asset]);

      const tokensOut = poolService.getDepositTokensOut(
        ON_DEMAND_POOL,
        kycMeta.asset,
      );
      expect(tokensOut).toEqual([]);

      const depositMeta = poolService.getDepositMetadata(
        ON_DEMAND_POOL,
        kycMeta.asset,
      );
      expect(depositMeta).toEqual({
        zapper: undefined,
        approveTarget: kycMeta.liquidityProvider.addr,
        permissible: false,
        type: "kyc-on-demand",
      });
    });

    it("should return undefined from addLiquidity for on-demand pool", () => {
      const poolService = new PoolService(sdk);
      const kycMeta = sdk.tokensMeta.mustGet(OC_USDC) as KYCOnDemandTokenMeta;

      const depositMeta = poolService.getDepositMetadata(
        ON_DEMAND_POOL,
        kycMeta.asset,
      );

      const call = poolService.addLiquidity({
        collateral: {
          token: kycMeta.asset,
          balance: parseUnits("100", 6),
        },
        pool: ON_DEMAND_POOL,
        wallet: "0x0000000000000000000000000000000000000001",
        meta: depositMeta,
        referralCode: 0n,
      });
      expect(call).toBeUndefined();
    });

    it("should return correct withdrawal routing for on-demand pool", () => {
      const poolService = new PoolService(sdk);
      const kycMeta = sdk.tokensMeta.mustGet(OC_USDC) as KYCOnDemandTokenMeta;

      const withdrawTokensIn =
        poolService.getWithdrawalTokensIn(ON_DEMAND_POOL);
      expect(withdrawTokensIn).toEqual([]);

      const withdrawTokensOut = poolService.getWithdrawalTokensOut(
        ON_DEMAND_POOL,
        ON_DEMAND_POOL,
      );
      expect(withdrawTokensOut).toEqual([kycMeta.asset]);

      const withdrawalMeta = poolService.getWithdrawalMetadata(
        ON_DEMAND_POOL,
        ON_DEMAND_POOL,
      );
      expect(withdrawalMeta).toEqual({
        zapper: undefined,
        approveTarget: undefined,
        permissible: false,
        type: "kyc-on-demand",
      });
    });

    it("should return approve(0) call from removeLiquidity for on-demand pool", () => {
      const poolService = new PoolService(sdk);
      const kycMeta = sdk.tokensMeta.mustGet(OC_USDC) as KYCOnDemandTokenMeta;

      const withdrawalMeta = poolService.getWithdrawalMetadata(
        ON_DEMAND_POOL,
        ON_DEMAND_POOL,
      );

      const call = poolService.removeLiquidity({
        pool: ON_DEMAND_POOL,
        amount: 0n,
        wallet: "0x0000000000000000000000000000000000000001",
        permit: undefined,
        meta: withdrawalMeta,
      });

      expect(call.target).toBe(kycMeta.asset);
      expect(call.functionName).toBe("approve");
      expect(call.args[1]).toBe(0n);
    });
  });
});
