import { writeFile } from "node:fs/promises";

import { pino } from "pino";
import { type Address, createWalletClient, type Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { megaethTestnet } from "viem/chains";

import { AdaptersPlugin } from "../src/adapters/index.js";
import { AccountOpener } from "../src/dev/index.js";
import {
  CreditAccountsService,
  GearboxSDK,
  json_stringify,
  sendRawTx,
} from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const sdk = await GearboxSDK.attach({
    rpcURLs: [...megaethTestnet.rpcUrls.default.http],
    timeout: 480_000,
    // blockNumber: 22118452, // 21977000, // 22118452
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    // marketConfigurators: [],
    logger,
    // ignoreUpdateablePrices: true,
    strictContractTypes: true,
    plugins: {
      adapters: AdaptersPlugin,
      // zappers: ZappersPlugin,
      // bots: BotsPlugin,/
    },
  });
  const now = Math.floor(Date.now() / 1000);

  await writeFile(
    `tmp/state_human_${now}.json`,
    json_stringify(sdk.stateHuman()),
  );

  const cas = new CreditAccountsService(sdk);
  const opener = new AccountOpener(cas, {
    borrower: privateKeyToAccount(process.env.MEGAETH_PRIVATE_KEY! as Hex),
  });

  // const result = await opener.openCreditAccounts(
  //   [
  //     {
  //       creditManager: "0x6345cec9acEF5DbAD06F8c5341C053964BbBCd18",
  //       // creditManager: "0xf429b8d06f6Fef99f53b11e6882bC7fd0dCF068e",
  //       // target: "0xE9b6e75C243B6100ffcb1c66e8f78F96FeeA727F", // cUSD underlying
  //       target: "0x776401b9BC8aAe31A685731B7147D4445fD9FB19", // WETH
  //       slippage: 100,
  //     },
  //   ],
  //   false,
  //   false,
  // );

  const accountAddress: Address = "0xC76ffF3f2E1d034E29e59A45F299de39AB3fADF0";
  const cUSD = sdk.tokensMeta.mustFindBySymbol("cUSD").addr;
  const WETH = sdk.tokensMeta.mustFindBySymbol("WETH").addr;
  const tkWBTC = sdk.tokensMeta.mustFindBySymbol("tkWBTC").addr;

  let creditAccount = await cas.getCreditAccountData(accountAddress);

  logger.info(creditAccount, "loaded credit account data");

  const cUSDBalance = creditAccount?.tokens.find(
    t => t.token === cUSD,
  )?.balance;

  const result = await sdk.router.findOneTokenPath({
    amount: cUSDBalance! / 100n,
    creditAccount: creditAccount!,
    creditManager: sdk.marketRegister.findCreditManager(
      creditAccount!.creditManager,
    ).creditManager,
    tokenIn: cUSD,
    tokenOut: tkWBTC,
    slippage: 100,
  });

  logger.info(result, "found one token path");

  const { tx, calls, creditFacade } = await cas.executeSwap({
    averageQuota: [],
    minQuota: [],
    calls: result.calls,
    creditAccount: creditAccount!,
  });

  // logger.info(tx, "executed swap");
  // logger.info(calls, "calls");
  // logger.info(creditFacade, "credit facade");

  const hash = await sendRawTx(
    createWalletClient({
      transport: http(megaethTestnet.rpcUrls.default.http[0]),
      account: privateKeyToAccount(process.env.MEGAETH_PRIVATE_KEY! as Hex),
    }),
    { tx },
  );

  logger.info("sent tx " + hash);
  const receipt = await sdk.provider.publicClient.waitForTransactionReceipt({
    hash,
  });

  logger.info(receipt, "receipt");

  creditAccount = await cas.getCreditAccountData(accountAddress);

  logger.info(creditAccount, "loaded credit account data");

  // await writeFile(`tmp/result_${now}.json`, json_stringify(result));

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
