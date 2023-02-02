import { AdapterInterface } from "../contracts/adapters";
import { SupportedContract } from "../contracts/contracts";

export interface BaseAdapter {
  name: string;
  adapterInterface: AdapterInterface;
  contractAddress: string;
  adapterAddress: string;
  contractSymbol: SupportedContract;
  creditManager: string;
}
