import type {
  Chain,
  Client,
  ContractFunctionParameters,
  Transport,
} from "viem";
import type { IPriceUpdateTx } from "../../types/index.js";
import { simulateWithPriceUpdates } from "./simulateWithPriceUpdates.js";

export interface DelegatedMulticall {
  call: ContractFunctionParameters;
  onResult: (resp: unknown) => void;
}

export async function executeDelegatedMulticalls(
  client: Client<Transport, Chain>,
  multicalls: DelegatedMulticall[],
  opts: { priceUpdates: IPriceUpdateTx[]; blockNumber: bigint; gas?: bigint },
): Promise<void> {
  if (!multicalls.length) return;
  const results = await simulateWithPriceUpdates(client, {
    ...opts,
    contracts: multicalls.map(d => d.call) as any,
  });
  for (let i = 0; i < multicalls.length; i++) {
    multicalls[i].onResult(results[i]);
  }
}
