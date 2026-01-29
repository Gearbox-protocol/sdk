import type { BaseContract, PriceOracleData } from "../../base/index.js";
import { isV300, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";
import { PriceOracleV300Contract } from "./PriceOracleV300Contract.js";
import { PriceOracleV310Contract } from "./PriceOracleV310Contract.js";
import type { IPriceOracleContract } from "./types.js";

/**
 * Used get or create oracle contract instances
 * In 3.0 we can have same oracle for different pools
 * But also due to how compressor works for v3.0, each maketData.priceOracle data will have different tokens (for the same oracle)
 *
 * So this method bridges multiple compressor data pieces and single oracle contract isntance
 *
 * @deprecated This will be removed when v300 is deprecated
 *
 * @param sdk
 * @param data
 * @param underlying
 * @returns
 */
export function getOrCreatePriceOracle(
  sdk: GearboxSDK,
  data: PriceOracleData,
): IPriceOracleContract {
  const { version, addr } = data.baseParams;

  let result: IPriceOracleContract;
  let action = "created";
  if (isV300(version)) {
    const existing = sdk.getContract(addr);
    if (existing) {
      result = tryExtendExistingOracle(existing, data);
      action = "extended";
    } else {
      result = new PriceOracleV300Contract(sdk, data);
    }
  } else if (isV310(version)) {
    result = new PriceOracleV310Contract(sdk, data);
  } else {
    throw new Error(`Unsupported oracle version ${version}`);
  }
  sdk.logger?.debug(
    `oracle ${addr} v${version} was ${action} with ${result.mainPriceFeeds.size} main and ${result.reservePriceFeeds.size} reserve price feeds`,
  );
  return result;
}

function tryExtendExistingOracle(
  existing: BaseContract<unknown[]>,
  data: PriceOracleData,
): IPriceOracleContract {
  const { version, addr } = data.baseParams;
  if (!(existing instanceof PriceOracleBaseContract)) {
    throw new Error(
      `expected oracle contract at ${addr}, found existing ${existing.contractType}`,
    );
  }
  if (Number(existing.version) !== Number(version)) {
    throw new Error(
      `expected oracle contract at ${addr} to have version ${version}, found ${existing.version}`,
    );
  }
  return existing.merge(data);
}
