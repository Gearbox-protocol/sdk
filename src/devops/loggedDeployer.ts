import { Logger } from "tslog";

export abstract class LoggedDeployer {
  protected readonly _logger: Logger;

  protected constructor() {
    this._logger = new Logger({
      minLevel: "error",
      displayFunctionName: false,
      displayLoggerName: false,
      displayFilePath: "hidden",
    });
  }

  enableLogs() {
    this._logger.setSettings({ minLevel: "debug" });
  }

  disableLogs() {
    this._logger.setSettings({ minLevel: "error" });
  }
}
