import { readFile, writeFile } from "node:fs/promises";

import type { Address } from "viem";
import { formatEther, isAddress, parseEther, stringToHex } from "viem";

import { iAddressProviderV300Abi } from "../abi/v300.js";
import { iAddressProviderV310Abi } from "../abi/v310.js";
import type { ILogger } from "../sdk/index.js";
import { ADDRESS_PROVIDER, GearboxSDK, json_stringify } from "../sdk/index.js";
import { createAnvilClient } from "./createAnvilClient.js";

export interface SDKExampleOptions {
  addressProvider?: string;
  addressProviderJson?: string;
  marketConfigurators: Address[];
  anvilUrl?: string;
  outFile?: string;
}

export class SDKExample {
  #sdk?: GearboxSDK;
  #logger?: ILogger;

  constructor(logger?: ILogger) {
    this.#logger = logger;
  }

  public async run(opts: SDKExampleOptions) {
    const {
      addressProvider: ap,
      addressProviderJson,
      marketConfigurators,
      anvilUrl = "http://127.0.0.1:8545",
      outFile,
    } = opts;
    const addressProvider = await this.#readConfigAddress(
      "addressProvider",
      ap,
      addressProviderJson,
    );

    this.#sdk = await GearboxSDK.attach({
      rpcURLs: [anvilUrl],
      timeout: 480_000,
      addressProvider,
      logger: this.#logger,
      ignoreUpdateablePrices: false,
      marketConfigurators,
      strictContractTypes: true,
    });
    this.#logger?.info("attached sdk");
    try {
      await this.#sdk.marketRegister.loadZappers();
    } catch (e) {
      this.#logger?.error(`failed to load zappers: ${e}`);
    }

    await Promise.allSettled(
      this.#sdk.marketRegister.marketConfigurators.map(m =>
        m.loadCuratorName(),
      ),
    );
    this.#logger?.info("loaded curator names");

    if (outFile) {
      try {
        await writeFile(
          outFile,
          json_stringify(this.#sdk.stateHuman()),
          "utf-8",
        );
      } catch (e) {
        this.#logger?.error(`failed to write to ${outFile}: ${e}`);
      }
    }
  }

  public async migrateFaucet(addressProvider: Address): Promise<void> {
    try {
      await this.#migrateFaucet(addressProvider);
      this.#logger?.info("faucet migrated successfully");
    } catch (e) {
      this.#logger?.error(`faucet migration failed: ${e}`);
    }
  }

  async #readConfigAddress(
    name: string,
    value?: string,
    file?: string,
  ): Promise<Address> {
    let result = value;

    if (!result) {
      if (!file) {
        throw new Error(`${name} is not specified`);
      }

      this.#logger?.debug(`reading ${name} json ${file}`);
      const apFile = await readFile(file, "utf-8").then(JSON.parse);
      result = apFile[name];
    }
    if (!result) {
      throw new Error(`${name} is not specified`);
    }
    if (!isAddress(result)) {
      throw new Error(`${name} is not a valid address: ${result}`);
    }

    this.#logger?.info(`using ${name} ${result}`);
    return result;
  }

  /**
   * Migrates faucet from address provider v3 to v3.1
   * @param addressProvider 3.1 address provider
   */
  async #migrateFaucet(addressProvider: Address): Promise<void> {
    const anvil = createAnvilClient({
      chain: this.sdk.provider.chain,
      transport: this.sdk.provider.transport,
    });

    const [faucetAddr, owner] = await anvil.multicall({
      contracts: [
        {
          abi: iAddressProviderV300Abi,
          address: ADDRESS_PROVIDER[this.sdk.provider.networkType],
          functionName: "getAddressOrRevert",
          args: [stringToHex("FAUCET", { size: 32 }), 0n],
        },
        {
          abi: iAddressProviderV310Abi,
          address: addressProvider,
          functionName: "owner",
          args: [],
        },
      ],
      allowFailure: false,
    });
    this.#logger?.debug(`faucet address: ${faucetAddr}, owner: ${owner}`);
    await anvil.impersonateAccount({ address: owner });
    await anvil.setBalance({
      address: owner,
      value: parseEther("1000"),
    });
    const balance = await anvil.getBalance({ address: owner });
    this.#logger?.debug(`owner balance: ${formatEther(balance)} ETH`);
    const { request } = await anvil.simulateContract({
      chain: anvil.chain,
      account: owner,
      address: addressProvider,
      abi: iAddressProviderV310Abi,
      functionName: "setAddress",
      args: [stringToHex("FAUCET", { size: 32 }), faucetAddr, false],
    });
    this.#logger?.debug("estimated setAddress call");
    const hash = await anvil.writeContract({
      chain: anvil.chain,
      account: owner,
      address: addressProvider,
      abi: iAddressProviderV310Abi,
      functionName: "setAddress",
      args: [stringToHex("FAUCET", { size: 32 }), faucetAddr, false],
      gas: request.gas ? (request.gas * 11n) / 10n : undefined,
    });
    const receipt = await anvil.waitForTransactionReceipt({ hash });
    await anvil.stopImpersonatingAccount({ address: owner });
    if (receipt.status === "reverted") {
      throw new Error("faucet migration reverted");
    }
  }

  public get sdk(): GearboxSDK {
    if (!this.#sdk) {
      throw new Error("sdk is not attached");
    }
    return this.#sdk;
  }
}
