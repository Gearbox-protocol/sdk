/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICreditManagerV3,
  ICreditManagerV3Interface,
} from "../../ICreditManagerV3.sol/ICreditManagerV3";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newConfigurator",
        type: "address",
      },
    ],
    name: "SetCreditConfigurator",
    type: "event",
  },
  {
    inputs: [],
    name: "accountFactory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
    ],
    name: "adapterToContract",
    outputs: [
      {
        internalType: "address",
        name: "targetContract",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "addCollateral",
    outputs: [
      {
        internalType: "uint256",
        name: "tokensToEnable",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "addressProvider",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approveToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "enum CollateralCalcTask",
        name: "task",
        type: "uint8",
      },
    ],
    name: "calcDebtAndCollateral",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "debt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulativeIndexNow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulativeIndexLastUpdate",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "cumulativeQuotaInterest",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "accruedInterest",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accruedFees",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDebtUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalValueUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "twvUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "enabledTokensMask",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quotedTokensMask",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "quotedTokens",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "_poolQuotaKeeper",
            type: "address",
          },
        ],
        internalType: "struct CollateralDebtData",
        name: "cdd",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "closeCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenMask",
        type: "uint256",
      },
    ],
    name: "collateralTokenByMask",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "liquidationThreshold",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "collateralTokensCount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetContract",
        type: "address",
      },
    ],
    name: "contractToAdapter",
    outputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "creditAccountInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "debt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cumulativeIndexLastUpdate",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "cumulativeQuotaInterest",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "quotaFees",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "enabledTokensMask",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "flags",
        type: "uint16",
      },
      {
        internalType: "uint64",
        name: "lastDebtUpdate",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "creditAccounts",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creditAccounts",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creditAccountsLen",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creditConfigurator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creditFacade",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "enabledTokensMaskOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "callData",
        type: "bytes",
      },
    ],
    name: "externalCall",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "fees",
    outputs: [
      {
        internalType: "uint16",
        name: "feeInterest",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "feeLiquidation",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "liquidationDiscount",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "feeLiquidationExpired",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "liquidationDiscountExpired",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "flagsOf",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "enabledTokensMask",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "collateralHints",
        type: "uint256[]",
      },
      {
        internalType: "uint16",
        name: "minHealthFactor",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "useSafePrices",
        type: "bool",
      },
    ],
    name: "fullCollateralCheck",
    outputs: [
      {
        internalType: "uint256",
        name: "enabledTokensMaskAfter",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveCreditAccountOrRevert",
    outputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "getBorrowerOrRevert",
    outputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenMask",
        type: "uint256",
      },
    ],
    name: "getTokenByMask",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getTokenMaskOrRevert",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenMask",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "minHealthFactor",
        type: "uint16",
      },
    ],
    name: "isLiquidatable",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "debt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulativeIndexNow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulativeIndexLastUpdate",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "cumulativeQuotaInterest",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "accruedInterest",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accruedFees",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDebtUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalValueUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "twvUSD",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "enabledTokensMask",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quotedTokensMask",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "quotedTokens",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "_poolQuotaKeeper",
            type: "address",
          },
        ],
        internalType: "struct CollateralDebtData",
        name: "collateralDebtData",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isExpired",
        type: "bool",
      },
    ],
    name: "liquidateCreditAccount",
    outputs: [
      {
        internalType: "uint256",
        name: "remainingFunds",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loss",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "liquidationThresholds",
    outputs: [
      {
        internalType: "uint16",
        name: "lt",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "ltParams",
    outputs: [
      {
        internalType: "uint16",
        name: "ltInitial",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ltFinal",
        type: "uint16",
      },
      {
        internalType: "uint40",
        name: "timestampRampStart",
        type: "uint40",
      },
      {
        internalType: "uint24",
        name: "rampDuration",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "enabledTokensMask",
        type: "uint256",
      },
      {
        internalType: "enum ManageDebtAction",
        name: "action",
        type: "uint8",
      },
    ],
    name: "manageDebt",
    outputs: [
      {
        internalType: "uint256",
        name: "newDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokensToEnable",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokensToDisable",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "maxEnabledTokens",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
    ],
    name: "openCreditAccount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolQuotaKeeper",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceOracle",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quotedTokensMask",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
        ],
        internalType: "struct RevocationPair[]",
        name: "revocations",
        type: "tuple[]",
      },
    ],
    name: "revokeAdapterAllowances",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
    ],
    name: "setActiveCreditAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "ltInitial",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ltFinal",
        type: "uint16",
      },
      {
        internalType: "uint40",
        name: "timestampRampStart",
        type: "uint40",
      },
      {
        internalType: "uint24",
        name: "rampDuration",
        type: "uint24",
      },
    ],
    name: "setCollateralTokenData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
      {
        internalType: "address",
        name: "targetContract",
        type: "address",
      },
    ],
    name: "setContractAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditConfigurator",
        type: "address",
      },
    ],
    name: "setCreditConfigurator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditFacade",
        type: "address",
      },
    ],
    name: "setCreditFacade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "feeInterest",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "feeLiquidation",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "liquidationDiscount",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "feeLiquidationExpired",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "liquidationDiscountExpired",
        type: "uint16",
      },
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "flag",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "value",
        type: "bool",
      },
    ],
    name: "setFlagFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "maxEnabledTokens",
        type: "uint8",
      },
    ],
    name: "setMaxEnabledTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "priceOracle",
        type: "address",
      },
    ],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quotedTokensMask",
        type: "uint256",
      },
    ],
    name: "setQuotedMask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "int96",
        name: "quotaChange",
        type: "int96",
      },
      {
        internalType: "uint96",
        name: "minQuota",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "maxQuota",
        type: "uint96",
      },
    ],
    name: "updateQuota",
    outputs: [
      {
        internalType: "uint256",
        name: "tokensToEnable",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokensToDisable",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "weth",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creditAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "withdrawCollateral",
    outputs: [
      {
        internalType: "uint256",
        name: "tokensToDisable",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ICreditManagerV3__factory {
  static readonly abi = _abi;
  static createInterface(): ICreditManagerV3Interface {
    return new utils.Interface(_abi) as ICreditManagerV3Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICreditManagerV3 {
    return new Contract(address, _abi, signerOrProvider) as ICreditManagerV3;
  }
}
