import {
  type Address,
  createTestClient,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  http,
  type PublicClient,
  parseUnits,
} from "viem";
import { dealActions } from "viem-deal";
import { beforeAll, describe, expect, it } from "vitest";
import {
  GearboxSDK,
  type KYCDefaultTokenMeta,
  type KYCOnDemandTokenMeta,
  MAX_UINT256,
  PoolService,
  type PoolServiceCall,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { getAnvilWallet, useFixture } from "../helpers.js";

const BLOCK = 24851014n;

const MARKET_CONFIGURATOR: Address =
  "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad";
const KYC_FACTORY: Address = "0x9bccaf938f7de8cfee02ed5e177f3df873087f5c";

// KYC Default pool: PoolV3(Mock Diesel Default compliant USD Coin)
const DEFAULT_POOL: Address = "0xEe5f4B806e3262D32D19eC5caB1A81Aad76Cf291";
const DC_USDC: Address = "0xb2978E8490233382F5790d784e9E8Ab1F0E57fdd";

// KYC On-Demand pool: PoolV3(Mock Diesel On-demand compliant USD Coin)
const ON_DEMAND_POOL: Address = "0x011191d77D7793e5A9C06012532Eb9d0efCEbF4E";
const OC_USDC: Address = "0x3699090D2eA625821d5A006Ae8F58226B67A13e1";

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

describe.skip("KYC pool deposit and withdraw", () => {
  let sdk: GearboxSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = await GearboxSDK.attach({
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
      blockNumber: BLOCK,
      marketConfigurators: [MARKET_CONFIGURATOR],
      kycFactories: [KYC_FACTORY],
      ignoreUpdateablePrices: true,
    });
    await sdk.tokensMeta.loadTokenData();
    await sdk.marketRegister.loadZappers();
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
      const wallet = getAnvilWallet(sdk);
      const account = wallet.account.address;
      const poolService = new PoolService(sdk);

      const tokensIn = poolService.getDepositTokensIn(DEFAULT_POOL);
      expect(tokensIn.length).toBeGreaterThan(0);

      const firstTokenIn = tokensIn[0];
      const tokensOut = poolService.getDepositTokensOut(
        DEFAULT_POOL,
        firstTokenIn,
      );
      expect(tokensOut.length).toBeGreaterThan(0);

      const depositMeta = poolService.getDepositMetadata(
        DEFAULT_POOL,
        firstTokenIn,
        tokensOut[0],
      );
      expect(depositMeta.type).toBe("kyc-default");

      const anvil = createTestClient({
        mode: "anvil",
        transport: http(ANVIL_URL),
        chain: sdk.chain,
        pollingInterval: 100,
      }).extend(dealActions);

      const depositAmount = parseUnits("100", 6);
      await anvil.deal({
        erc20: firstTokenIn,
        account,
        amount: 2n * depositAmount,
      });

      let hash = await wallet.writeContract({
        address: firstTokenIn,
        abi: erc20Abi,
        functionName: "approve",
        args: [depositMeta.approveTarget, MAX_UINT256],
      });
      await sdk.client.waitForTransactionReceipt({
        hash,
        pollingInterval: 100,
      });

      const beforeDeposit = await getBalances(sdk.client, account, [
        firstTokenIn,
        DEFAULT_POOL,
      ]);

      const depositCall = poolService.addLiquidity({
        collateral: { token: firstTokenIn, balance: depositAmount },
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
        firstTokenIn,
        DEFAULT_POOL,
      ]);
      expect(afterDeposit[firstTokenIn]).toBeLessThan(
        beforeDeposit[firstTokenIn],
      );
      expect(afterDeposit[DEFAULT_POOL]).toBeGreaterThan(0n);

      const sharesReceived = afterDeposit[DEFAULT_POOL];

      // --- Withdrawal ---
      const withdrawTokensIn = poolService.getWithdrawalTokensIn(DEFAULT_POOL);
      expect(withdrawTokensIn.length).toBeGreaterThan(0);

      const withdrawTokenIn = withdrawTokensIn[0];
      const withdrawTokensOut = poolService.getWithdrawalTokensOut(
        DEFAULT_POOL,
        withdrawTokenIn,
      );
      expect(withdrawTokensOut.length).toBeGreaterThan(0);

      const withdrawalMeta = poolService.getWithdrawalMetadata(
        DEFAULT_POOL,
        withdrawTokenIn,
        withdrawTokensOut[0],
      );
      expect(withdrawalMeta.type).toBe("kyc-default");

      if (withdrawalMeta.approveTarget) {
        hash = await wallet.writeContract({
          address: withdrawTokenIn,
          abi: erc20Abi,
          functionName: "approve",
          args: [withdrawalMeta.approveTarget, MAX_UINT256],
        });
        await sdk.client.waitForTransactionReceipt({
          hash,
          pollingInterval: 100,
        });
      }

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
        firstTokenIn,
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
