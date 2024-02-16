import { WAD } from "@gearbox-protocol/sdk-gov";

const CVX_MAX_SUPPLY = WAD * 50000000n;
const CVX_REDUCTION_PER_CLIFF = 100000n;
const CVX_TOTAL_CLIFFS = WAD * 500n;

const INITIAL_SUPPLY = 5n * 10n ** 25n;
const INITIAL_CLIFFS = WAD * 700n;

export function getAURAMintAmount(amount: bigint, totalSupply: bigint) {
  if (totalSupply <= 0n) {
    return 0n;
  }

  const emissionMinted = totalSupply - INITIAL_SUPPLY;
  const currentCliff = emissionMinted / CVX_REDUCTION_PER_CLIFF;

  if (currentCliff < CVX_TOTAL_CLIFFS) {
    const reduction =
      INITIAL_CLIFFS + ((CVX_TOTAL_CLIFFS - currentCliff) * 5n) / 2n;

    const mintedAmount = (amount * reduction) / CVX_TOTAL_CLIFFS;
    const amountTillMax = CVX_MAX_SUPPLY - emissionMinted;

    return mintedAmount > amountTillMax ? amountTillMax : mintedAmount;
  }

  return 0n;
}
