import { parseAbi } from "viem";

export const iaclTraitAbi = parseAbi([
  "function acl() external view returns (address)",
]);

export const iOwnableAbi = parseAbi([
  "function owner() external view returns (address)",
]);

export const iDegenNftv2Abi = parseAbi([
  "function minter() external view returns (address)",
  "function mint(address to, uint256 amount) external",
]);

export const faucetAbi = parseAbi([
  "function minAmountUSD() external view returns (uint256)",
  "function claim() external",
  "function claim(uint256 amountUSD) external",
  "function claim((address token, uint256 amount)[] claims) external",
]);

/**
 * This contract is deployed on testnets and contains testnet executionId and forkAlias
 */
export const iOnchainExecutionIdAbi = [
  {
    type: "function",
    name: "deployer",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "executionId",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "forkAlias",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "info",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ExecutionId.Info",
        components: [
          { name: "deployer", type: "string", internalType: "string" },
          { name: "executionId", type: "string", internalType: "string" },
          { name: "forkAlias", type: "string", internalType: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;
