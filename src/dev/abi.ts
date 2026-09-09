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

export const iFaucetAbi = [
  {
    type: "function",
    name: "assets",
    inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claim",
    inputs: [{ name: "amountUSD", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claim",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claim",
    inputs: [
      {
        name: "claims",
        type: "tuple[]",
        internalType: "struct TokenClaim[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimOnBehalfOf",
    inputs: [
      { name: "receiver", type: "address", internalType: "address" },
      {
        name: "claims",
        type: "tuple[]",
        internalType: "struct TokenClaim[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimOnBehalfOf",
    inputs: [
      { name: "receiver", type: "address", internalType: "address" },
      { name: "amountUSD", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimOnBehalfOf",
    inputs: [{ name: "receiver", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "configure",
    inputs: [
      { name: "minAmountUSD", type: "uint256", internalType: "uint256" },
      {
        name: "tokens",
        type: "tuple[]",
        internalType: "struct FaucetToken[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "price", type: "uint256", internalType: "uint256" },
          { name: "decimals", type: "uint8", internalType: "uint8" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAssets",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimed",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minAmountUSD",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "prices",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "scales",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;

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
