import { FunctionFragment } from "ethers";

export interface IParser {
  parse: (calldata: string) => string;
  parseToObject?: (
    address: string,
    calldata: string,
  ) => {
    address: string;
    functionFragment: FunctionFragment;
    args: any;
  };
}
