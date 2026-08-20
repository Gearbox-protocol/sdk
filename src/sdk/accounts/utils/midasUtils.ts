import type { PublicClient } from "viem";
import { encodeFunctionData, isAddressEqual, parseAbi } from "viem";
import type { IMidasAdapter } from "../../market/adapters/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import type { ILogger, MultiCall } from "../../types/index.js";
import { AddressMap } from "../../utils/AddressMap.js";

const ADAPTER_MIDAS_GATEWAY = "ADAPTER::MIDAS_GATEWAY";
const ADAPTER_MIDAS_ISSUANCE_VAULT = "ADAPTER::MIDAS_ISSUANCE_VAULT";

/**
 * Permissionless gateways have no greenlist and reject `receiveGreenlist`,
 * see MidasMode in integrations-v3
 */
const MIDAS_MODE_PERMISSIONLESS = 0;

const iMidasGatewayAdapterExtAbi = parseAbi([
  "function receiveGreenlist() external returns (bool)",
]);

const iMidasGatewayModeAbi = parseAbi([
  "function mode() external view returns (uint8)",
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
   * Client to read gateway `mode` with
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
 * the greenlist first. Greenlisting the borrower is not enough — the role is
 * checked on the token holder, which is the credit account.
 *
 * Returns `calls` unchanged when nothing has to be greenlisted: no issuance
 * vault is called, its mToken has no gateway adapter on this credit manager,
 * the gateway is permissionless, or the call is already there.
 */
export async function prependMidasReceiveGreenlist(
  props: PrependMidasReceiveGreenlistProps,
): Promise<MultiCall[]> {
  const { cm, client, calls, logger } = props;

  const adapters = Array.from(cm.creditManager.adapters.values());
  const gatewayByMToken = AddressMap.fromMappedArray(
    adapters.filter(
      a => a.contractType === ADAPTER_MIDAS_GATEWAY,
    ) as IMidasAdapter[],
    a => a.mToken,
  );
  const calledVaults = (
    adapters.filter(
      a => a.contractType === ADAPTER_MIDAS_ISSUANCE_VAULT,
    ) as IMidasAdapter[]
  ).filter(vault =>
    calls.some(call => isAddressEqual(call.target, vault.address)),
  );
  if (gatewayByMToken.size === 0 || calledVaults.length === 0) {
    return calls;
  }

  // one gateway can back several issuance calls, and it only needs one greenlist
  const gateways = new AddressMap<IMidasAdapter>();
  for (const vault of calledVaults) {
    const gateway = gatewayByMToken.get(vault.mToken);
    if (!gateway) {
      logger?.debug(
        `midas: no gateway adapter for mToken ${vault.mToken} minted by ${vault.address} on ${cm.name}, cannot greenlist the credit account`,
      );
    } else if (
      calls.some(
        call =>
          isAddressEqual(call.target, gateway.address) &&
          call.callData === receiveGreenlistCallData,
      )
    ) {
      logger?.debug(
        `midas: gateway adapter ${gateway.address} already receives the greenlist`,
      );
    } else {
      gateways.upsert(gateway.address, gateway);
    }
  }
  if (gateways.size === 0) {
    return calls;
  }

  const uniqueGateways = gateways.values();
  const modes = await client.multicall({
    allowFailure: false,
    contracts: uniqueGateways.map(({ targetContract }) => ({
      address: targetContract,
      abi: iMidasGatewayModeAbi,
      functionName: "mode" as const,
    })),
  });

  const prepended: MultiCall[] = [];
  for (const [i, gateway] of uniqueGateways.entries()) {
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
