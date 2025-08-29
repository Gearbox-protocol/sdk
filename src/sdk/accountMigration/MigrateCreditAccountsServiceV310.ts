import { AbstractMigrateCreditAccountsService } from "./AbstractMigrateCreditAccountsService.js";
import type { IMigrateCreditAccountsService } from "./types.js";

export class MigrateCreditAccountsServiceV310
  extends AbstractMigrateCreditAccountsService
  implements IMigrateCreditAccountsService {}
