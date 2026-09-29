import { type Address, decodeAbiParameters, type Hex, hexToString } from "viem";
import type { MarketSuite } from "../../../../onchain/index.js";
import type { AccessMode } from "../../../index.js";
import type { AliasLossPolicyState } from "../../plugins/loss-policies/alias/index.js";
import type { LossPolicyState } from "../../plugins/loss-policies/logic.js";

/**
 * Structure representing price feed parameters
 */
interface PriceFeedParams {
  priceFeed: string;
  stalenessPeriod: number;
  skipCheck: boolean;
  tokenDecimals: number;
}

/**
 * Interface for the decoded AliasedLossPolicy data
 */
interface DecodedAliasedLossPolicy {
  accessMode: AccessMode;
  checksEnabled: boolean;
  tokens: string[];
  priceFeedParams: PriceFeedParams[];
}

/**
 * Builds loss policy state
 */
export async function buildLossPolicyState(
  marketSuite: MarketSuite,
): Promise<LossPolicyState> {
  const lossPolicyTypeBytes32 =
    marketSuite.state.lossPolicy.baseParams.contractType;
  const lossPolicyType = hexToString(lossPolicyTypeBytes32).replace(
    /[^a-zA-Z:_]/g,
    "",
  );
  const lossPolicyState =
    marketSuite.state.lossPolicy.baseParams.serializedParams;

  switch (lossPolicyType) {
    case "LOSS_POLICY::ALIASED":
      return decodeAliasLossPolicyState(lossPolicyState);
    // case "LOSS_POLICY::DEFAULT":
    //   return decodeDefaultLossPolicyState(lossPolicyState);
  }

  return {} as LossPolicyState;
}

function decodeAliasLossPolicyState(
  lossPolicyState: Hex,
): AliasLossPolicyState {
  const decodedData = decodeAliasedLossPolicySerialize(lossPolicyState);

  // Convert array of objects to a single Record object
  const aliases = decodedData.tokens.reduce(
    (acc, token, i) => {
      acc[token.toLowerCase() as Address] = decodedData.priceFeedParams[i]
        .priceFeed as Address;
      return acc;
    },
    {} as Record<Address, Address>,
  );

  return {
    aliases,
    type: "ALIAS",
    mode: decodedData.accessMode,
    enabled: decodedData.checksEnabled,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeDefaultLossPolicyState(lossPolicyState: string) {
  return {
    type: "DEFAULT",
    enabled: true,
  };
}

/**
 * Decodes the serialized output from AliasedLossPolicyV3.serialize() function
 *
 * @param data - The serialized data as a hex string returned from the AliasedLossPolicyV3.serialize() function
 * @returns A decoded object containing the AliasedLossPolicy state
 */
export function decodeAliasedLossPolicySerialize(
  serializedData: Hex,
): DecodedAliasedLossPolicy {
  // Define the ABI structure for decoding
  const decoded = decodeAbiParameters(
    [
      { name: "accessMode", type: "uint8" },
      { name: "checksEnabled", type: "bool" },
      { name: "tokens", type: "address[]" },
      {
        name: "priceFeedParams",
        type: "tuple[]",
        components: [
          { name: "priceFeed", type: "address" },
          { name: "stalenessPeriod", type: "uint32" },
          { name: "skipCheck", type: "bool" },
          { name: "tokenDecimals", type: "uint8" },
        ],
      },
    ],
    serializedData,
  );

  // Extract and format values
  const [accessModeRaw, checksEnabled, tokens, priceFeedParamsRaw] = decoded;

  // Convert raw price feed params to structured format
  const priceFeedParams: PriceFeedParams[] = priceFeedParamsRaw.map(param => ({
    priceFeed: param.priceFeed,
    stalenessPeriod: Number(param.stalenessPeriod),
    skipCheck: param.skipCheck,
    tokenDecimals: Number(param.tokenDecimals),
  }));

  return {
    accessMode: Number(accessModeRaw) as AccessMode,
    checksEnabled,
    tokens: tokens.map(token => token.toLowerCase() as Address),
    priceFeedParams,
  };
}
