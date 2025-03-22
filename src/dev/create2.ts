import type { Abi } from "abitype";
import type {
  Account,
  Address,
  Chain,
  Client,
  ContractConstructorArgs,
  GetChainParameter,
  Hex,
  SendTransactionParameters,
  SendTransactionReturnType,
  Transport,
  UnionEvaluate,
  UnionOmit,
} from "viem";
import {
  concatHex,
  encodeDeployData,
  getCreate2Address,
  stringToHex,
} from "viem";
import { getCode, sendTransaction } from "viem/actions";

export const PUBLIC_CREATE2_FACTORY: Address =
  "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export const DEFAULT_CREATE2_SALT = "GEARBOX";

export type Create2Parameters<
  abi extends Abi | readonly unknown[] = Abi,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  allArgs = ContractConstructorArgs<abi>,
> = UnionOmit<
  SendTransactionParameters<chain, account, chainOverride>,
  "accessList" | "chain" | "to" | "data"
> &
  GetChainParameter<chain, chainOverride> &
  UnionEvaluate<
    readonly [] extends allArgs
      ? { args?: allArgs | undefined }
      : { args: allArgs }
  > & {
    abi: abi;
    /**
     * The contract bytecode to deploy
     */
    bytecode: Hex;
    /**
     * Salt for the CREATE2 deployment (will be padded to 32 bytes)
     * Default to "GEARBOX"
     */
    salt?: string;
  };

/**
 * Viem action that deploys a contract using the public CREATE2 factory
 */
export async function deployUsingPublicCreate2<
  const abi extends Abi | readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  walletClient: Client<Transport, chain, account>,
  parameters: Create2Parameters<abi, chain, account, chainOverride>,
): Promise<SendTransactionReturnType> {
  const {
    abi,
    args,
    bytecode,
    salt = DEFAULT_CREATE2_SALT,
    ...request
  } = parameters as Create2Parameters;

  const calldata = encodeDeployData({ abi, bytecode, args });
  const saltHex = stringToHex(salt, { size: 32 });
  const data = concatHex([saltHex, calldata]);

  // Send the deployment transaction
  return sendTransaction(walletClient, {
    to: PUBLIC_CREATE2_FACTORY,
    data,
    ...request,
  } as unknown as SendTransactionParameters<chain, account, chainOverride>);
}

export type GetCreate2AddressParameters<
  abi extends Abi | readonly unknown[] = Abi,
  ///
  allArgs = ContractConstructorArgs<abi>,
> = UnionEvaluate<
  readonly [] extends allArgs
    ? { args?: allArgs | undefined }
    : { args: allArgs }
> & {
  abi: abi;
  /**
   * The contract bytecode to deploy
   */
  bytecode: Hex;
  /**
   * Salt for the CREATE2 deployment (will be padded to 32 bytes)
   * Default to "GEARBOX"
   */
  salt?: string;
};

/**
 * Get the address of a contract deployed using the public CREATE2 factory
 * @param salt - Salt for the CREATE2 deployment (will be padded to 32 bytes)
 * @param bytecode - The contract bytecode to deploy
 * @returns Address of the deployed contract
 */
export function getPublicCreate2Address<
  const abi extends Abi | readonly unknown[],
>(params: GetCreate2AddressParameters<abi>): Address {
  const {
    abi,
    args,
    bytecode,
    salt = DEFAULT_CREATE2_SALT,
  } = params as GetCreate2AddressParameters;

  const deployBytecode = encodeDeployData({ abi, bytecode, args });
  const saltHex = stringToHex(salt, { size: 32 });

  return getCreate2Address({
    from: PUBLIC_CREATE2_FACTORY,
    salt: saltHex,
    bytecode: deployBytecode,
  });
}

/**
 * Viem action that checks if contract is deployed using the public CREATE2 factory
 */
export async function isDeployedUsingPublicCreate2<
  const abi extends Abi | readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  params: GetCreate2AddressParameters<abi>,
): Promise<boolean> {
  const address = getPublicCreate2Address(params);
  const code = await getCode(client, { address });
  return code !== "0x";
}
