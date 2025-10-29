import {
  type Address,
  type DecodeFunctionDataReturnType,
  type Hex,
  hashStruct,
  hexToString,
  type Log,
  type PublicClient,
  parseEventLogs,
  recoverTypedDataAddress,
  stringToHex,
  type WalletClient,
} from "viem";
import { iBytecodeRepositoryAbi } from "../../abi/310/iBytecodeRepository.js";
import type { RawTx } from "../../sdk/types/index.js";
import type { Auditor } from "../core/auditor.js";
import type {
  AuditEvent,
  Bytecode,
  DeploymentExtended,
} from "../core/bytecode.js";
import type { ParsedCall } from "../core/proposal.js";
import { normalizeSignature } from "../utils/index.js";
import { BYTECODE_REPOSITORY } from "../utils/literals.js";
import { BaseContract } from "./base-contract.js";

const abi = iBytecodeRepositoryAbi;

interface ComputeAddressArgs {
  contractType: string;
  version: number;
  encodedParams: Hex;
  salt: Hex;
  owner: Address;
}

export class BytecodeRepositoryContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "BytecodeRepository");
  }

  async getBytecodeByHash(hash: `0x${string}`) {
    return await this.contract.read.getBytecode([hash]);
  }

  async getAuditReports(hash: `0x${string}`) {
    return await this.contract.read.getAuditReports([hash]);
  }

  async getPublicDomains() {
    return await this.contract.read.getPublicDomains();
  }

  async isBytecodeUploaded(hash: `0x${string}`): Promise<boolean> {
    return await this.contract.read.isBytecodeUploaded([hash]);
  }

  async isBytecodeAudited(hash: `0x${string}`): Promise<boolean> {
    return await this.contract.read.isBytecodeAudited([hash]);
  }

  async getLatestVersion(type_: string): Promise<bigint> {
    return await this.contract.read.getLatestVersion([
      stringToHex(type_, { size: 32 }),
    ]);
  }

  async isPublicDomain(domain: string): Promise<boolean> {
    return await this.contract.read.isPublicDomain([
      stringToHex(domain, { size: 32 }),
    ]);
  }

  // // Write functions
  // async uploadBytecode(bytecode: Bytecode) {
  //   return await this.contract.write.uploadBytecode([bytecode]);
  // }

  async getUploadBytecodeEvents(
    fromBlock: bigint,
    toBlock: bigint,
    chunkSize?: number,
  ): Promise<Omit<Bytecode, "uploadedAt">[]> {
    const events = await this.getEvents(
      "UploadBytecode",
      fromBlock,
      toBlock,
      undefined,
      chunkSize,
    );

    return events.map(e => ({
      bytecodeHash: e.args.bytecodeHash! as Hex,
      author: e.args.author! as Address,
      version: Number(e.args.version!),
      contractType: e.args.contractType!,
      source: e.args.source! as string,
      initCode: "0x" as Hex,
      size: 0,
      transactionHash: e.transactionHash,
      blockNumber: Number(e.blockNumber),
    }));
  }

  async getAddAuditorEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Auditor[]> {
    const events = await this.getEvents("AddAuditor", fromBlock, toBlock);

    const result: Auditor[] = [];

    for (const e of events) {
      result.push({
        address: e.args.auditor! as Address,
        name: e.args.name!,
        removed: false,
        removedAt: null,
        addedAt: Number(e.blockNumber),
      });
    }

    return result;
  }

  async getDeployContractEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Omit<DeploymentExtended, "timestamp">[]> {
    const events = await this.getEvents("DeployContract", fromBlock, toBlock);

    const result: Array<Omit<DeploymentExtended, "timestamp">> = [];

    for (const e of events) {
      result.push({
        address: e.args.contractAddress! as Address,
        chainId: 1, // BigInt(this.client.chain!.id!),
        txHash: e.transactionHash,
        blockNumber: Number(e.blockNumber),
        bytecodeHash: e.args.bytecodeHash! as Hex,
      });
    }

    return result;
  }

  async getAuditBytecodeEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Omit<AuditEvent, "timestamp">[]> {
    try {
      const events = await this.getEvents("AuditBytecode", fromBlock, toBlock);

      const result: Array<Omit<AuditEvent, "timestamp">> = [];

      for (const e of events) {
        result.push({
          bytecodeHash: e.args.bytecodeHash! as Hex,
          auditor: e.args.auditor! as Address,
          reportUrl: e.args.reportUrl!,
          signature: e.args.signature! as Hex,
          transactionHash: e.transactionHash,
          blockNumber: Number(e.blockNumber),
        });
      }

      return result;
    } catch (e) {
      if (e instanceof Error && e.message.includes("query exceeds max block")) {
        const middle = (fromBlock + toBlock) / 2n;
        return [
          ...(await this.getAuditBytecodeEvents(fromBlock, middle)),
          ...(await this.getAuditBytecodeEvents(middle + 1n, toBlock)),
        ];
      }

      throw e;
    }
  }

  async getAllowPublicContractEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<
    Array<{
      bytecodeHash: Hex;
      contractType: Hex;
      version: bigint;
      transactionHash: Hex;
      blockNumber: number;
    }>
  > {
    const code = await this.client.getCode({ address: this.address });
    // @dev if the contract is not deployed, there is no events
    if (code === undefined || code === "0x") {
      return [];
    }

    const publicDomains = await this.contract.read.getPublicDomains();

    const publicDomainsString = publicDomains.map(domain =>
      hexToString(domain, { size: 32 }),
    );

    const events = await this.getAllowContractEvents(fromBlock, toBlock);

    return events.filter(e => {
      const contractTypeString = hexToString(e.contractType, { size: 32 });
      return publicDomainsString.includes(
        this.extractDomain(contractTypeString),
      );
    });
  }

  async getAllowContractEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<
    Array<{
      bytecodeHash: Hex;
      contractType: Hex;
      version: bigint;
      transactionHash: Hex;
      blockNumber: number;
    }>
  > {
    try {
      const events = await this.getEvents("AllowContract", fromBlock, toBlock);

      const result: Array<{
        bytecodeHash: Hex;
        contractType: Hex;
        version: bigint;
        transactionHash: Hex;
        blockNumber: number;
      }> = [];

      for (const e of events) {
        result.push({
          bytecodeHash: e.args.bytecodeHash! as Hex,
          contractType: e.args.contractType! as Hex,
          version: e.args.version! as bigint,
          transactionHash: e.transactionHash,
          blockNumber: Number(e.blockNumber),
        });
      }

      return result;
    } catch (e) {
      if (e instanceof Error && e.message.includes("query exceeds max block")) {
        const middle = (fromBlock + toBlock) / 2n;
        return [
          ...(await this.getAllowContractEvents(fromBlock, middle)),
          ...(await this.getAllowContractEvents(middle + 1n, toBlock)),
        ];
      }

      throw e;
    }
  }

  async getUploadUpdates(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Omit<Bytecode, "uploadedAt">[]> {
    const events = await this.getUploadBytecodeEvents(fromBlock, toBlock);

    const initCodes = await Promise.all(
      events.map(event => this.getBytecodeByHash(event.bytecodeHash)),
    );

    events.forEach((event, index) => {
      event.initCode = initCodes[index].initCode;
      event.size = initCodes[index].initCode.length;
    });

    return events;
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    switch (params.functionName) {
      case "allowSystemContract": {
        const [bytecodeHash] = params.args;
        return this.wrapParseCall(params, {
          bytecodeHash,
        });
      }

      case "addAuditor": {
        const [auditor, name] = params.args;
        return this.wrapParseCall(params, {
          auditor,
          name,
        });
      }
      case "removeAuditor": {
        const [auditor] = params.args;
        return this.wrapParseCall(params, {
          auditor,
        });
      }
      case "addPublicDomain": {
        const [domain] = params.args;
        return this.wrapParseCall(params, {
          domain: hexToString(domain, { size: 32 }),
        });
      }
      case "removePublicContractType": {
        const [contractType] = params.args;
        return this.wrapParseCall(params, {
          contractType: hexToString(contractType, { size: 32 }),
        });
      }
      case "forbidInitCode": {
        const [bytecodeHash] = params.args;
        return this.wrapParseCall(params, {
          bytecodeHash,
        });
      }
      case "setTokenSpecificPostfix": {
        const [token, postfix] = params.args;
        return this.wrapParseCall(params, {
          token,
          postfix: hexToString(postfix, { size: 32 }),
        });
      }
      case "uploadBytecode": {
        const [uploadData] = params.args;
        return this.wrapParseCall(params, {
          contractType: hexToString(uploadData.contractType, { size: 32 }),
          version: uploadData.version.toString(),
          initCode: uploadData.initCode,
          author: uploadData.author,
          source: uploadData.source,
          authorSignature: uploadData.authorSignature,
        });
      }
      case "submitAuditReport": {
        const [bytecodeHash, { auditor, reportUrl, signature }] = params.args;
        return this.wrapParseCall(params, {
          bytecodeHash,
          auditor,
          reportUrl,
          signature,
        });
      }
      // TODO: add all functions here!
      // case "deployContract": {
      //   const [contractType, version, encodedParams, salt, owner] = params.args;
      //   return this.wrapParseCall(params, {
      //     contractType: hexToString(contractType, { size: 32 }),
      //     version: version.toString(),
      //     encodedParams,
      //     salt,
      //     owner,
      //   });
      // }
      // case "setContractTypeVersion": {
      //   const [contractType, version] = params.args;
      //   return this.wrapParseCall(params, {
      //     contractType: hexToString(contractType, { size: 32 }),
      //     version: version.toString(),
      //   });
      // }
      default:
        return undefined;
    }
  }

  async signBytecodeHash(
    bytecodeHash: Hex,
    auditor: Address,
    reportUrl: string,
    signature: Hex,
    sponsor: WalletClient,
  ) {
    return await this.contract.write.submitAuditReport(
      [bytecodeHash, { auditor, reportUrl, signature }],
      {
        account: sponsor.account!,
        chain: sponsor.chain,
      },
    );
  }

  signBytecodeHashTx(
    bytecodeHash: Hex,
    auditor: Address,
    reportUrl: string,
    signature: Hex,
  ) {
    const normalizedSignature = normalizeSignature(signature);
    return this.createRawTx({
      functionName: "submitAuditReport",
      args: [
        bytecodeHash,
        { auditor, reportUrl, signature: normalizedSignature },
      ],
    });
  }

  async recoverAuditorSignature(
    bytecodeHash: Hex,
    auditor: Address,
    reportUrl: string,
    signature: Hex,
  ): Promise<Address> {
    const digest = this.computeEIP712AuditorDigest(
      bytecodeHash,
      auditor,
      reportUrl,
    );

    return await recoverTypedDataAddress({
      ...digest,
      signature,
    });
  }

  async recoverAuthorSignature(
    contractType: string,
    version: number,
    initCode: Hex,
    author: Address,
    source: string,
    signature: Hex,
  ): Promise<Address> {
    const digest = this.computeEIP712AuthorDigest({
      contractType: stringToHex(contractType, { size: 32 }),
      version: BigInt(version),
      initCode,
      author,
      source,
    });

    return await recoverTypedDataAddress({
      ...digest,
      signature,
    });
  }

  // computeEIP712AuditorDigest(bytecodeHash: Hex, reportUrl: string) {
  //   return {
  //     domain: this.getEIP712Domain(),
  //     types: {
  //       SignBytecodeHash: [
  //         { name: "bytecodeHash", type: "bytes32" },
  //         { name: "reportUrl", type: "string" },
  //       ],
  //     },
  //     primaryType: "SignBytecodeHash",
  //     message: {
  //       bytecodeHash,
  //       reportUrl,
  //     },
  //   } as const;
  // }

  computeEIP712AuditorDigest(
    bytecodeHash: Hex,
    auditor: Address,
    reportUrl: string,
  ) {
    return {
      domain: this.getEIP712Domain(),
      types: {
        AuditReport: [
          { name: "bytecodeHash", type: "bytes32" },
          { name: "auditor", type: "address" },
          { name: "reportUrl", type: "string" },
        ],
      },
      primaryType: "AuditReport",
      message: {
        bytecodeHash,
        auditor,
        reportUrl,
      },
    } as const;
  }

  computeEIP712AuthorDigest(args: {
    contractType: Hex;
    version: bigint;
    initCode: Hex;
    author: Address;
    source: string;
  }) {
    return {
      domain: this.getEIP712Domain(),
      ...BytecodeRepositoryContract.getBytecodeHashTypes(),
      message: args,
    } as const;
  }

  private getEIP712Domain() {
    return {
      name: BYTECODE_REPOSITORY,
      version: "310",
      chainId: 1,
      verifyingContract: this.address,
    };
  }

  computeBytecodeHash(args: {
    contractType: Hex;
    version: bigint;
    initCode: Hex;
    author: Address;
    source: string;
  }): Hex {
    return hashStruct({
      data: args,
      ...BytecodeRepositoryContract.getBytecodeHashTypes(),
    });
  }

  static getBytecodeHashTypes() {
    return {
      primaryType: "Bytecode",
      types: {
        Bytecode: [
          { name: "contractType", type: "bytes32" },
          { name: "version", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "author", type: "address" },
          { name: "source", type: "string" },
        ],
      },
    } as const;
  }

  async computeBytecodeHashContract(args: {
    contractType: Hex;
    version: bigint;
    initCode: Hex;
    author: Address;
    source: string;
  }): Promise<Hex> {
    return await this.contract.read.computeBytecodeHash([
      { ...args, authorSignature: "0x" },
    ]);
  }

  async getAuditors(): Promise<Address[]> {
    return [...(await this.contract.read.getAuditors())];
  }

  isAuditor(auditor: Address): Promise<boolean> {
    return this.contract.read.isAuditor([auditor]);
  }

  extractDeployDataEvent(logs: Log[]): {
    address: Address;
    bytecodeHash: Hex;
    contractType: string;
    version: number;
  } {
    const events = parseEventLogs({
      logs: logs.filter(
        log => log.address.toLowerCase() === this.address.toLowerCase(),
      ),
      abi: abi,
    });

    const deployEvents = events.filter(
      event => event.eventName === "DeployContract",
    );

    if (deployEvents.length !== 1) {
      throw new Error("Invalid deploy event");
    }

    return {
      address: deployEvents[0].args.contractAddress,
      bytecodeHash: deployEvents[0].args.bytecodeHash,
      contractType: deployEvents[0].args.contractType,
      version: Number(deployEvents[0].args.version),
    };
  }

  async computeAddress(args: ComputeAddressArgs): Promise<Address> {
    return await this.contract.read.computeAddress([
      stringToHex(args.contractType, { size: 32 }),
      BigInt(args.version),
      args.encodedParams,
      args.salt,
      args.owner,
    ]);
  }

  async isAlreadyDeployedAddress(
    args: ComputeAddressArgs,
  ): Promise<[boolean, Address]> {
    const address = await this.computeAddress(args);
    const code = await this.client.getCode({ address });

    return [code !== undefined, address];
  }

  async isAlreadyDeployed(args: ComputeAddressArgs): Promise<boolean> {
    return (await this.isAlreadyDeployedAddress(args))[0];
  }

  async uploadBytecode(
    uploadByteCode: {
      contractType: Hex;
      version: bigint;
      initCode: Hex;
      author: Address;
      source: string;
      authorSignature: Hex;
    },
    sponsor: WalletClient,
  ) {
    const normalizedSignature = normalizeSignature(
      uploadByteCode.authorSignature,
    );
    return await this.contract.write.uploadBytecode(
      [{ ...uploadByteCode, authorSignature: normalizedSignature }],
      {
        account: sponsor.account!,
        chain: sponsor.chain!,
        // gas: 35_000_000n,
      },
    );
  }

  addAuditorTx(args: { name: string; address: Address }): RawTx {
    const { name, address } = args;

    return this.createRawTx({
      functionName: "addAuditor",
      args: [address, name],
      description: `BytecodeRepository.addAuditor(${name})`,
    });
  }

  addPublicDomainTx(args: { domain: string }): RawTx {
    const { domain } = args;
    const domainHex = stringToHex(domain, { size: 32 });

    return this.createRawTx({
      functionName: "addPublicDomain",
      args: [domainHex],
      description: `BytecodeRepository.addPublicDomain(${domain})`,
    });
  }

  allowPublicContractTx(args: { bytecodeHash: Hex }): RawTx {
    const { bytecodeHash } = args;
    return this.createRawTx({
      functionName: "allowPublicContract",
      args: [bytecodeHash],
      description: `BytecodeRepository.allowPublicContract(${bytecodeHash})`,
    });
  }
  allowSystemContractTx(args: { bytecodeHash: Hex }): RawTx {
    const { bytecodeHash } = args;
    return this.createRawTx({
      functionName: "allowSystemContract",
      args: [bytecodeHash],
      description: `BytecodeRepository.allowSystemContract(${bytecodeHash})`,
    });
  }

  setTokenSpecificPostfixTx(args: { token: Address; postfix: string }): RawTx {
    const { token, postfix } = args;
    const postfixHex = stringToHex(postfix, { size: 32 });

    return this.createRawTx({
      functionName: "setTokenSpecificPostfix",
      args: [token, postfixHex],
      description: `BytecodeRepository.setTokenSpecificPostfix(${token}, ${postfix})`,
    });
  }

  uploadBytecodeRawTx(uploadByteCode: {
    contractType: Hex;
    version: bigint;
    initCode: Hex;
    author: Address;
    source: string;
    authorSignature: Hex;
  }) {
    return this.createRawTx({
      functionName: "uploadBytecode",
      args: [uploadByteCode],
    });
  }

  extractDomain(contractType: string): string {
    const separatorIndex = contractType.indexOf("::");
    if (separatorIndex === -1) return contractType;
    return contractType.slice(0, separatorIndex);
  }

  async allowPublicContract(bytecodeHash: Hex, sponsor: WalletClient) {
    return await this.contract.write.allowPublicContract([bytecodeHash], {
      account: sponsor.account!,
      chain: sponsor.chain!,
    });
  }

  deployTx(args: {
    contractType: string;
    version: bigint;
    encodedParams: Hex;
    salt: Hex;
  }) {
    return this.createRawTx({
      functionName: "deploy",
      args: [
        stringToHex(args.contractType, { size: 32 }),
        args.version,
        args.encodedParams,
        args.salt,
      ],
    });
  }
}
