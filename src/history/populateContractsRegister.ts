import {
  type Address,
  type Chain,
  custom,
  isHex,
  type PublicClient,
  type Transport,
} from "viem";
import { createAdapter } from "../plugins/adapters/createAdapter.js";
import {
  bytes32ToString,
  type ChainContractsRegister,
  CreditFacadeV310BaseContract,
  getNetworkType,
  type ILogger,
  isV310,
  OnchainSDK,
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
  // Empty, non-attached SDK: no RPC happens until attach()/hydrate(), and the
  // history flow never touches attach-only getters. The caller's client may
  // carry a plain viem chain, while OnchainSDK needs a GearboxChain — so only
  // its transport is reused.
  const network = getNetworkType(client.chain.id);
  const sdk = new OnchainSDK(
    network,
    { transport: custom({ request: client.request }) },
    { logger },
  );

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
      new CreditFacadeV310BaseContract(sdk, {
        addr: d.address,
        version: d.version,
        contractType,
      });
    } else if (contractType.startsWith("ADAPTER::")) {
      createAdapter(
        sdk,
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
    sdk.tokensMeta.upsert(t.addr, t);
  }

  return sdk;
}
