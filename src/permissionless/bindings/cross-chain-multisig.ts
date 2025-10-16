import {
  Address,
  DecodeFunctionDataReturnType,
  Hex,
  parseAbi,
  parseEventLogs,
  PublicClient,
  recoverTypedDataAddress,
  WalletClient,
  zeroAddress,
} from "viem";
import { crossChainMultisigAbi } from "../abi";
import {
  Batch,
  CrossChainCall,
  ParsedCall,
  RecoveryMessage,
  Signature,
} from "../core/proposal";
import { BaseContract } from "./base-contract";

import { json_stringify } from "../../sdk/utils/index.js";
import type { RawTx } from "../../sdk/types/index.js";
import { Addresses } from "../deployment/addresses";
import { normalizeSignature } from "../utils";
import { CROSS_CHAIN_MULTISIG } from "../utils/literals";
import { InstanceManagerContract } from "./instance-manager";
import { MarketConfiguratorFactoryContract } from "./market-configurator-factory";

const abi = crossChainMultisigAbi;

export interface ConstructorParams {
  signers: Address[];
  threshold: number;
  dao: Address;
}

export interface Proposal {
  name: string;
  calls: {
    chainId: bigint;
    target: Hex;
    callData: Hex;
  }[];
}

export class CrossChainMultisigContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "CrossChainMultisig");
  }

  async getExecutedBatches(
    fromBlock: bigint,
    toBlock: bigint
  ): Promise<Omit<Batch, "timestamp">[]> {
    const events = await this.getEvents("ExecuteBatch", fromBlock, toBlock);

    const batches: Omit<Batch, "timestamp">[] = await Promise.all(
      events.map(async (event) => {
        return this.getBatchData({
          proposalHash: event.args.batchHash! as Hex,
          blockNumber: Number(event.blockNumber),
          transactionHash: event.transactionHash,
        });
      })
    );

    return batches;
  }

  async getCurrentBatches(): Promise<Batch[]> {
    const hashes = await this.contract.read.getCurrentBatchHashes();

    return await Promise.all(
      hashes.map(async (hash) => this.getBatchData({ proposalHash: hash }))
    );
  }

  async getBatchData(args: {
    proposalHash: Hex;
    blockNumber?: number;
    transactionHash?: Hex;
    timestamp?: number;
  }): Promise<Batch> {
    const { proposalHash, blockNumber, transactionHash, timestamp } = args;
    const proposal = await this.contract.read.getBatch([args.proposalHash]);

    const signatures: Signature[] = [];
    for (const sig of proposal.signatures) {
      // Recover signer from EIP-712 signature

      const recoveredSigner = await recoverTypedDataAddress({
        ...this.computeEIP712digest(
          proposal.name,
          proposalHash,
          proposal.prevHash
        ),
        signature: sig as Hex,
      });

      signatures.push({
        signer: recoveredSigner,
        signature: sig as Hex,
      });
    }

    const calls: CrossChainCall[] = proposal.calls.map((c) => ({
      chainId: Number(c.chainId),
      target: c.target,
      callData: c.callData,
    }));

    return {
      ...proposal,
      calls,
      timestamp,
      transactionHash: transactionHash,
      blockNumber: blockNumber,
      hash: proposalHash,
      parsedCalls: calls.map((c) => BaseContract.parseCall(c)),
      signatures,
    };
  }

  computeEIP712digest(name: string, batchHash: Hex, prevHash: Hex) {
    return {
      domain: {
        name: CROSS_CHAIN_MULTISIG,
        version: "310",
        chainId: 1,
        verifyingContract: this.address,
      },
      types: {
        CompactBatch: [
          { name: "name", type: "string" },
          { name: "batchHash", type: "bytes32" },
          { name: "prevHash", type: "bytes32" },
        ],
      },
      primaryType: "CompactBatch",
      message: {
        name,
        batchHash,
        prevHash,
      },
    } as const;
  }

  computeRecoveryDigest(chainId: number, startingBatchHash: Hex) {
    return {
      domain: {
        name: CROSS_CHAIN_MULTISIG,
        version: "310",
        chainId: 1,
        verifyingContract: this.address,
      },
      types: {
        RecoveryMode: [
          { name: "chainId", type: "uint256" },
          { name: "startingBatchHash", type: "bytes32" },
        ],
      },
      primaryType: "RecoveryMode",
      message: {
        chainId: BigInt(chainId),
        startingBatchHash,
      },
    } as const;
  }

  // signCompactBatchTypeData(name: string, batchHash: Hex, prevHash: Hex) {
  //   const typedData = this.computeEIP712digest(name, batchHash, prevHash);

  //   return {
  //     domain: typedData.domain,
  //     types: typedData.types,
  //     primaryType: typedData.primaryType,
  //     message: typedData.message,
  //   };
  // }

  async signBatch(
    batchHash: Hex,
    signature: Hex,
    sponsor: WalletClient
  ): Promise<Hex> {
    const normalizedSignature = normalizeSignature(signature);
    const hash = await this.contract.write.signBatch(
      [batchHash, normalizedSignature],
      {
        account: sponsor.account!,
        chain: sponsor.chain,
      }
    );

    // Wait for the transaction to be mined
    // await this.client.waitForTransactionReceipt({
    //   hash,
    // });

    return hash;
  }

  async enableRecovery(recovery: RecoveryMessage, sponsor: WalletClient) {
    const signatures = recovery.signatures.map((s) =>
      normalizeSignature(s.signature)
    );

    return await this.contract.write.enableRecoveryMode(
      [
        {
          chainId: BigInt(recovery.chainId),
          startingBatchHash: recovery.startingBatchHash,
          signatures,
        },
      ],
      {
        account: sponsor.account!,
        chain: sponsor.chain!,
      }
    );
  }

  async getConfirmationThreshold(): Promise<number> {
    return await this.contract.read.confirmationThreshold();
  }

  async getSigners(): Promise<Address[]> {
    return [...(await this.contract.read.getSigners())];
  }

  decodeFunctionData(target: Address, calldata: Hex): ParsedCall | undefined {
    switch (target.toLowerCase()) {
      case this.address.toLowerCase(): {
        return this.parseFunctionData(calldata);
      }
      case Addresses.INSTANCE_MANAGER.toLowerCase(): {
        const instanceManager = new InstanceManagerContract(
          target,
          this.client
        );
        return instanceManager.parseFunctionData(calldata);
      }
      default: {
        try {
          let parsedData: ParsedCall;
          const marketConfiguratorFactory =
            new MarketConfiguratorFactoryContract(target, this.client);
          parsedData = marketConfiguratorFactory.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }
        } catch {
          return undefined;
        }
      }
    }
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>
  ): ParsedCall | undefined {
    switch (params.functionName) {
      case "addSigner": {
        const [signer] = params.args;
        return this.wrapParseCall(params, {
          signer,
        });
      }
      case "removeSigner": {
        const [signer] = params.args;
        return this.wrapParseCall(params, {
          signer,
        });
      }
      case "setConfirmationThreshold": {
        const [threshold] = params.args;
        return this.wrapParseCall(params, {
          threshold: threshold.toString(),
        });
      }
      case "submitBatch": {
        const [name, calls, prevHash] = params.args;
        return this.wrapParseCall(params, {
          name,
          calls: json_stringify(
            calls.map(({ chainId, target, callData }) => ({
              ...this.decodeFunctionData(target, callData),
              chainId: Number(chainId),
              target,
            }))
          ),
          prevHash,
        });
      }
      default:
        return undefined;
    }
  }

  async validateProposalSignature(
    proposalHash: Hex,
    signature: Hex
  ): Promise<{ success: boolean; error?: string }> {
    const normalizedSignature = normalizeSignature(signature);
    const proposal = await this.getBatchData({ proposalHash });

    // Check if the proposal is the latest
    const currentPrevHash = await this.contract.read.lastBatchHash();
    if (proposal.prevHash !== currentPrevHash) {
      return { success: false, error: "Proposal is not the latest" };
    }

    // Check if the signature is valid
    const signer = await this.getSignerFromSignature(
      proposal.name,
      proposalHash,
      proposal.prevHash,
      normalizedSignature
    );

    console.log("signer", signer);

    // Check if the signer is a valid signer
    const signers = await this.getSigners();
    if (!signers.map((s) => s.toLowerCase()).includes(signer.toLowerCase())) {
      return { success: false, error: "Signer is not a valid signer" };
    }

    const threshold = await this.getConfirmationThreshold();

    // Check if the proposal has enough signatures
    if (proposal.signatures.length >= threshold) {
      return { success: false, error: "Proposal has enough signatures" };
    }

    return { success: true };
  }

  async getSignerFromSignature(
    proposalName: string,
    proposalHash: Hex,
    prevHash: Hex,
    signature: Hex
  ) {
    return await recoverTypedDataAddress({
      ...this.computeEIP712digest(proposalName, proposalHash, prevHash),
      signature,
    });
  }

  async executeProposal(
    signedProposal: {
      name: string;
      prevHash: Hex;
      calls: {
        chainId: bigint;
        target: Hex;
        callData: Hex;
      }[];
      signatures: Hex[];
    },
    sponsor: WalletClient
  ) {
    return await this.contract.write.executeBatch([signedProposal], {
      account: sponsor.account!,
      chain: sponsor.chain!,
    });
  }

  wrapSubmitBatch(args: { proposal: Proposal; prevHash: Hex }): RawTx {
    const { proposal, prevHash } = args;

    return this.createRawTx({
      functionName: "submitBatch",
      args: [proposal.name, proposal.calls, prevHash],
      description: `CrossChainMultisig.submitBatch(${proposal.name})`,
    });
  }

  executeProposalTx(signedProposal: {
    name: string;
    prevHash: Hex;
    calls: {
      chainId: bigint;
      target: Hex;
      callData: Hex;
    }[];
    signatures: Hex[];
  }) {
    return this.createRawTx({
      functionName: "executeBatch",
      args: [signedProposal],
    });
  }

  async submitBatch(
    proposal: {
      name: string;
      calls: {
        chainId: bigint;
        target: Hex;
        callData: Hex;
      }[];
    },
    sponsor: WalletClient
  ) {
    const prevHash = await this.getLastBatchHash();

    return await this.contract.write.submitBatch(
      [proposal.name, proposal.calls, prevHash],
      {
        account: sponsor.account!,
        chain: sponsor.chain!,
      }
    );
  }

  async getLastBatchHash(): Promise<Hex> {
    return await this.contract.read.lastBatchHash();
  }

  async computeBatchHash(args: {
    proposal: Proposal;
    prevHash: Hex;
  }): Promise<Hex> {
    const { proposal, prevHash } = args;
    return await this.contract.read.computeBatchHash([
      proposal.name,
      proposal.calls,
      prevHash,
    ]);
  }

  async getConstructorParams(): Promise<ConstructorParams> {
    const latestBlock = await this.client.getBlockNumber();
    const result = await this.getEvents(
      "SetConfirmationThreshold",
      0n,
      latestBlock
    );

    const event = result[0];

    const threshold = event.args.newConfirmationThreshold!;

    const receipt = await this.client.getTransactionReceipt({
      hash: event.transactionHash,
    });

    const signers: Address[] = [];
    let dao: Address = zeroAddress;

    parseEventLogs({
      abi: parseAbi([
        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
        "event AddSigner(address indexed signer)",
      ]),
      logs: receipt.logs,
    }).forEach((p) => {
      if (p.eventName === "AddSigner") {
        signers.push(p.args.signer);
      }
      if (p.eventName === "OwnershipTransferred") {
        dao = p.args.newOwner;
      }
    });

    console.log("signers", signers);
    console.log("threshold", threshold);
    console.log("dao", dao);

    return {
      signers,
      threshold,
      dao,
    };
  }
}
