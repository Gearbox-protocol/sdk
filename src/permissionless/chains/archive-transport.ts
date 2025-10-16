import { Transport, http, EIP1193RequestFn, Chain } from "viem";

export interface ArchiveTransportConfig {
  primaryRpcUrl: string;
  archiveRpcUrl: string;
  blockThreshold: number; // N - blocks from latest to determine if we need archive
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  enableLogging?: boolean;
}

interface EthGetLogsFilter {
  fromBlock?: string | number;
  toBlock?: string | number;
  address?: string | string[];
  topics?: (string | null | string[])[];
}

interface LogEntry {
  blockNumber: string;
  logIndex?: string;
  [key: string]: unknown;
}

export class ArchiveTransport {
  private config: Required<ArchiveTransportConfig>;
  private primaryTransport: Transport;
  private archiveTransport: Transport;
  private cachedTransport?: Transport;

  constructor(config: ArchiveTransportConfig) {
    this.config = {
      retryCount: 3,
      retryDelay: 150,
      timeout: 10000,
      enableLogging: false,
      ...config,
    };

    // Create underlying transports
    this.primaryTransport = http(this.config.primaryRpcUrl, {
      retryCount: this.config.retryCount,
      retryDelay: this.config.retryDelay,
      timeout: this.config.timeout,
    });

    this.archiveTransport = http(this.config.archiveRpcUrl, {
      retryCount: this.config.retryCount,
      retryDelay: this.config.retryDelay,
      timeout: this.config.timeout,
    });
  }

  /**
   * Get the configured transport instance
   */
  public getTransport(): Transport {
    if (this.cachedTransport) {
      return this.cachedTransport;
    }

    const transport = ({
      chain,
      retryCount: transportRetryCount,
      timeout: transportTimeout,
    }: {
      chain?: unknown;
      pollingInterval?: number;
      retryCount?: number;
      timeout?: number;
    }) => {
      const primaryClient = this.primaryTransport({
        chain: chain as Chain,
        retryCount: transportRetryCount,
        timeout: transportTimeout,
      });
      const archiveClient = this.archiveTransport({
        chain: chain as Chain,
        retryCount: transportRetryCount,
        timeout: transportTimeout,
      });

      return {
        config: {
          key: "archive-class",
          name: "Archive Transport Class",
          request: primaryClient.config.request as EIP1193RequestFn,
          retryCount: transportRetryCount ?? this.config.retryCount,
          retryDelay: this.config.retryDelay,
          timeout: transportTimeout ?? this.config.timeout,
          type: "archive" as const,
        },
        request: async (args: { method: string; params?: unknown }) => {
          const { method, params } = args;
          // If not eth_getLogs, use primary RPC
          if (method !== "eth_getLogs") {
            return await primaryClient.request({ method, params });
          }

          try {
            return await this.handleGetLogsRequest(
              method,
              params,
              primaryClient,
              archiveClient
            );
          } catch (error) {
            this.log(
              "Archive transport error, falling back to primary RPC:",
              error
            );
            return await primaryClient.request({ method, params });
          }
        },
        value: primaryClient.value,
      };
    };

    this.cachedTransport = transport as Transport;
    return this.cachedTransport;
  }

  /**
   * Handle eth_getLogs requests with intelligent routing
   */
  private async handleGetLogsRequest(
    method: string,
    params: unknown,
    primaryClient: ReturnType<Transport>,
    archiveClient: ReturnType<Transport>
  ): Promise<ReturnType<EIP1193RequestFn>> {
    // Get latest block number from primary RPC
    const latestBlockHex = (await primaryClient.request({
      method: "eth_blockNumber",
      params: [],
    })) as string;

    const latestBlock = parseInt(latestBlockHex, 16);
    const thresholdBlock = latestBlock - this.config.blockThreshold;

    // Parse the getLogs parameters
    const logsParams = params as [EthGetLogsFilter];
    const filter = logsParams[0] || {};

    const { fromBlock, toBlock } = this.parseBlockNumbers(filter, latestBlock);

    // Determine routing strategy
    const allRecent = fromBlock >= thresholdBlock;
    const allHistorical = toBlock < thresholdBlock;
    const spansBoth = fromBlock < thresholdBlock && toBlock >= thresholdBlock;

    if (allRecent) {
      // All blocks are recent - use primary RPC only
      this.log(`Primary RPC: blocks [${fromBlock}-${toBlock}]`);
      return await primaryClient.request({
        method,
        params,
      });
    } else if (allHistorical) {
      // All blocks are historical - use archive RPC only
      this.log(`Archive RPC: blocks [${fromBlock}-${toBlock}]`);
      return await archiveClient.request({ method, params });
    } else if (spansBoth) {
      // Split request and merge results
      return await this.handleSplitRequest(
        method,
        filter,
        fromBlock,
        toBlock,
        thresholdBlock,
        primaryClient,
        archiveClient
      );
    } else {
      // Edge case - fallback to primary RPC
      return await primaryClient.request({
        method,
        params,
      });
    }
  }

