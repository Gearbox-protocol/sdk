const CVX_MAX_SUPPLY = 50000000000000000000000000n;
const CVX_REDUCTION_PER_CLIFF = 100000000000000000000000n;
const CVX_TOTAL_CLIFFS = 500n;

const INITIAL_SUPPLY = 5n * 10n ** 25n;
const INITIAL_CLIFFS = 700n;

export function getAURAMintAmount(
  amount: bigint,
  totalSupply: bigint,
  multiplier: bigint,
) {
  if (totalSupply <= 0n) return 0n;

  const effectiveAmount = (amount * multiplier) / 10000n;
  const emissionMinted = totalSupply - INITIAL_SUPPLY;

  const cliff = emissionMinted / CVX_REDUCTION_PER_CLIFF;

  if (cliff < CVX_TOTAL_CLIFFS) {
    const reduction = INITIAL_CLIFFS + ((CVX_TOTAL_CLIFFS - cliff) * 5n) / 2n;

    const mintedAmount = (effectiveAmount * reduction) / CVX_TOTAL_CLIFFS;

    const amountTillMax = CVX_MAX_SUPPLY - emissionMinted;

    return mintedAmount > amountTillMax ? amountTillMax : mintedAmount;
  }

  return 0n;
}
