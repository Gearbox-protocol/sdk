import {
  type Address,
  type Chain,
  isHex,
  type PublicClient,
  type Transport,
} from "viem";
import { createAdapter } from "../plugins/adapters/createAdapter.js";
import {
  bytes32ToString,
  ChainContractsRegister,
  CreditFacadeV310BaseContract,
  type ILogger,
  isV310,
  type TokenMetaData,
  TokensMeta,
} from "../sdk/index.js";

export type DeploymentLike = {
  address: Address;
  version: number;
} & (
  | {
      contractTypePrefix: string;
      contractTypeSuffix: string;
    }
  | {
      contractType: string;
    }
);

export interface PopulateContractsRegisterOptions {
  client: PublicClient<Transport, Chain>;
  deployments: DeploymentLike[];
  tokens: TokensMeta | Iterable<TokenMetaData>;
  logger?: ILogger;
  strict?: boolean;
}

export function populateContractsRegister(
  options: PopulateContractsRegisterOptions,
): ChainContractsRegister {
  const { client, deployments, tokens, logger, strict } = options;
  const register = new ChainContractsRegister(client, logger);

  for (const d of deployments) {
    let contractType: string;
    if ("contractType" in d) {
      contractType = isHex(d.contractType)
        ? bytes32ToString(d.contractType)
        : d.contractType;
    } else {
      contractType = [d.contractTypePrefix, d.contractTypeSuffix]
        .filter(Boolean)
        .join("::");
    }
    if (contractType === "CREDIT_FACADE" && isV310(d.version)) {
      new CreditFacadeV310BaseContract(
        { register, logger },
        { addr: d.address, version: d.version, contractType },
      );
    } else if (contractType.startsWith("ADAPTER::")) {
      createAdapter(
        {
          register,
          logger,
        },
        {
          baseParams: {
            addr: d.address,
            version: d.version,
            contractType,
          },
        },
        strict,
      );
    }
  }

  const tMetas = tokens instanceof TokensMeta ? tokens.values() : tokens;
  for (const t of tMetas) {
    register.tokensMeta.upsert(t.addr, t);
  }

  return register;
}
