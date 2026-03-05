import type { Chain, PublicClient, Transport } from "viem";
import type {
  ConstructOptions,
  IBaseContract,
  ILogger,
  TypedVersionedAddress,
} from "../sdk/index.js";
import {
  bytes32ToString,
  ChainContractsRegister,
  CreditFacadeV310BaseContract,
  isV310,
} from "../sdk/index.js";

export type ContractFactory = (
  options: ConstructOptions,
  args: TypedVersionedAddress,
) => IBaseContract;

export class ContractRegister {
  readonly #client: PublicClient<Transport, Chain>;
  readonly #logger?: ILogger;
  readonly #register: ChainContractsRegister;
  readonly #factories: ContractFactory[] = [];

  constructor(client: PublicClient<Transport, Chain>, logger?: ILogger) {
    this.#client = client;
    this.#logger = logger;
    this.#register = ChainContractsRegister.for(client, logger);
  }

  public get register(): ChainContractsRegister {
    return this.#register;
  }

  public registerFactory(factory: ContractFactory): void {
    this.#factories.push(factory);
  }

  public createContract(args: TypedVersionedAddress): IBaseContract {
    const { addr, version } = args;
    const existing = this.#register.getContract(addr);
    if (existing) {
      return existing as IBaseContract;
    }
    const contractType = bytes32ToString(args.contractType);

    if (contractType === "CREDIT_FACADE" && isV310(version)) {
      return new CreditFacadeV310BaseContract(
        { client: this.#client, logger: this.#logger },
        { ...args, name: `CreditFacadeV310(${addr})` },
      );
    }

    for (const factory of this.#factories) {
      const contract = factory(
        { client: this.#client, logger: this.#logger },
        args,
      );
      if (contract) {
        return contract;
      }
    }

    throw new Error(`unknown contract ${contractType} v${version}`);
  }
}
