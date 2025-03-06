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
