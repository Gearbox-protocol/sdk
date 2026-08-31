import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { NetworkType } from "../../../chain/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AddressMap, type AssetsMap } from "../../../utils/index.js";
import { iBalancerV3RouterAdapterAbi } from "../abi/adapters/index.js";
import { iBalancerV3RouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const BALANCER_V3_POOL_TOKENS: Partial<
  Record<NetworkType, AddressMap<Address[]>>
> = {
  Mainnet: new AddressMap([
    // adapter 0xD9c645386ea01763E1682AF6581642255Ce0ca90  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0x284B71049C9829530f8eaA5aE1c83661f88A8527  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0x34A38c4e9976DCA7a586F3FB92A5fEe0A54bFF8D  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0x72B7F316efDfb775615d69768359501f66E2E985  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0xa0Ac255a59e3C818cE62f67DdE6f464456773439  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0xC484516120F7500e32343D9b8b301ecF803c4120  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0x0f67397505073bE29a9C954F5b1b92eCA73F60D1  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    // adapter 0x2b58C433d4A6211ef51f3AA40856FD53Ab6c05b1  0x121edB0bADc036F5FC610D015EE14093C142313B [rstETH-Lido wstETH]
    [
      "0x121edB0bADc036F5FC610D015EE14093C142313B",
      [
        "0x775F661b0bD1739349b9A2A3EF60be277c5d2D29",
        "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
      ],
    ],
    // adapter 0xBD7cC91b03B1a5e1634a702bAcC47181cfb226d7  0x1ea5870f7C037930CE1d5d8d9317c670e89e13E3 [rETH-waEthWETH]
    // adapter 0x0214D10F4922C8407351c509150761E0bd487989  0x1ea5870f7C037930CE1d5d8d9317c670e89e13E3 [rETH-waEthWETH]
    [
      "0x1ea5870f7C037930CE1d5d8d9317c670e89e13E3",
      [
        "0x0bfc9d54Fc184518A81162F8fB99c2eACa081202",
        "0xae78736Cd615f374D3085123A210448E74Fc6393",
      ],
    ],
    // adapter 0xBD7cC91b03B1a5e1634a702bAcC47181cfb226d7  0x57c23c58B1D8C3292c15BEcF07c62C5c52457A42 [osETH-waWETH]
    // adapter 0x0214D10F4922C8407351c509150761E0bd487989  0x57c23c58B1D8C3292c15BEcF07c62C5c52457A42 [osETH-waWETH]
    [
      "0x57c23c58B1D8C3292c15BEcF07c62C5c52457A42",
      [
        "0x0bfc9d54Fc184518A81162F8fB99c2eACa081202",
        "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38",
      ],
    ],
    // adapter 0xFa99d251D99fd0b053a42BFE8c0a8035aF21902A  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x1657Aa213798d6285056FC0eaecCced50fAE8a49  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xBD7cC91b03B1a5e1634a702bAcC47181cfb226d7  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x7FB7d04759462cf0Cde035B5273fDA79d1E9003D  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xa0Ac255a59e3C818cE62f67DdE6f464456773439  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xC484516120F7500e32343D9b8b301ecF803c4120  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x03920C1Ef16e745038C6cc3DB028692833057039  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x38991F92e1585E14D808B3A92FbfB6387Dd41cdc  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xFe8a52b83503402726f6517E3681B8b7ad5d5D67  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xC4852c45f389dBfa1bF3d0B7c2820b1335E44A84  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x0f67397505073bE29a9C954F5b1b92eCA73F60D1  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x2b58C433d4A6211ef51f3AA40856FD53Ab6c05b1  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x0214D10F4922C8407351c509150761E0bd487989  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xA648B117bc1f1F20D732d7CB4669dA9863C360CA  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x7462081eE3089363793E98d63Eb2F0f195EAb0cA  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xC00Da8524EAaa829A12bEd92dD12A0B408ADe329  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0x23Fb6CD25a6028FAA8389FB3588B380CC05E6CF5  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    // adapter 0xB6B6AD5e6c821E51314c5Bca99700C4f395d57CA  0x6b31a94029fd7840d780191B6D63Fa0D269bd883 [Surge Fluid wstETH-wETH]
    [
      "0x6b31a94029fd7840d780191B6D63Fa0D269bd883",
      [
        "0x2411802D8BEA09be0aF8fD8D08314a63e706b29C",
        "0x90551c1795392094FE6D29B758EcCD233cFAa260",
      ],
    ],
    // adapter 0x293210c47FdD07d867919BD4Ac7c3F75D33C9372  0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D
    // adapter 0x14e9010e8D3d0371695a90F19d39112636d58d7f  0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D
    // adapter 0x048333b9B13b556a5Eba631150fF5c13cF1aB39e  0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D
    // adapter 0xCCb87B046CDbC65a2959E42C0A150a64E176c653  0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D
    // adapter 0xaA61F2B1AaF54da251Fb7825695E13D09E8E65aB  0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D
    [
      "0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D",
      [
        "0x7Bc3485026Ac48b6cf9BaF0A377477Fff5703Af8",
        "0xC71Ea051a5F82c67ADcF634c36FFE6334793D24C",
        "0xD4fa2D31b7968E448877f69A96DE69f5de8cD23E",
      ],
    ],
    // adapter 0xBD7cC91b03B1a5e1634a702bAcC47181cfb226d7  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    // adapter 0xa0Ac255a59e3C818cE62f67DdE6f464456773439  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    // adapter 0xC484516120F7500e32343D9b8b301ecF803c4120  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    // adapter 0x0f67397505073bE29a9C954F5b1b92eCA73F60D1  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    // adapter 0x2b58C433d4A6211ef51f3AA40856FD53Ab6c05b1  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    // adapter 0x0214D10F4922C8407351c509150761E0bd487989  0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37 [Surge tETH-Lido wstETH]
    [
      "0x9ED5175aeCB6653C1BDaa19793c16fd74fBeEB37",
      [
        "0x775F661b0bD1739349b9A2A3EF60be277c5d2D29",
        "0xD11c452fc99cF405034ee446803b6F6c1F6d5ED8",
      ],
    ],
    // adapter 0xBD7cC91b03B1a5e1634a702bAcC47181cfb226d7  0xc4Ce391d82D164c166dF9c8336DDF84206b2F812 [Aave Lido wETH-wstETH]
    // adapter 0xa0Ac255a59e3C818cE62f67DdE6f464456773439  0xc4Ce391d82D164c166dF9c8336DDF84206b2F812 [Aave Lido wETH-wstETH]
    // adapter 0xC484516120F7500e32343D9b8b301ecF803c4120  0xc4Ce391d82D164c166dF9c8336DDF84206b2F812 [Aave Lido wETH-wstETH]
    // adapter 0x0f67397505073bE29a9C954F5b1b92eCA73F60D1  0xc4Ce391d82D164c166dF9c8336DDF84206b2F812 [Aave Lido wETH-wstETH]
    // adapter 0x2b58C433d4A6211ef51f3AA40856FD53Ab6c05b1  0xc4Ce391d82D164c166dF9c8336DDF84206b2F812 [Aave Lido wETH-wstETH]
    [
      "0xc4Ce391d82D164c166dF9c8336DDF84206b2F812",
      [
        "0x0FE906e030a44eF24CA8c7dC7B7c53A6C4F00ce9",
        "0x775F661b0bD1739349b9A2A3EF60be277c5d2D29",
      ],
    ],
  ]),
  Plasma: new AddressMap([
    // adapter 0xf2Bf7C6204dCcA219d7e1DBc2b87571111DC863F  0x01E2C7fCde2B8D5d1413732c4e274Ba5B06B1E54
    // adapter 0x8E1526AE595e03B125db6d5c77F357610DbbB352  0x01E2C7fCde2B8D5d1413732c4e274Ba5B06B1E54
    [
      "0x01E2C7fCde2B8D5d1413732c4e274Ba5B06B1E54",
      [
        "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF",
        "0xE0126F0c4451B2B917064A93040fd4770D6774b5",
      ],
    ],
    // adapter 0x5AD15B4FC9Bf7a0581072D664A42dE70Ada77fbE  0x694c009aa31B3F80EE18C218B02390ca2D7151e7
    [
      "0x694c009aa31B3F80EE18C218B02390ca2D7151e7",
      [
        "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
        "0xE0126F0c4451B2B917064A93040fd4770D6774b5",
      ],
    ],
    // adapter 0x3A7132106e42B7828B1BFc27916D40c76Aa248eE  0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c
    // adapter 0xE3b3243436A0BF67D69AeEA2cDA9B1fbbE45B0E4  0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c
    // adapter 0x042e8e0e579f183B55f248127c18be7AEb8130c7  0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c
    // adapter 0xF1CaA06c9eb60e58933A7F60f56DfA1cC47CEa7c  0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c
    // adapter 0xA4c8A829A97c34c87A76082563375ec5C489D517  0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c
    [
      "0x6a74BE33B5393D8A3EbA4D69B78f9D9da947C48c",
      [
        "0xC63F1a8c0cD4493E18f6f3371182BE01Ce0BeF02",
        "0xE0126F0c4451B2B917064A93040fd4770D6774b5",
      ],
    ],
    // adapter 0xaf333968a175F5Fc585Cd4377e2FB7f3d53b99CC  0xB3Ca3ead1c59dEd552cD30a6992038284B418b65
    // adapter 0x2e1c2F2a78C649654a7f5Ea82715E95A0D01b5FC  0xB3Ca3ead1c59dEd552cD30a6992038284B418b65
    // adapter 0x390016Ab12DF5A5E7610A4a156b2cEE3D53dA6dC  0xB3Ca3ead1c59dEd552cD30a6992038284B418b65
    [
      "0xB3Ca3ead1c59dEd552cD30a6992038284B418b65",
      [
        "0x0B2b2B2076d95dda7817e785989fE353fe955ef9",
        "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
      ],
    ],
    // adapter 0xB51CFb9063c389fB3FFa2764D94AC35C6d8a59ae  0xD931775d9AcA9859c9fDc53C63ae32EF21551492
    [
      "0xD931775d9AcA9859c9fDc53C63ae32EF21551492",
      [
        "0x9c46EE1f01d2b551048F5fF99a4659D98d04BED1",
        "0xC8A8DF9B210243c55D31c73090F06787aD0A1Bf6",
      ],
    ],
    // adapter 0x940aEE338187Bbd9a4C5F90dF0BcB3f4863be38b  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    // adapter 0x08915d0c6730ECF2cA6015AF789D1E4C95EcF98A  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    // adapter 0x1E6964c3be60C69811fB07E114e41A38AB6C8B57  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    // adapter 0x9707a7E783a31F8aFE979c62E35d55D80b33564a  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    // adapter 0x45E2005fCE00f54B910f2cE456F20234c76C0756  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    // adapter 0x1839416C6565f315C87Fa624F6793F6E8608B30d  0xd9c4e277c93374a9f8C877a9D06707a88092E8F0
    [
      "0xd9c4e277c93374a9f8C877a9D06707a88092E8F0",
      [
        "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2",
        "0xE0126F0c4451B2B917064A93040fd4770D6774b5",
      ],
    ],
    // adapter 0xaacfC0966334A5414D2fc29B54f5fF7e61d6220B  0xDE0cfD933D2036d99048a04acF5Bacfb45492377
    [
      "0xDE0cfD933D2036d99048a04acF5Bacfb45492377",
      [
        "0x76309A9a56309104518847BbA321c261B7B4a43f",
        "0xA29420057F3e3B9512D4786df135Da1674BD74D4",
      ],
    ],
  ]),
};

export enum BalancerV3PoolStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  EXIT_AND_SWAP = 2,
  SWAP_ONLY = 3,
  EXIT_ONLY = 4,
}

