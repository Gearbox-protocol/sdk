import {
  type Address,
  type DecodeFunctionDataReturnType,
  encodeAbiParameters,
  formatEther,
  type Hash,
  type Hex,
  keccak256,
  type PublicClient,
  toBytes,
} from "viem";
import { formatAbiItem } from "viem/utils";
import type { RawTx } from "../../../sdk/types/index.js";
import { json_stringify } from "../../../sdk/utils/index.js";
import { governorAbi } from "../../abi";
import type { ParsedCall } from "../../core";
import { formatTimestamp } from "../../utils";
import { BaseContract } from "../base-contract";
import { MarketConfiguratorContract } from "../market-configurator";
import { TreasurySplitterContract } from "../treasury-splitter";
import { BatchesChainContract } from "./batches-chain";
import type { SafeTx, TimelockTxParams } from "./types";

const abi = governorAbi;

export class GovernorContract extends BaseContract<typeof abi> {
  public readonly batchesChainContract: BatchesChainContract;

  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "Governor");

    this.batchesChainContract = new BatchesChainContract(
      "0x59b2fd348e4Ade84ffEfDaf5fcdDa7276c8C5041",
      client,
    );
  }

  getTxHash(tx: RawTx): Hash {
    if (tx.contractMethod.name !== "queueTransaction") {
      throw new Error(
        `Transaction is not a queueTransaction, method provided: ${tx.contractMethod.name}`,
      );
    }

    const { target, value, signature, data, eta } = tx.contractInputsValues;

    return keccak256(
      encodeAbiParameters(
        [
          { type: "address", name: "target" },
          { type: "uint", name: "value" },
          { type: "string", name: "signature" },
          { type: "bytes", name: "data" },
          { type: "uint", name: "eta" },
        ],
        [target, value, signature, data, eta],
      ),
    );
  }

  async owner(): Promise<Address> {
    const owner = await this.client.readContract({
      address: this.address,
      abi: governorAbi,
      functionName: "owner",
    });

    return owner as Address;
  }

  createQueueTx(args: { tx: RawTx; eta: number }): RawTx {
    const { tx, eta } = args;

    const signature = formatAbiItem({
      type: "function",
      stateMutability: tx.contractMethod.payable ? "payable" : "nonpayable",
      outputs: [],
      ...tx.contractMethod,
    });

    return this.createRawTx({
      functionName: "queueTransaction",
      args: [
        tx.to,
        0n,
        signature,
        ("0x" + tx.callData.slice(10)) as Hex,
        BigInt(eta),
      ],
      description: `QueueTransaction(${tx.description})`,
    });
  }

  createGovernorBatch(args: {
    txs: RawTx[];
    eta: number;
    prevHash?: Hash;
  }): RawTx[] {
    const { txs, eta, prevHash } = args;
    const transactions = [] as RawTx[];

    const queueTxs = txs.map(tx => this.createQueueTx({ tx, eta }));

    transactions.push(
      this.createRawTx({
        functionName: "startBatch",
        args: [BigInt(eta)],
        description: `StartBatch(${eta})`,
      }),
    );

    if (prevHash !== undefined) {
      transactions.push(
        this.createQueueTx({
          tx: this.batchesChainContract.createBatchOrderingTx(prevHash),
          eta,
        }),
      );
    }

    transactions.push(...queueTxs);
    return transactions;
  }

  createGovernorBatches(args: { batches: RawTx[][]; eta: number }): RawTx[][] {
    const { batches, eta } = args;

    const queueBatches: RawTx[][] = [];
    let prevHash: Hash | undefined;

    for (const txs of batches) {
      queueBatches.push(this.createGovernorBatch({ txs, eta, prevHash }));

      prevHash = this.getTxHash(this.createQueueTx({ tx: txs[0], eta }));
    }

    return queueBatches;
  }

  createExecuteBatchTx(args: { txs: SafeTx[] }): RawTx {
    const executionBatch = args.txs
      .filter(tx => tx.contractMethod.name === "queueTransaction")
      .map(tx => ({
        ...tx.contractInputsValues,
        value: BigInt(tx.contractInputsValues.value),
        eta: BigInt(tx.contractInputsValues.eta),
      })) as unknown as Array<TimelockTxParams>;

    return this.createRawTx({
      functionName: "executeBatch",
      args: [executionBatch],
      description: `ExecuteBatch(${executionBatch
        .map(
          tx =>
            `{
  target: ${tx.target},
  value: ${tx.value.toString()},
  signature: ${tx.signature},
  data: ${tx.data.length > 40 ? `${tx.data.slice(0, 40)}...` : tx.data},
},`,
        )
        .join("\n")})`,
    });
  }

  decodeFunctionData(target: Address, calldata: Hex): ParsedCall | undefined {
    switch (target.toLowerCase()) {
      case this.address.toLowerCase(): {
        return this.parseFunctionData(calldata);
      }
      case this.batchesChainContract.address.toLowerCase(): {
        return this.batchesChainContract.parseFunctionData(calldata);
      }
      default: {
        try {
          let parsedData: ParsedCall;
          const marketConfigurator = new MarketConfiguratorContract(
            target,
            this.client,
          );
          parsedData = marketConfigurator.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const treasurySplitter = new TreasurySplitterContract(
            target,
            this.client,
          );

          parsedData = treasurySplitter.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }
        } catch {
          return undefined;
        }
      }
    }
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "startBatch": {
        const [eta] = args;

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            eta: formatTimestamp(Number(eta)),
          },
        };
      }
      case "queueTransaction": {
        const [target, value, signature, data, eta] = args;

        const calldata = (keccak256(toBytes(signature)).slice(0, 10) +
          data.slice(2)) as Hex;

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            target,
            value: formatEther(value),
            signature,
            data: json_stringify(
              this.decodeFunctionData(target, calldata)?.args ?? calldata,
            ),
            eta: formatTimestamp(Number(eta)),
          },
        };
      }
      case "executeBatch": {
        const [txs] = args;

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            txs: json_stringify(
              txs.map(tx => {
                const { target, value, signature, data, eta } = tx;
                const calldata = (keccak256(toBytes(signature)).slice(0, 10) +
                  data.slice(2)) as Hex;

                return {
                  target,
                  value: formatEther(value),
                  signature,
                  data: json_stringify(
                    this.decodeFunctionData(target, calldata)?.args ?? calldata,
                  ),
                  eta: formatTimestamp(Number(eta)),
                };
              }),
            ),
          },
        };
      }

      default:
        return undefined;
    }
  }
}
