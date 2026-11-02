import {
  type Address,
  type Chain,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
  type Hex,
  type PublicClient,
  stringToHex,
  type TestClient,
  type TransactionReceipt,
  type Transport,
  type WalletActions,
  zeroHash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { iBytecodeRepositoryAbi } from "../../abi/310/iBytecodeRepository.js";
import {
  BytecodeRepositoryContract,
  KILL_SWITCH_PROXY,
  KILL_SWITCH_PROXY_MINOR_VERSION,
} from "../../permissionless/index.js";
import { GAS_LIMIT } from "../constants.js";

/**
 * Creation code of `KillSwitchProxyCall` from Gearbox-protocol/permissionless,
 * branch `kill-switch` @ 12fec54 (`contracts/helpers/KillSwitchProxy.sol`),
 * solc 0.8.23, optimizer 1000 runs, evm shanghai, bytecode_hash none.
 *
 * Only used on forks where bytecode repository does not allow kill switch proxy yet.
 */
// prettier-ignore
export const KILL_SWITCH_PROXY_INIT_CODE: Hex =
  "0x60c06040525f805460ff19169055348015610018575f80fd5b506040516106da3803806106da83398101604081905261003791610096565b6001600160a01b0380831660808190529082169003610069576040516301d6c35560e01b815260040160405180910390fd5b6001600160a01b031660a052506100c7565b80516001600160a01b0381168114610091575f80fd5b919050565b5f80604083850312156100a7575f80fd5b6100b08361007b565b91506100be6020840161007b565b90509250929050565b60805160a0516105e56100f55f395f818161014f015261017e01525f818160cd015261026d01526105e55ff3fe608060405234801561000f575f80fd5b506004361061007a575f3560e01c80638da5cb5b116100585780638da5cb5b146100c85780638fe8a10114610107578063cb2ef6f714610123578063fc9c8d391461014a575f80fd5b80632a31f6b41461007e57806341c0e1b5146100a757806354fd4d50146100b1575b5f80fd5b61009161008c3660046104d5565b610171565b60405161009e91906105ab565b60405180910390f35b6100af610262565b005b6100ba61013681565b60405190815260200161009e565b6100ef7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200161009e565b5f546101139060ff1681565b604051901515815260200161009e565b6100ba7f4b494c4c5f5357495443485f50524f585900000000000000000000000000000081565b6100ef7f000000000000000000000000000000000000000000000000000000000000000081565b6060336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101d5576040517f453974ec00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f5460ff1615610211576040517ffdf1ed5800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61025a83838080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250506001600160a01b03881692915050610300565b949350505050565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146102cb576040517f0cc479f90000000000000000000000000000000000000000000000000000000081523360048201526024015b60405180910390fd5b5f805460ff191660011781556040517f0f8eeedbc400fd6686703559f58d1e6143fdaed533f19a86c93d67a2fe4fb3319190a1565b606061034383835f6040518060400160405280601e81526020017f416464726573733a206c6f772d6c6576656c2063616c6c206661696c6564000081525061034a565b9392505050565b6060824710156103c25760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016102c2565b5f80866001600160a01b031685876040516103dd91906105bd565b5f6040518083038185875af1925050503d805f8114610417576040519150601f19603f3d011682016040523d82523d5f602084013e61041c565b606091505b509150915061042d87838387610438565b979650505050505050565b606083156104a65782515f0361049f576001600160a01b0385163b61049f5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016102c2565b508161025a565b61025a83838151156104bb5781518083602001fd5b8060405162461bcd60e51b81526004016102c291906105ab565b5f805f604084860312156104e7575f80fd5b83356001600160a01b03811681146104fd575f80fd5b9250602084013567ffffffffffffffff80821115610519575f80fd5b818601915086601f83011261052c575f80fd5b81358181111561053a575f80fd5b87602082850101111561054b575f80fd5b6020830194508093505050509250925092565b5f5b83811015610578578181015183820152602001610560565b50505f910152565b5f815180845261059781602086016020860161055e565b601f01601f19169290920160200192915050565b602081525f6103436020830184610580565b5f82516105ce81846020870161055e565b919091019291505056fea164736f6c6343000817000a";

// well-known anvil keys, signers of uploaded bytecode and its audit report
const AUTHOR = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
);
const AUDITOR = privateKeyToAccount(
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
);