export interface BalancerV3Pool {
  pool: Address;
  status?: BalancerV3PoolStatus;
}

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV3RouterAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPools?: BalancerV3Pool[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version <= 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address[]", name: "allowedPools" },
          ],
          args.baseParams.serializedParams,
        );
        this.#allowedPools = decoded[2].map(p => ({
          pool: p,
          status: BalancerV3PoolStatus.ALLOWED,
        }));
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPools",
              components: [
                { type: "address", name: "pool" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );
        this.#allowedPools = decoded[2].map(p => ({
          pool: p.pool,
          status: p.status as BalancerV3PoolStatus,
        }));
      }
    }
  }

  public get allowedPools(): BalancerV3Pool[] {
    if (!this.#allowedPools)
      throw new MissingSerializedParamsError("allowedPools");
    return this.#allowedPools;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedPools: this.#allowedPools?.map(p => ({
        pool: this.labelAddress(p.pool),
        status: p.status,
      })),
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "swapSingleTokenDiffIn": {
        const [, tokenIn, , leftoverAmount] = decoded.args;
        this.setLeftover(balances, tokenIn, leftoverAmount);
        break;
      }
      // BPT (pool token) is spent down to the leftover
      case "removeLiquiditySingleTokenDiff": {
        const [pool, leftoverAmount] = decoded.args;
        this.setLeftover(balances, pool, leftoverAmount);
        break;
      }
      case "addLiquidityUnbalancedDiff": {
        const [pool, leftoverAmounts] = decoded.args;
        // TODO: values are hardcoded until new version of the adapter which serializes them
        // will be audited and deployed
        const tokens = BALANCER_V3_POOL_TOKENS[this.networkType]?.get(pool);
        if (!tokens || tokens.length !== leftoverAmounts.length) {
          throw new Error(
            `previewBalanceChanges cannot resolve pool tokens for addLiquidityUnbalancedDiff on ${this.contractType} adapter at ${this.address} (pool ${pool})`,
          );
        }
        for (let i = 0; i < leftoverAmounts.length; i++) {
          this.setLeftover(balances, tokens[i], leftoverAmounts[i]);
        }
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
