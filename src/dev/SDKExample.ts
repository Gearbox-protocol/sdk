import { readFile, writeFile } from "node:fs/promises";

import type { Address } from "viem";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { ILogger } from "../sdk";
import { GearboxSDK, json_stringify, sendRawTx } from "../sdk";

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

  public get sdk(): GearboxSDK {
    if (!this.#sdk) {
      throw new Error("sdk is not attached");
    }
    return this.#sdk;
  }
}
