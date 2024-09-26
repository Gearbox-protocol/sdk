import type { ILogObj } from "tslog";
import { Logger } from "tslog";

class CustomLogger<LogObj> extends Logger<LogObj> {
  constructor(logObj?: LogObj) {
    super(logObj || {});
  }

  public bold(...args: (string | number)[]) {
    super.info(`\x1b[1m${args.join(" ")}\x1b[0m`);
  }
}

export const DefaultLogger = new Logger({
  hideLogPositionForProduction: true,
  type: "pretty",
  prettyLogTemplate: "{{hh}}:{{MM}}:{{ss}} {{logLevelName}}\t",
});

export abstract class Logged {
  readonly logger: CustomLogger<ILogObj>;

  protected constructor() {
    this.logger = new CustomLogger<ILogObj>({
      hideLogPositionForProduction: true,
      type: "pretty",
      prettyLogTemplate: "{{hh}}:{{MM}}:{{ss}} {{logLevelName}}\t",
    });
    this.logger.settings.minLevel = process.env.TEST ? 6 : 0;
  }

  public enableLogs() {
    if (process.env.TEST) {
      return;
    }
    this.logger.settings.minLevel = 0;
  }

  public disableLogs() {
    this.logger.settings.minLevel = 6;
  }
}
