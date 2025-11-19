import {
  custom,
  hexToNumber,
  numberToHex,
  type RpcLog,
  type Transport,
} from "viem";

interface ChunkedLogsTransportConfig {
  transport: Transport;
  chunkSize: number;
  startBlock?: number;
  enableLogging?: boolean;
}

interface GetLogsParams {
  address?: string | string[];
  topics?: (string | string[] | null)[];
  fromBlock?: string | number;
  toBlock?: string | number;
  blockHash?: string;
}

/**
 * Creates a custom viem transport that chunks getLogs requests by block range
 * and makes batch RPC requests for better performance with large block ranges.
 *
 * @param config Configuration object
 * @param config.transport Base transport to wrap
 * @param config.chunkSize Number of blocks per chunk
 * @param config.startBlock Optional minimum block - logs before this block are filtered out
 * @param config.enableLogging Enable debug logging
 * @returns Viem Transport
 *
 * @example
 * const transport = chunkedLogsTransport({
 *   transport: http('https://eth.llamarpc.com'),
 *   chunkSize: 2000,
 *   startBlock: 18000000,
 *   enableLogging: true,
 * });
 *
 * const client = createPublicClient({ transport });
 */
export function chunkedLogsTransport({
  transport,
  chunkSize,
  startBlock,
  enableLogging = false,
}: ChunkedLogsTransportConfig): Transport {
  return opts => {
    const baseTransport = transport(opts);

    return custom({
      async request({ method, params }) {
        // Intercept eth_getLogs calls
        if (method === "eth_getLogs") {
          const [logsParams] = params as [GetLogsParams];

          // If blockHash is specified, no chunking needed
          if (logsParams.blockHash) {
            return baseTransport.request({ method, params });
          }

          const fromBlock =
            logsParams.fromBlock !== undefined
              ? typeof logsParams.fromBlock === "string"
                ? hexToNumber(logsParams.fromBlock as `0x${string}`)
                : logsParams.fromBlock
              : undefined;

          const toBlock =
            logsParams.toBlock !== undefined
              ? typeof logsParams.toBlock === "string"
                ? hexToNumber(logsParams.toBlock as `0x${string}`)
                : logsParams.toBlock
              : undefined;

          // If startBlock is set and toBlock is before it, return empty array
          if (
            startBlock !== undefined &&
            toBlock !== undefined &&
            toBlock < startBlock
          ) {
            if (enableLogging) {
              console.log(
                `[ChunkedLogsTransport] Request range (${fromBlock} -> ${toBlock}) is before startBlock (${startBlock}), returning empty array`,
              );
            }
            return [];
          }

          // Adjust fromBlock if it's before startBlock
          const adjustedFromBlock =
            startBlock !== undefined &&
            fromBlock !== undefined &&
            fromBlock < startBlock
              ? startBlock
              : fromBlock;

          if (enableLogging && adjustedFromBlock !== fromBlock) {
            console.log(
              `[ChunkedLogsTransport] Adjusted fromBlock from ${fromBlock} to ${adjustedFromBlock} (startBlock: ${startBlock})`,
            );
          }

          // If no block range specified or range is small, use base transport
          if (
            adjustedFromBlock === undefined ||
            toBlock === undefined ||
            toBlock - adjustedFromBlock <= chunkSize
          ) {
            // Use adjusted fromBlock in params
            const adjustedParams = [
              {
                ...logsParams,
                fromBlock:
                  adjustedFromBlock !== undefined
                    ? numberToHex(adjustedFromBlock)
                    : logsParams.fromBlock,
              },
            ];
            return baseTransport.request({ method, params: adjustedParams });
          }

          // Split into chunks using adjusted fromBlock
          const chunks: Array<{ from: number; to: number }> = [];
          for (
            let start = adjustedFromBlock;
            start <= toBlock;
            start += chunkSize
          ) {
            chunks.push({
              from: start,
              to: Math.min(start + chunkSize - 1, toBlock),
            });
          }

          if (enableLogging) {
            console.log(
              `[ChunkedLogsTransport] Adjusted fromBlock: ${adjustedFromBlock}, toBlock: ${toBlock}`,
            );
            console.log(
              `[ChunkedLogsTransport] Splitting getLogs request into ${chunks.length} chunks (${adjustedFromBlock} -> ${toBlock}, chunk size: ${chunkSize})`,
            );
          }

          // Create batch request
          const batchRequests = chunks.map(chunk => ({
            method: "eth_getLogs" as const,
            params: [
              {
                ...logsParams,
                fromBlock: numberToHex(chunk.from),
                toBlock: numberToHex(chunk.to),
              },
            ],
          }));

          // Execute batch request
          const startTime = Date.now();
          const results = await Promise.all(
            batchRequests.map(req =>
              baseTransport.request({ method: req.method, params: req.params }),
            ),
          );

          if (enableLogging) {
            const duration = Date.now() - startTime;
            const totalLogs = results.reduce(
              (sum: number, logs) => sum + (logs as RpcLog[]).length,
              0,
            );
            console.log(
              `[ChunkedLogsTransport] Completed ${chunks.length} requests in ${duration}ms, retrieved ${totalLogs} logs`,
            );
          }

          // Combine all logs
          return results.flat() as RpcLog[];
        }

        // For all other methods, use base transport
        return baseTransport.request({ method, params });
      },
    })(opts);
  };
}
