/**
 * Gearbox risk framework (https://risk.gearbox.foundation) event
 */
export interface RiskEvent<
  MonitorCode extends string = string,
  EventCode extends string = string,
  Params = undefined,
> {
  /**
   * UUID of risk event
   */
  id: string;
  /**
   * In case of persisting risk event (e.g. service is down for a period of time)
   * this is the id of the first event in series
   */
  first_occured?: string;
  /**
   * https://risk.gearbox.foundation/monitoring
   */
  monitor_code: MonitorCode;
  /**
   * Key to distinguish multiple running instances of same service
   */
  instance: string;
  /**
   * https://risk.gearbox.foundation/risks
   */
  event_code: EventCode;
  /**
   * Short event description for humans
   */
  message: string;
  /**
   * Not impemented
   */
  require_resonse?: boolean;
  chain?: number;
  block_number?: number;
  tx_hash?: string;
  /**
   * Arbitrary data
   */
  params?: Params;
}
