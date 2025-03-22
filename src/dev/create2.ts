import type {
  Account,
  Address,
  Chain,
  Client,
  Hex,
  SendTransactionParameters,
  SendTransactionReturnType,
  Transport,
  UnionOmit,
} from "viem";
import { getCreate2Address, stringToHex } from "viem";
import { sendTransaction } from "viem/actions";

export const PUBLIC_CREATE2_FACTORY: Address =
  "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export type Create2Parameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
> = UnionOmit<
  SendTransactionParameters<chain, account, chainOverride>,
  "chain" | "to" | "data"
> & {
  /**
   * The contract bytecode to deploy
   */
  bytecode: Hex;
  /**
   * Salt for the CREATE2 deployment (will be padded to 32 bytes)
   */
  salt: string;
};

/**
 * Viem action that deploys a contract using the public CREATE2 factory
 */
export async function deployUsingPublicCreate2<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  walletClient: Client<Transport, chain, account>,
  parameters: Create2Parameters<chain, account, chainOverride>,
): Promise<SendTransactionReturnType> {
  const { bytecode, salt, ...request } = parameters;
  const data = `${stringToHex(salt, { size: 32 })}${bytecode.replace(
    "0x",
    "",
  )}` as Hex;

  // Send the deployment transaction
  return sendTransaction(walletClient, {
    to: PUBLIC_CREATE2_FACTORY,
    data,
    ...request,
  } as unknown as SendTransactionParameters<chain, account, chainOverride>);
}

/**
 * Get the address of a contract deployed using the public CREATE2 factory
 * @param salt - Salt for the CREATE2 deployment (will be padded to 32 bytes)
 * @param bytecode - The contract bytecode to deploy
 * @returns Address of the deployed contract
 */
export async function getCreate2AddressPublicFactory(
  salt: string,
  bytecode: Hex,
): Promise<Address> {
  return getCreate2Address({
    from: PUBLIC_CREATE2_FACTORY,
    salt: stringToHex(salt, { size: 32 }),
    bytecode: bytecode as Hex,
  });
}
