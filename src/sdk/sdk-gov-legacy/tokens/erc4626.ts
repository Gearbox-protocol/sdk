import type { ERC4626VaultContract, MellowVaultContract } from "../contracts";
import type { CurveLPToken } from "./curveLP";
import type { NormalToken } from "./normal";
import type { TokenBase } from "./token";
import type { TokenNetwork } from "./tokenType";
import { TokenType } from "./tokenType";

export type ERC4626LPToken =
  | "sDAI"
  | "YieldETH"
  | "sUSDe"
  | "sUSDS"
  | "scrvUSD"
  | "tETH"
  // Mellow LRTs
  | "steakLRT"
  | "Re7LRT"
  | "amphrETH"
  | "rstETH"
  | "pzETH"
  | "DVstETH";

export type ERC4626VaultTokenData = {
  symbol: ERC4626LPToken;
  type: Partial<Record<TokenNetwork, TokenType.ERC4626_VAULT_TOKEN>>;
  underlying: NormalToken;
  vault: ERC4626VaultContract;
} & TokenBase;

export type ERC4626VaultOfCurveLPTokenData = {
  symbol: ERC4626LPToken;
  type: Partial<Record<TokenNetwork, TokenType.ERC4626_VAULT_TOKEN>>;
  underlying: CurveLPToken;
  vault: ERC4626VaultContract;
} & TokenBase;

export type ERC4626VaultOfMellowLRTTokenData = {
  symbol: ERC4626LPToken;
  type: Partial<Record<TokenNetwork, TokenType.ERC4626_VAULT_TOKEN>>;
  underlying: NormalToken;
  vault: MellowVaultContract;
} & TokenBase;

export const erc4626Tokens: Record<
  ERC4626LPToken,
  | ERC4626VaultTokenData
  | ERC4626VaultOfCurveLPTokenData
  | ERC4626VaultOfMellowLRTTokenData
> = {
  // YEARN TOKENS
  sDAI: {
    name: "Maker DSR",
    symbol: "sDAI",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "DAI",
    vault: "MAKER_DSR_VAULT",
  },

  YieldETH: {
    name: "Sommelier ETH Vault",
    symbol: "YieldETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "WETH",
    vault: "YIELD_ETH_VAULT",
  },

  sUSDe: {
    name: "Staked USDe",
    symbol: "sUSDe",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "USDe",
    vault: "STAKED_USDE_VAULT",
  },

  sUSDS: {
    name: "Staked USDS",
    symbol: "sUSDS",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "USDS",
    vault: "STAKED_USDS_VAULT",
  },
  scrvUSD: {
    name: "Savings crvUSD",
    symbol: "scrvUSD",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "crvUSD",
    vault: "SAVINGS_CRVUSD_VAULT",
  },
  tETH: {
    name: "Treehouse ETH",
    symbol: "tETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "TREEHOUSE_ETH_VAULT",
  },

  // Mellow
  steakLRT: {
    name: "Steakhouse Mellow LRT",
    symbol: "steakLRT",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_STEAKHOUSE_VAULT",
  },
  Re7LRT: {
    name: "Re7 Mellow LRT",
    symbol: "Re7LRT",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_RE7_LABS_VAULT",
  },
  amphrETH: {
    name: "Mev Capital Mellow LRT",
    symbol: "amphrETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_AMPHOR_VAULT",
  },
  rstETH: {
    name: "P2P Mellow LRT",
    symbol: "rstETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_RESTAKING_VAULT",
  },
  pzETH: {
    name: "Renzo Mellow LST",
    symbol: "pzETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_RENZO_VAULT",
  },
  DVstETH: {
    name: "Decentralized Validator Token",
    symbol: "DVstETH",
    type: { AllNetworks: TokenType.ERC4626_VAULT_TOKEN },
    underlying: "wstETH",
    vault: "MELLOW_DECENTALIZED_VALIDATOR_VAULT",
  },
};

export const isERC4626LPToken = (t: unknown): t is ERC4626LPToken =>
  typeof t === "string" && !!erc4626Tokens[t as ERC4626LPToken];
