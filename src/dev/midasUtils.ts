import type { Address, PublicClient } from "viem";
import { encodeFunctionData, isAddressEqual, parseAbi } from "viem";
import type {
  CreditSuite,
  IAdapterContract,
  ILogger,
  MultiCall,
} from "../sdk/index.js";
import { midasGatewayAbi } from "./withdrawalAbi.js";

const ADAPTER_MIDAS_GATEWAY = "ADAPTER::MIDAS_GATEWAY";
const ADAPTER_MIDAS_ISSUANCE_VAULT = "ADAPTER::MIDAS_ISSUANCE_VAULT";

/**
 * Permissionless gateways have no greenlist and reject `receiveGreenlist`,
 * see MidasMode in integrations-v3
 */
const MIDAS_MODE_PERMISSIONLESS = 0;

/**
 * Gateways and issuance vaults both expose their mToken, but only on-chain:
 * without the adapters plugin the SDK represents adapters as placeholders that
 * expose nothing but their target contract
 */
const iMidasMTokenAbi = parseAbi([
  "function mToken() external view returns (address)",
]);

const iMidasGatewayAdapterExtAbi = parseAbi([
  "function receiveGreenlist() external returns (bool)",
]);

const receiveGreenlistCallData = encodeFunctionData({
  abi: iMidasGatewayAdapterExtAbi,
  functionName: "receiveGreenlist",
});

export interface PrependMidasReceiveGreenlistProps {
  /**
   * Credit manager the account is opened on
   */
  cm: CreditSuite;
  /**
   * Client to read gateway state with
   */
  client: PublicClient;
  /**
   * Calls to run in the credit facade multicall, as produced by the router
   */
  calls: MultiCall[];
  logger?: ILogger;
}

/**
 * Prepends `MidasGatewayAdapter.receiveGreenlist()` to a credit facade
 * multicall that mints an mToken through a Midas issuance vault.
 *
 * Permissioned and restricted-interface mTokens can only be held by greenlisted
 * accounts, and a freshly opened credit account is never greenlisted, so the
 * mint reverts with `WMAC: hasnt role` unless the account asks the gateway for
 * the greenlist first. Greenlisting the borrower (see `registerMidasInvestor`)
 * is not enough — the role is checked on the token holder, which is the credit
 * account.
 *
 * Returns `calls` unchanged when nothing has to be greenlisted: no issuance
 * vault is called, its mToken has no gateway adapter on this credit manager,
 * the gateway is permissionless, or the call is already there.
 */
export async function prependMidasReceiveGreenlist(
  props: PrependMidasReceiveGreenlistProps,
): Promise<MultiCall[]> {
  const { cm, client, calls, logger } = props;

  const gatewayAdapters: IAdapterContract[] = [];
  const issuanceAdapters: IAdapterContract[] = [];
  for (const adapter of cm.creditManager.adapters.values()) {
    switch (adapter.contractType) {
      case ADAPTER_MIDAS_GATEWAY:
        gatewayAdapters.push(adapter);
        break;
      case ADAPTER_MIDAS_ISSUANCE_VAULT:
        issuanceAdapters.push(adapter);
        break;
    }
  }
  if (gatewayAdapters.length === 0) {
    return calls;
  }
  const calledIssuanceAdapters = issuanceAdapters.filter(adapter =>
    calls.some(call => isAddressEqual(call.target, adapter.address)),
  );
  if (calledIssuanceAdapters.length === 0) {
    return calls;
  }

  const [gatewayMTokens, issuanceMTokens] = await Promise.all([
    readMTokens(client, gatewayAdapters),
    readMTokens(client, calledIssuanceAdapters),
  ]);

  // one gateway can back several issuance calls, and it only needs one greenlist
  const gateways: IAdapterContract[] = [];
  for (const [i, mToken] of issuanceMTokens.entries()) {
    const gateway = gatewayAdapters.find((_, j) =>
      isAddressEqual(gatewayMTokens[j], mToken),
    );
    if (!gateway) {
      logger?.debug(
        `midas: no gateway adapter for mToken ${mToken} minted by ${calledIssuanceAdapters[i].address} on ${cm.name}, cannot greenlist the credit account`,
      );
      continue;
    }
    if (gateways.some(g => isAddressEqual(g.address, gateway.address))) {
      continue;
    }
    if (
      calls.some(
        call =>
          isAddressEqual(call.target, gateway.address) &&
          call.callData === receiveGreenlistCallData,
      )
    ) {
      logger?.debug(
        `midas: gateway adapter ${gateway.address} already receives the greenlist`,
      );
      continue;
    }
    gateways.push(gateway);
  }
  if (gateways.length === 0) {
    return calls;
  }

  const modes = await client.multicall({
    allowFailure: false,
    contracts: gateways.map(({ targetContract }) => ({
      address: targetContract,
      abi: midasGatewayAbi,
      functionName: "mode" as const,
    })),
  });

  const prepended: MultiCall[] = [];
  for (const [i, gateway] of gateways.entries()) {
    if (modes[i] === MIDAS_MODE_PERMISSIONLESS) {
      logger?.debug(
        `midas: gateway ${gateway.targetContract} is permissionless, nothing to greenlist`,
      );
      continue;
    }
    logger?.debug(
      `midas: greenlisting the credit account via gateway adapter ${gateway.address}`,
    );
    prepended.push({
      target: gateway.address,
      callData: receiveGreenlistCallData,
    });
  }
  return prepended.length > 0 ? [...prepended, ...calls] : calls;
}

async function readMTokens(
  client: PublicClient,
  adapters: IAdapterContract[],
): Promise<Address[]> {
  return await client.multicall({
    allowFailure: false,
    contracts: adapters.map(({ targetContract }) => ({
      address: targetContract,
      abi: iMidasMTokenAbi,
      functionName: "mToken" as const,
    })),
  });
}
