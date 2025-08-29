import { AbstractMigrateCreditAccountsService } from "./AbstractMigrateCreditAccountsService";
import type { IMigrateCreditAccountsService } from "./types.js";

export class MigrateCreditAccountsServiceV300
  extends AbstractMigrateCreditAccountsService
  implements IMigrateCreditAccountsService {}
