import {
  type Abi,
  type Address,
  encodeAbiParameters,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import {
  addressSchema,
  positiveNumberSchema,
} from "../../../core/validation.js";
import { erc4626AdapterPlugin } from "../erc4626/index.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";

export type Erc4626ReferralAdapterState = BaseAdapterState;

export interface Erc4626ReferralAdapterDeployParams {
  type: "ERC4626_VAULT_REFERRAL";
  version: 310;
  target: Address;
  referral: number;
}

export const erc4626ReferralDeployParamsSchema = z.object({
  type: z.literal("ERC4626_VAULT_REFERRAL"),
  version: z.literal(310),
  target: addressSchema,
  referral: positiveNumberSchema,
});

export const erc4626ReferralAdapterPlugin: AdapterPlugin = {
  name: "ERC4626 Referral",
  description: "Adapter for ERC4626 Vault with referral",
  getDefaultParams: () => ({
    type: "ERC4626_VAULT_REFERRAL",
    version: 310,
    target: zeroAddress,
    referral: 0,
  }),
  isEditable: true,
  getDeployState: (params: Erc4626ReferralAdapterDeployParams) => ({
    type: "ERC4626_VAULT_REFERRAL",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: Erc4626ReferralAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.referral],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<Erc4626ReferralAdapterDeployParams>,
  ): Promise<false | string> => {
    const validate = erc4626AdapterPlugin.validateParams;
    if (validate) {
      return await validate({
        ...args,
        params: {
          type: "ERC4626_VAULT",
          version: 312,
          target: args.params.target,
          gateway: zeroAddress,
        },
      });
    }
    return false;
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): Erc4626ReferralAdapterState => {
    return {
      type: "ERC4626_VAULT_REFERRAL",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
