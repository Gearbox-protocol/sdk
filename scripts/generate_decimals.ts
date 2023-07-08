import { ethers } from "ethers";
import * as fs from "fs";

import {
  IERC20Metadata__factory,
  SupportedToken,
  supportedTokens,
  tokenDataByNetwork,
} from "../src";

async function generateTokens() {
  const deployer = await ethers.providers.getDefaultProvider();

  const tokenList: Array<string> = [];
  for (let token of Object.keys(supportedTokens)) {
    const address = tokenDataByNetwork.Mainnet[token as SupportedToken];
    const decimals = await IERC20Metadata__factory.connect(
      address,
      deployer,
    ).decimals();
    tokenList.push(`"${token}": ${decimals.toString()}`);
  }

  const file = `import { SupportedToken } from "./token";

  export const decimals: Record<SupportedToken, number> = {
    ${tokenList.join(",\n")}
   } `;

  fs.writeFileSync("./decimals.ts", file);
}

generateTokens()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