export type ForkClient = TestClient<"anvil", Transport, Chain> &
  WalletActions<Chain>;

/**
 * Polls the receipt until the transaction is mined.
 *
 * `waitForTransactionReceipt` re-checks only when a new block arrives. On a fork,
 * anvil answers the receipt of a pending transaction by asking the fork RPC, so the
 * transaction can be mined while that request is in flight: the answer is `null`
 * for the block that already contains it, and automine produces no further block.
 */
export async function waitForMined(
  client: PublicClient<Transport, Chain>,
  hash: Hex,
  timeout = 60_000,
): Promise<TransactionReceipt> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const receipt = await client
      .getTransactionReceipt({ hash })
      .catch(() => undefined);
    if (receipt) {
      return receipt;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`transaction ${hash} was not mined in ${timeout}ms`);
}

/**
 * Makes bytecode repository on anvil fork allow kill switch proxy, the way governance would:
 * uploads its bytecode signed by a test author, audits it by a test auditor
 * added by impersonated repository owner, then allows it as system contract.
 *
 * Does nothing if some kill switch proxy bytecode is already allowed.
 */
export async function allowKillSwitchProxyOnFork(
  publicClient: PublicClient<Transport, Chain>,
  testClient: ForkClient,
  bytecodeRepository: Address,
): Promise<void> {
  const bcr = new BytecodeRepositoryContract(bytecodeRepository, publicClient);
  const allowed = await bcr.getAllowedBytecodeHash(
    KILL_SWITCH_PROXY,
    KILL_SWITCH_PROXY_MINOR_VERSION,
  );
  if (allowed !== zeroHash) {
    return;
  }

  const owner = await publicClient.readContract({
    address: bytecodeRepository,
    abi: iBytecodeRepositoryAbi,
    functionName: "owner",
  });
  for (const address of [owner, AUTHOR.address, AUDITOR.address]) {
    await testClient.setBalance({ address, value: 10n ** 18n });
  }
  await testClient.impersonateAccount({ address: owner });

  const send = async (account: Address | typeof AUTHOR, data: Hex) => {
    const hash = await testClient.sendTransaction({
      account,
      to: bytecodeRepository,
      data,
      gas: GAS_LIMIT,
    });
    const receipt = await waitForMined(publicClient, hash);
    if (receipt.status !== "success") {
      throw new Error(`BytecodeRepository tx ${hash} reverted`);
    }
  };
  const call = (
    params: Omit<
      EncodeFunctionDataParameters<typeof iBytecodeRepositoryAbi>,
      "abi"
    >,
  ): Hex =>
    encodeFunctionData({
      abi: iBytecodeRepositoryAbi,
      ...params,
    } as EncodeFunctionDataParameters<typeof iBytecodeRepositoryAbi>);

  await send(
    owner,
    call({ functionName: "addAuditor", args: [AUDITOR.address, "e2e"] }),
  );

  const bytecode = {
    contractType: stringToHex(KILL_SWITCH_PROXY, { size: 32 }),
    version: BigInt(KILL_SWITCH_PROXY_MINOR_VERSION),
    initCode: KILL_SWITCH_PROXY_INIT_CODE,
    author: AUTHOR.address,
    source:
      "https://github.com/Gearbox-protocol/permissionless/blob/12fec54/contracts/helpers/KillSwitchProxy.sol",
  };
  const authorSignature = await AUTHOR.signTypedData(
    bcr.computeEIP712AuthorDigest(bytecode),
  );
  // on mainnet, bytecode can only be uploaded by its author
  await send(
    AUTHOR,
    call({
      functionName: "uploadBytecode",
      args: [{ ...bytecode, authorSignature }],
    }),
  );

  const bytecodeHash = bcr.computeBytecodeHash(bytecode);
  const reportUrl = "https://example.com/e2e-audit";
  const auditorSignature = await AUDITOR.signTypedData(
    bcr.computeEIP712AuditorDigest(bytecodeHash, AUDITOR.address, reportUrl),
  );
  await send(
    AUDITOR,
    call({
      functionName: "submitAuditReport",
      args: [
        bytecodeHash,
        { auditor: AUDITOR.address, reportUrl, signature: auditorSignature },
      ],
    }),
  );

  await send(
    owner,
    call({ functionName: "allowSystemContract", args: [bytecodeHash] }),
  );
  await testClient.stopImpersonatingAccount({ address: owner });
}
