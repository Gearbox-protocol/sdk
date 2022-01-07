export const deployedContracts: Record<string, string> = {
  "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668": "Pool DAI",
  "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4": "Pool USDC",
  "0xB03670c20F87f2169A7c4eBE35746007e9575901": "Pool WETH",
  "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08": "Pool WBTC",
  "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017": "CreditManager WBTC",
  "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0": "CreditManager WETH",
  "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527": "CreditManager USDC",
  "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB": "CreditManager DAI",
};

export function getContractName(address: string): string {
  return deployedContracts[address] || address;
}
