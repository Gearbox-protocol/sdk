import type { Address, ContractEventName, Log } from "viem";

import { priceOracleV3Abi } from "../abi";
import type { PriceOracleData } from "../base";
import type { NetworkType } from "../chain";
import type { GearboxSDK } from "../GearboxSDK";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract";

type abi = typeof priceOracleV3Abi;

export class PriceOracleV300Contract extends PriceOracleBaseContract<abi> {
  constructor(sdk: GearboxSDK, data: PriceOracleData, underlying: Address) {
    super(
      sdk,
      {
        ...data.baseParams,
        name: "PriceOracleV3",
        abi: priceOracleV3Abi,
      },
      data,
      underlying,
    );
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "Paused":
      case "Unpaused":
        break;
      case "NewController":
      case "SetPriceFeed":
      case "SetReservePriceFeed":
      case "SetReservePriceFeedStatus":
        this.dirty = true;
        break;
    }
  }

  protected override findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address | undefined, reserve: boolean] {
    const [token, reserve] = super.findTokenForPriceFeed(priceFeed);
    if (token) {
      return [token, reserve];
    }
    const ticker = priceFeedToTicker[this.sdk.provider.networkType][priceFeed];
    if (ticker) {
      return [ticker, false];
    }
    return [undefined, false];
  }
}

/**
 * Mapping for ticker price feeds PriceFeed -> TickerToken
 * This is v3.0 stuff, in v3.1 tickers are not added into price oracles
 */
const priceFeedToTicker: Record<NetworkType, Record<Address, Address>> = {
  Mainnet: {
    "0x6F13996411743d22566176482B6b677Ec4eb6cE6":
      "0x8C23b9E4CB9884e807294c4b4C33820333cC613c",
    "0xa7cB34Cd731486F61cfDb7ff5F6fC7B40537eD76":
      "0xFb56Fb16B4F33A875b01881Da7458E09D286208e",
    "0xcf1FDc8DC6e83B38729d58C117BE704bb2AC362a":
      "0xf08D818be34C82cB5e3f33AC78F8268828764F17",
    "0xE683362b8ebcbfd9332CBB79BfAF9fC42073C49b":
      "0xBdb778F566b6cEd70D3d329DD1D14E221fFe1ba5",
    "0xB72A69e2182bE87bda706B7Ff9A539AC78338C61":
      "0x7fF63E75F48aad6F4bE97E75C6421f348f19fE7F",
    "0xd7396fA3aFB9833293Ce2149EEb3Dbf5380B1e0D":
      "0xB0EA0EC3Fd4947348816f76768b3a56249d47EEc",
  },
  Arbitrum: {
    "0xcB44ADd611f75F03191f8f1A2e2AF7a0113eadd1":
      "0x07299E4E806e4253727084c0493fFDf6fB2dBa3D",
    "0x354A63F07A5c1605920794aFFF09963b6DF897a9":
      "0x15094B05e679c9B7fDde6FB8e6BDa930ff1D6a62",
  },
  Optimism: {
    "0xF23C91b1E3B7FD9174c82F7Fb2BD270C3CfcC3CE":
      "0x658f8e60c57ad62a9299ef6c7b1da9a0d1d1e681",
  },
  Base: {},
};

/**
 * Mapping for v3 conversion token -> ticker
 */
// TODO: unused
export const tokenToTicker: Record<NetworkType, Record<Address, Address>> = {
  Mainnet: {
    "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee":
      "0x8C23b9E4CB9884e807294c4b4C33820333cC613c",
    "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110":
      "0xFb56Fb16B4F33A875b01881Da7458E09D286208e",
    "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7":
      "0xf08D818be34C82cB5e3f33AC78F8268828764F17",
    "0xD9A442856C234a39a81a089C06451EBAa4306a72":
      "0xBdb778F566b6cEd70D3d329DD1D14E221fFe1ba5",
    "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0":
      "0x7fF63E75F48aad6F4bE97E75C6421f348f19fE7F",
    "0x8236a87084f8B84306f72007F36F2618A5634494":
      "0xB0EA0EC3Fd4947348816f76768b3a56249d47EEc",
  },
  Arbitrum: {
    "0x2416092f143378750bb29b79eD961ab195CcEea5":
      "0x07299E4E806e4253727084c0493fFDf6fB2dBa3D",
    "0x4186BFC76E2E237523CBC30FD220FE055156b41F":
      "0x15094B05e679c9B7fDde6FB8e6BDa930ff1D6a62",
  },
  Optimism: {
    "0x2416092f143378750bb29b79eD961ab195CcEea5":
      "0x658f8e60c57ad62a9299ef6c7b1da9a0d1d1e681",
  },
  Base: {},
};