  /**
   * Handle split requests that span both historical and recent blocks
   */
  private async handleSplitRequest(
    method: string,
    filter: EthGetLogsFilter,
    fromBlock: number,
    toBlock: number,
    thresholdBlock: number,
    primaryClient: ReturnType<Transport>,
    archiveClient: ReturnType<Transport>
  ): Promise<ReturnType<EIP1193RequestFn>> {
    this.log(
      `Splitting request: historical [${fromBlock}-${
        thresholdBlock - 1
      }] + recent [${thresholdBlock}-${toBlock}]`
    );

    // Create filters for each range
    const historicalFilter = {
      ...filter,
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: `0x${(thresholdBlock - 1).toString(16)}`,
    };

    const recentFilter = {
      ...filter,
      fromBlock: `0x${thresholdBlock.toString(16)}`,
      toBlock: `0x${toBlock.toString(16)}`,
    };

    try {
      // Make parallel requests
      const [historicalResult, recentResult] = await Promise.all([
        archiveClient.request({ method, params: [historicalFilter] }),
        primaryClient.request({ method, params: [recentFilter] }),
      ]);

      // Cast and merge results
      const historicalLogs = historicalResult as LogEntry[];
      const recentLogs = recentResult as LogEntry[];
      const mergedLogs = [...historicalLogs, ...recentLogs];

      // Sort chronologically
      mergedLogs.sort((a, b) => {
        const blockA = parseInt(a.blockNumber, 16);
        const blockB = parseInt(b.blockNumber, 16);
        if (blockA !== blockB) {
          return blockA - blockB;
        }
        const logIndexA = parseInt(a.logIndex || "0x0", 16);
        const logIndexB = parseInt(b.logIndex || "0x0", 16);
        return logIndexA - logIndexB;
      });

      this.log(
        `Merged ${historicalLogs.length} historical + ${recentLogs.length} recent = ${mergedLogs.length} total logs`
      );

      return mergedLogs as unknown as Awaited<
        ReturnType<typeof primaryClient.request>
      >;
    } catch (error) {
      this.log("Split request failed, falling back to archive RPC:", error);
      return await archiveClient.request({
        method,
        params: [filter],
      });
    }
  }

  /**
   * Parse block numbers from filter parameters
   */
  private parseBlockNumbers(
    filter: EthGetLogsFilter,
    latestBlock: number
  ): { fromBlock: number; toBlock: number } {
    let fromBlock: number | undefined;
    let toBlock: number | undefined;

    // Parse fromBlock
    if (filter.fromBlock !== undefined) {
      if (filter.fromBlock === "latest" || filter.fromBlock === "pending") {
        fromBlock = latestBlock;
      } else if (filter.fromBlock === "earliest") {
        fromBlock = 0;
      } else if (typeof filter.fromBlock === "string") {
        fromBlock = parseInt(filter.fromBlock, 16);
      } else {
        fromBlock = filter.fromBlock;
      }
    }

    // Parse toBlock
    if (filter.toBlock !== undefined) {
      if (filter.toBlock === "latest" || filter.toBlock === "pending") {
        toBlock = latestBlock;
      } else if (filter.toBlock === "earliest") {
        toBlock = 0;
      } else if (typeof filter.toBlock === "string") {
        toBlock = parseInt(filter.toBlock, 16);
      } else {
        toBlock = filter.toBlock;
      }
    }

    // Default values
    return {
      fromBlock: fromBlock ?? 0,
      toBlock: toBlock ?? latestBlock,
    };
  }

  /**
   * Log messages if logging is enabled
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      console.log(`[ArchiveTransport] ${message}`, ...args);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Required<ArchiveTransportConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration (will invalidate cached transport)
   */
  public updateConfig(updates: Partial<ArchiveTransportConfig>): void {
    this.config = { ...this.config, ...updates };
    this.cachedTransport = undefined; // Force recreate transport

    // Recreate underlying transports if URLs changed
    if (updates.primaryRpcUrl) {
      this.primaryTransport = http(this.config.primaryRpcUrl, {
        retryCount: this.config.retryCount,
        retryDelay: this.config.retryDelay,
        timeout: this.config.timeout,
      });
    }

    if (updates.archiveRpcUrl) {
      this.archiveTransport = http(this.config.archiveRpcUrl, {
        retryCount: this.config.retryCount,
        retryDelay: this.config.retryDelay,
        timeout: this.config.timeout,
      });
    }
  }

  /**
   * Enable or disable logging
   */
  public setLogging(enabled: boolean): void {
    this.config.enableLogging = enabled;
  }
}
