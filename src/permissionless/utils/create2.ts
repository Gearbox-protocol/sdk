import { formatAbiItem } from "abitype";
import {
  type Address,
  getCreate2Address,
  type Hex,
  type PublicClient,
  stringToHex,
  type WalletClient,
} from "viem";
import type { ContractMethod, RawTx } from "../../sdk/types/index.js";

export const PUBLIC_CREATE2_FACTORY =
  "0x4e59b44847b379578588920ca78fbf26c0b4956c" as const;

export function handleSalt(salt: string | Hex): Hex {
  if (salt.slice(0, 2) !== "0x" || salt.length !== 66) {
    salt = stringToHex(salt, { size: 32 }) as Hex;
  }

  return salt as Hex;
}

/**
 * Deploys a contract using the public CREATE2 factory
 * @param sponsor - Wallet client for sending transactions
 * @param bytecode - The contract bytecode to deploy
 * @param salt - Salt for the CREATE2 deployment (will be padded to 32 bytes)
 * @returns Transaction hash of the deployment
 */
export async function deployUsingPublicCreate2(
  sponsor: WalletClient,
  bytecode: Hex,
  salt: string | Hex,
): Promise<Hex> {
  // Prepare the call data by concatenating the salt and bytecode
  const callData = `${handleSalt(salt)}${bytecode.replace("0x", "")}`;

  // Send the deployment transaction
  const hash = await sponsor.sendTransaction({
    to: PUBLIC_CREATE2_FACTORY,
    data: callData as Hex,
    account: sponsor.account!,
    chain: sponsor.chain,
  });

  return hash;
}

export async function getCreate2AddressPublicFactory(
  salt: string | Hex,
  bytecode: Hex,
): Promise<Address> {
  return getCreate2Address({
    from: PUBLIC_CREATE2_FACTORY,
    salt: handleSalt(salt),
    bytecode: bytecode as Hex,
  });
}

export function createCreate2DeployRawTx(
  bytecode: Hex,
  salt: string | Hex,
): RawTx {
  const callData = `${handleSalt(salt)}${bytecode.replace("0x", "")}`;

  const deterministicDeployerAbi = [
    {
      payable: true,
      stateMutability: "payable",
      type: "fallback",
    },
  ] as const;
  const signature = formatAbiItem(deterministicDeployerAbi[0]);

  const contractMethod: ContractMethod = {
    name: "fallback",
    inputs: [],
    payable: true,
  } as const;

  const rawTx = {
    to: PUBLIC_CREATE2_FACTORY,
    value: "0",
    signature: signature,
    callData: callData as Hex,
    contractMethod: contractMethod,
    contractInputsValues: {},
    description: "",
  };

  return rawTx;
}

export function getCreate2DeploymentAddress(
  bytecode: Hex,
  salt: string | Hex,
): Address {
  return getCreate2Address({
    from: PUBLIC_CREATE2_FACTORY,
    salt: handleSalt(salt),
    bytecode,
  });
}

export async function checkCreate2Deployment(
  client: PublicClient,
  bytecode: Hex,
  salt: string | Hex,
): Promise<boolean> {
  const address = getCreate2DeploymentAddress(bytecode, salt);
  const code = await client.getCode({ address });

  return code !== undefined;
}

export async function checkCreate2DeploymentAddress(
  client: PublicClient,
  bytecode: Hex,
  salt: string | Hex,
): Promise<[boolean, Address]> {
  const address = getCreate2DeploymentAddress(bytecode, salt);
  const code = await client.getCode({ address });

  if (code !== undefined) {
    return [true, address];
  }

  return [false, address];
}
