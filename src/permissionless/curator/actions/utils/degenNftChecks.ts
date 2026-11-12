import { type Address, stringToHex, zeroAddress } from "viem";
import type { MarketState } from "../../state/market/types.js";
import { peripheryStatus } from "../../state/market/types.js";
import { isSameAddress } from "../../utils/addressUtils.js";
import {
  type ActionDiagnostic,
  actionError,
  incompleteCheck,
} from "../actionDiagnostics.js";
import type { GipBuilderContext } from "../builderContext.js";
import { type ChainRead, readChain } from "./chainReads.js";

/** Whether `address` is a registered Degen NFT; the zero address means none. **/
export function resolveDegenNft(
  ctx: GipBuilderContext,
  address: Address,
): Promise<ChainRead<boolean>> {
  return isSameAddress(address, zeroAddress)
    ? Promise.resolve({ value: true })
    : readChain(() =>
        ctx.marketConfigurator.contract.read.isPeripheryContract([
          stringToHex("DEGEN_NFT", { size: 32 }),
          address,
        ]),
      );
}

/**
 * A facade's Degen NFT must be registered as periphery, on chain or by an
 * earlier action of the GIP.
 **/
export function degenNftDiagnostics(
  state: MarketState,
  address: Address,
  registered: ChainRead<boolean>,
): ActionDiagnostic[] {
  if (
    registered.value ||
    isSameAddress(address, zeroAddress) ||
    state.periphery?.some(
      entry =>
        isSameAddress(entry.address, address) &&
        entry.domain === "DEGEN_NFT" &&
        peripheryStatus(entry) === "registered",
    )
  )
    return [];
  return registered.value === false
    ? [
        actionError(
          "DEGEN_NFT_NOT_REGISTERED",
          `Degen NFT ${address} must be registered before deploying the facade`,
        ),
      ]
    : [
        incompleteCheck(
          "degenNftRegistration",
          "Registration could not be read at the source block",
        ),
      ];
}
