import type { Address, PublicClient } from "viem";
import type { InputValueParams, PriceFeedSetupParams } from "../../core";

export const mellowLrtPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::MELLOW_LRT",
  version: 310,
  constructorParams: [
    {
      label: "priceStore",
      type: { type: "owner" },
    },
    {
      label: "lowerbound",
      type: {
        type: "lowerbound",
        getter: async (
          values: Record<string, InputValueParams>,
          publicClient: PublicClient,
        ) => {
          const { vault } = values;

          const stack = await publicClient.readContract({
            abi: [
              {
                type: "function",
                inputs: [],
                name: "calculateStack",
                outputs: [
                  {
                    name: "s",
                    internalType: "struct IMellowVault.ProcessWithdrawalsStack",
                    type: "tuple",
                    components: [
                      {
                        name: "tokens",
                        internalType: "address[]",
                        type: "address[]",
                      },
                      {
                        name: "ratiosX96",
                        internalType: "uint128[]",
                        type: "uint128[]",
                      },
                      {
                        name: "erc20Balances",
                        internalType: "uint256[]",
                        type: "uint256[]",
                      },
                      {
                        name: "totalSupply",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "totalValue",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "ratiosX96Value",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "timestamp",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "feeD9",
                        internalType: "uint256",
                        type: "uint256",
                      },
                      {
                        name: "tokensHash",
                        internalType: "bytes32",
                        type: "bytes32",
                      },
                    ],
                  },
                ],
                stateMutability: "view",
              },
            ],
            address: vault as Address,
            functionName: "calculateStack",
          });

          return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
        },
      },
    },
    {
      label: "vault",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
  ],
  stalenessPeriod: false,
};
