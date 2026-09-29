import { type Address, zeroAddress } from "viem";
import { type ContractReader, resolveSecuritizeRwaSetup } from "../rwa.js";

/**
 * Selects the configurator Degen NFTs that belong to one market.
 *
 * Credit suites establish the association for ordinary markets. A Securitize
 * RWA market additionally inherits its factory's Degen NFT before any credit
 * suite exists.
 */
export async function selectMarketDegenNfts(args: {
  read: ContractReader;
  underlying: Address;
  registered: readonly Address[];
  creditManagerDegenNfts: readonly Address[];
}): Promise<Address[]> {
  const relevant = new Set(
    args.creditManagerDegenNfts
      .map(address => address.toLowerCase())
      .filter(address => address !== zeroAddress),
  );

  const rwaSetup = await resolveSecuritizeRwaSetup({
    read: args.read,
    underlying: args.underlying,
  });
  if (rwaSetup) {
    relevant.add(rwaSetup.degenNFT.toLowerCase());
  }

  return args.registered.filter(address => relevant.has(address.toLowerCase()));
}
