import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { AbstractMigrateCreditAccountsService } from "./AbstractMigrateCreditAccountsService.js";
import { MigrateCreditAccountsServiceV300 } from "./MigrateCreditAccountsServiceV300.js";
import { MigrateCreditAccountsServiceV310 } from "./MigrateCreditAccountsServiceV310.js";

/**
 * @sdk
 * @version version of desired credit facade; if no credit facade is considered (you only want to get ca list), either v300 or v310 is fine, because ca compressor has nothing to do with credit facade version
 * @returns
 */
export function createMigrateCreditAccountsService(
  sdk: GearboxSDK,
  version: number,
): AbstractMigrateCreditAccountsService {
  if (isV300(version)) {
    return new MigrateCreditAccountsServiceV300(sdk, version);
  }
  if (isV310(version)) {
    return new MigrateCreditAccountsServiceV310(sdk, version);
  }
  throw new Error(
    `Unsupported Migrate Credit Account Service version ${version}`,
  );
}
