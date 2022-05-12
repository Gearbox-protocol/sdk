"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedDeployer = void 0;
var tslog_1 = require("tslog");
var LoggedDeployer = /** @class */ (function () {
    function LoggedDeployer() {
        this._logger = new tslog_1.Logger({
            minLevel: "error",
            displayFunctionName: false,
            displayLoggerName: false,
            displayFilePath: "hidden",
        });
    }
    LoggedDeployer.prototype.enableLogs = function () {
        this._logger.setSettings({ minLevel: "debug" });
    };
    LoggedDeployer.prototype.disableLogs = function () {
        this._logger.setSettings({ minLevel: "error" });
    };
    return LoggedDeployer;
}());
exports.LoggedDeployer = LoggedDeployer;
