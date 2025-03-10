import { type Address, parseAbi } from "viem";

import { SDKConstruct } from "../base";
import type { BotBaseType, BotDataPayload, BotDetailedType } from "./utils";

export type BotAddresses = Partial<Record<BotDetailedType, Address>>;

const iPartialLiquidationBotV3Abi = parseAbi([
  "function minHealthFactor() external view returns (uint16)",
  "function maxHealthFactor() external view returns (uint16)",
  "function premiumScaleFactor() external view returns (uint16)",
  "function feeScaleFactor() external view returns (uint16)",
]);

export class BotsService extends SDKConstruct {
  /**
   * Returns bots data payload
   * @param addresses
   * @returns
   */
  public async getBotsData(addresses: BotAddresses) {
    const addressesList = Object.entries(addresses) as Array<
      [BotDetailedType, Address]
    >;

    const BOT_INFO_LENGTH = 4;
    const infoResp = (await this.provider.publicClient.multicall({
      allowFailure: false,
      contracts: addressesList
        .map(([, address]) => [
          {
            address,
            abi: iPartialLiquidationBotV3Abi,
            functionName: "minHealthFactor",
            args: [],
          },
          {
            address,
            abi: iPartialLiquidationBotV3Abi,
            functionName: "maxHealthFactor",
            args: [],
          },
          {
            address,
            abi: iPartialLiquidationBotV3Abi,
            functionName: "premiumScaleFactor",
            args: [],
          },
          {
            address,
            abi: iPartialLiquidationBotV3Abi,
            functionName: "feeScaleFactor",
            args: [],
          },
        ])
        .flat(1),
    })) as Array<number>;

    const currentType: BotBaseType = "liquidationProtection";
    const bots = addressesList.reduce<
      Record<BotBaseType, Array<BotDataPayload>>
    >(
      (acc, [type, address], index) => {
        const from = index * BOT_INFO_LENGTH;
        const to = (index + 1) * BOT_INFO_LENGTH;

        const [
          minHealthFactor,
          maxHealthFactor,
          premiumScaleFactor,
          feeScaleFactor,
        ] = infoResp.slice(from, to);

        acc[currentType].push({
          address,
          baseType: currentType,
          detailedType: type,

          minHealthFactor,
          maxHealthFactor,
          premiumScaleFactor,
          feeScaleFactor,
        });

        return acc;
      },
      { liquidationProtection: [] },
    );

    return bots;
  }
}
