import { Logger } from "tslog";
export declare abstract class LoggedDeployer {
    protected readonly _logger: Logger;
    protected constructor();
    enableLogs(): void;
    disableLogs(): void;
}
