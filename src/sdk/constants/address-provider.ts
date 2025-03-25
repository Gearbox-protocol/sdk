import type { Address } from "viem";

import type { NetworkType } from "../chain/index.js";
import { NOT_DEPLOYED } from "./addresses.js";

export const NO_VERSION = 0;

export const AP_ACCOUNT_FACTORY = "ACCOUNT_FACTORY";
export const AP_ACL = "ACL";
export const AP_ADAPTER_COMPRESSOR = "ADAPTER_COMPRESSOR";
export const AP_BOT_LIST = "BOT_LIST";
export const AP_BYTECODE_REPOSITORY = "BYTECODE_REPOSITORY";
export const AP_CONTRACTS_REGISTER = "CONTRACTS_REGISTER";
export const AP_CONTROLLER_TIMELOCK = "CONTROLLER_TIMELOCK";
export const AP_CREDIT_ACCOUNT_COMPRESSOR = "CREDIT_ACCOUNT_COMPRESSOR";
export const AP_CREDIT_SUITE_COMPRESSOR = "CREDIT_SUITE_COMPRESSOR";
export const AP_DATA_COMPRESSOR = "DATA_COMPRESSOR";
export const AP_DELEVERAGE_BOT_HV = "DELEVERAGE_BOT_HV";
export const AP_DELEVERAGE_BOT_LV = "DELEVERAGE_BOT_LV";
export const AP_DELEVERAGE_BOT_PEGGED = "DELEVERAGE_BOT_PEGGED";
export const AP_GAUGE_COMPRESSOR = "GAUGE_COMPRESSOR";
export const AP_GEAR_STAKING = "GEAR_STAKING";
export const AP_GEAR_TOKEN = "GEAR_TOKEN";
export const AP_INFLATION_ATTACK_BLOCKER = "INFLATION_ATTACK_BLOCKER";
export const AP_INSOLVENCY_CHECKER = "INSOLVENCY_CHECKER";
export const AP_MARKET_COMPRESSOR = "MARKET_COMPRESSOR";
export const AP_MARKET_CONFIGURATOR = "MARKET_CONFIGURATOR";
export const AP_PARTIAL_LIQUIDATION_BOT = "PARTIAL_LIQUIDATION_BOT";
export const AP_PERIPHERY_COMPRESSOR = "PERIPHERY_COMPRESSOR";
export const AP_POOL_COMPRESSOR = "POOL_COMPRESSOR";
export const AP_PRICE_FEED_COMPRESSOR = "PRICE_FEED_COMPRESSOR";
export const AP_PRICE_ORACLE = "PRICE_ORACLE";
export const AP_REWARDS_COMPRESSOR = "REWARDS_COMPRESSOR";
export const AP_ROUTER = "LOCAL::ROUTER";
export const AP_TOKEN_COMPRESSOR = "TOKEN_COMPRESSOR";
export const AP_TREASURY = "TREASURY";
export const AP_WETH_GATEWAY = "WETH_GATEWAY";
export const AP_WETH_TOKEN = "WETH_TOKEN";
export const AP_ZAPPER_REGISTER = "ZAPPER_REGISTER";
export const AP_ZERO_PRICE_FEED = "ZERO_PRICE_FEED";

export const ADDRESS_PROVIDER: Record<NetworkType, Address> = {
  Mainnet: "0x9ea7b04Da02a5373317D745c1571c84aaD03321D",
  Arbitrum: "0x7d04eCdb892Ae074f03B5D0aBA03796F90F3F2af",
  Optimism: "0x3761ca4BFAcFCFFc1B8034e69F19116dD6756726",
  Base: NOT_DEPLOYED,
  Sonic: "0x4b27b296273B72d7c7bfee1ACE93DC081467C41B",
  // New networks
  MegaETH: NOT_DEPLOYED,
  Monad: NOT_DEPLOYED,
  Berachain: NOT_DEPLOYED,
  Avalanche: NOT_DEPLOYED,
};

export const ADDRESS_PROVIDER_V310 =
  "0xBaB2014Dd88223E168bA06911c06df638311a097";
