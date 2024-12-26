import type { Address, PrivateKeyAccount } from "viem";
import { isAddress, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import type {
  Asset,
  CreditAccountData,
  CreditAccountsService,
  CreditFactory,
  GearboxSDK,
  ILogger,
} from "../sdk";
import {
  ADDRESS_0X0,
  childLogger,
  formatBN,
  iDegenNftv2Abi,
  ierc20Abi,
  MAX_UINT256,
  sendRawTx,
} from "../sdk";
import { type AnvilClient, createAnvilClient } from "./createAnvilClient";

export interface AccountOpenerOptions {
  faucet?: Address;
}

export interface TargetAccount {
  creditManager: Address;
  collateral: Address;
  leverage?: number;
  slippage?: number;
}

export class AccountOpener {
  #service: CreditAccountsService;
  #anvil: AnvilClient;
  #logger?: ILogger;
  #borrower?: PrivateKeyAccount;
  #faucet: Address;

  constructor(
    service: CreditAccountsService,
    options: AccountOpenerOptions = {},
  ) {
    this.#service = service;
    this.#logger = childLogger("AccountOpener", service.sdk.logger);
    this.#anvil = createAnvilClient({
      chain: service.sdk.provider.chain,
      transport: service.sdk.provider.transport,
    });
    this.#faucet =
      options.faucet ?? service.sdk.addressProvider.getAddress("FAUCET");
  }

  public get borrower(): Address {
    if (!this.#borrower) {
      throw new Error("borrower can be used only after openCreditAccounts");
    }
    return this.#borrower.address;
  }

  /**
   * Tries to open account with underlying only in each CM
   */
  public async openCreditAccounts(targets: TargetAccount[]): Promise<void> {
    const borrower = await this.#prepareBorrower(targets);
    for (const target of targets) {
      try {
        await this.#openAccount(target);
      } catch (e) {
        this.#logger?.error(e);
      }
    }
    const accounts = await this.#service.getCreditAccounts({
      owner: borrower.address,
    });
    this.#logger?.info(`opened ${accounts.length} accounts`);
  }

  async #openAccount({
    creditManager,
    collateral,
    leverage = 4,
    slippage = 50,
  }: TargetAccount): Promise<CreditAccountData[]> {
    const borrower = await this.#getBorrower();
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const symbol = this.sdk.tokensMeta.symbol(collateral);
    const logger = this.#logger?.child?.({
      creditManager: cm.name,
      collateral: symbol,
    });
    const { minDebt, underlying } = cm.creditFacade;

    const expectedBalances: Asset[] = [];
    const leftoverBalances: Asset[] = [];
    for (const t of Object.keys(cm.collateralTokens)) {
      const token = t as Address;
      expectedBalances.push({
        token,
        balance: token === underlying ? BigInt(leverage) * minDebt : 1n,
      });
      leftoverBalances.push({
        token,
        balance: 1n,
      });
    }
    logger?.debug("looking for open strategy");
    const strategy = await this.sdk.router.findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances,
      leftoverBalances,
      slippage,
      target: collateral,
    });
    logger?.debug("found open strategy");
    const { tx, calls } = await this.#service.openCA({
      creditManager: cm.creditManager.address,
      averageQuota: [],
      minQuota: [],
      collateral: [{ token: underlying, balance: minDebt }],
      debt: minDebt * BigInt(leverage - 1),
      calls: strategy.calls,
      ethAmount: 0n,
      permits: {},
      to: borrower.address,
      referralCode: 0n,
    });
    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      logger?.debug(
        `call #${i + 1}: ${this.sdk.parseFunctionData(call.target, call.callData)}`,
      );
    }
    logger?.debug("prepared open account transaction");
    const hash = await sendRawTx(this.#anvil, {
      tx,
      account: borrower,
    });
    logger?.debug(`send transaction ${hash}`);
    const receipt = await this.#anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(`open credit account tx ${hash} reverted`);
    }
    logger?.debug(
      `opened credit account in ${cm.name} with collateral ${symbol}`,
    );
    return this.getOpenedAccounts();
  }

  public async getOpenedAccounts(): Promise<CreditAccountData[]> {
    return await this.#service.getCreditAccounts({
      owner: this.borrower,
    });
  }

  /**
   * Creates borrower wallet,
   * Sets ETH balance,
   * Gets tokens from faucet,
   * Approves collateral tokens to credit manager,
   * Gets DEGEN_NFT,
   */
  async #prepareBorrower(targets: TargetAccount[]): Promise<PrivateKeyAccount> {
    const borrower = await this.#getBorrower();

    // each account will have minDebt in USD, see how much we need to claim from faucet
    let claimUSD = 0n;
    // collect all degen nfts
    let degenNFTS: Record<Address, number> = {};
    for (const target of targets) {
      const cm = this.sdk.marketRegister.findCreditManager(
        target.creditManager,
      );
      const market = this.sdk.marketRegister.findByCreditManager(
        target.creditManager,
      );
      const { minDebt, degenNFT } = cm.creditFacade;

      claimUSD += market.priceOracle.convertToUSD(cm.underlying, minDebt);

      if (isAddress(degenNFT) && degenNFT !== ADDRESS_0X0) {
        degenNFTS[degenNFT] = (degenNFTS[degenNFT] ?? 0) + 1;
      }

      for (const t of Object.keys(cm.collateralTokens)) {
        await this.#approve(t as Address, cm);
      }
    }
    claimUSD = (claimUSD * 11n) / 10n; // 10% more to be safe

    this.#logger?.debug(`claiming ${formatBN(claimUSD, 8)} USD from faucet`);
    let hash = await this.#anvil.writeContract({
      account: borrower,
      address: this.#faucet,
      abi: [
        {
          type: "function",
          inputs: [
            { name: "amountUSD", internalType: "uint256", type: "uint256" },
          ],
          name: "claim",
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "claim",
      args: [claimUSD],
      chain: this.#anvil.chain,
    });
    let receipt = await this.#anvil.waitForTransactionReceipt({
      hash,
    });
    if (receipt.status === "reverted") {
      throw new Error(
        `borrower ${borrower.address} failed to claimed equivalent of ${formatBN(claimUSD, 8)} USD from faucet, tx: ${hash}`,
      );
    }
    this.#logger?.debug(
      `borrower ${borrower.address} claimed equivalent of ${formatBN(claimUSD, 8)} USD from faucet, tx: ${hash}`,
    );

    for (const [degenNFT, amount] of Object.entries(degenNFTS)) {
      await this.#mintDegenNft(degenNFT as Address, borrower.address, amount);
    }
    this.#logger?.debug("prepared borrower");
    return borrower;
  }

  async #approve(token: Address, cm: CreditFactory): Promise<void> {
    const borrower = await this.#getBorrower();
    try {
      const hash = await this.#anvil.writeContract({
        account: borrower,
        address: token,
        abi: ierc20Abi,
        functionName: "approve",
        args: [cm.creditManager.address, MAX_UINT256],
        chain: this.#anvil.chain,
      });
      const receipt = await this.#anvil.waitForTransactionReceipt({
        hash,
      });

      if (receipt.status === "reverted") {
        this.#logger?.error(
          `failed to allowed credit manager ${cm.creditManager.name} to spend ${token}, tx reverted: ${hash}`,
        );
      } else {
        this.#logger?.debug(
          `allowed credit manager ${cm.creditManager.name} to spend ${token}, tx: ${hash}`,
        );
      }
    } catch (e) {
      this.#logger?.error(
        `failed to allowed credit manager ${cm.creditManager.name} to spend ${token}: ${e}`,
      );
    }
  }

  async #mintDegenNft(
    degenNFT: Address,
    to: Address,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      return;
    }
    let minter: Address | undefined;
    try {
      minter = await this.#anvil.readContract({
        address: degenNFT,
        abi: iDegenNftv2Abi,
        functionName: "minter",
      });
    } catch (e) {
      this.#logger?.error(`failed to get minter of degenNFT ${degenNFT}: ${e}`);
      return;
    }

    try {
      await this.#anvil.impersonateAccount({ address: minter });
      await this.#anvil.setBalance({
        address: minter,
        value: parseEther("100"),
      });
      const hash = await this.#anvil.writeContract({
        account: minter,
        address: degenNFT,
        abi: iDegenNftv2Abi,
        functionName: "mint",
        args: [to, BigInt(amount)],
        chain: this.#anvil.chain,
      });
      const receipt = await this.#anvil.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status === "reverted") {
        this.#logger?.error(
          `failed to mint ${amount} degenNFT ${degenNFT} to borrower ${to}, tx reverted: ${hash}`,
        );
      }
      this.#logger?.debug(
        `minted ${amount} degenNFT ${degenNFT} to borrower ${to}, tx: ${hash}`,
      );
    } catch (e) {
      this.#logger?.error(
        `failed to mint ${amount} degenNFT ${degenNFT} to borrower ${to}: ${e}`,
      );
    } finally {
      await this.#anvil.stopImpersonatingAccount({ address: minter });
    }
  }

  async #getBorrower(): Promise<PrivateKeyAccount> {
    if (!this.#borrower) {
      this.#borrower = privateKeyToAccount(generatePrivateKey());
      await this.#anvil.setBalance({
        address: this.#borrower.address,
        value: parseEther("100"),
      });
      this.#logger?.info(`created borrower ${this.#borrower.address}`);
    }
    return this.#borrower;
  }

  private get sdk(): GearboxSDK {
    return this.#service.sdk;
  }
}
