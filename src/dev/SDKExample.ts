import { readFile, writeFile } from "node:fs/promises";

import type { Address } from "viem";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { ILogger } from "../sdk";
import {
  ADDRESS_PROVIDER,
  GearboxSDK,
  iAddressProviderV3_1Abi,
  iAddressProviderV3Abi,
  json_stringify,
  sendRawTx,
} from "../sdk";
import { createAnvilClient } from "./createAnvilClient";

export interface SDKExampleOptions {
  addressProvider?: string;
  addressProviderJson?: string;
  marketConfigurator?: string;
  marketConfiguratorJson?: string;
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
      marketConfigurator: mc,
      marketConfiguratorJson,
      anvilUrl = "http://127.0.0.1:8545",
      outFile,
    } = opts;
    const addressProvider = await this.#readConfigAddress(
      "addressProvider",
      ap,
      addressProviderJson,
    );
    const marketConfigurator = await this.#readConfigAddress(
      "marketConfigurator",
      mc,
      marketConfiguratorJson,
    );

    this.#sdk = await GearboxSDK.attach({
      rpcURLs: [anvilUrl],
      timeout: 480_000,
      addressProvider,
      logger: this.#logger,
      ignoreUpdateablePrices: true,
      marketConfigurators: [marketConfigurator],
    });
    await this.#safeMigrateFaucet(addressProvider);

    const puTx = await this.#sdk.priceFeeds.getUpdatePriceFeedsTx([
      marketConfigurator,
    ]);
    const updater = createWalletClient({
      account: privateKeyToAccount(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // well-known anvil private key
      ),
      transport: http(anvilUrl),
    });
    const publicClient = createPublicClient({
      transport: http(anvilUrl),
    });
    const hash = await sendRawTx(updater, { tx: puTx });
    await publicClient.waitForTransactionReceipt({ hash });

    await this.#sdk.marketRegister.loadMarkets([marketConfigurator], true);

    this.#logger?.info("attached sdk");
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

  async #safeMigrateFaucet(addressProvider: Address): Promise<void> {
    try {
      await this.#migrateFaucet(addressProvider);
      this.#logger?.info("faucet migrated successfully");
    } catch (e) {
      this.#logger?.error(`faucet migration failed: ${e}`);
    }
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
          abi: iAddressProviderV3Abi,
          address: ADDRESS_PROVIDER[this.sdk.provider.networkType],
          functionName: "getAddressOrRevert",
          args: [stringToHex("FAUCET", { size: 32 }), 0n],
        },
        {
          abi: iAddressProviderV3_1Abi,
          address: addressProvider,
          functionName: "owner",
          args: [],
        },
      ],
      allowFailure: false,
    });
    this.#logger?.debug(`faucet address: ${faucetAddr}, owner: ${owner}`);
    await anvil.impersonateAccount({ address: owner });
    const hash = await anvil.writeContract({
      chain: anvil.chain,
      account: owner,
      address: addressProvider,
      abi: iAddressProviderV3_1Abi,
      functionName: "setAddress",
      args: [stringToHex("FAUCET", { size: 32 }), faucetAddr, true],
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
