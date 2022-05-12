/*
 * Copyright (c) 2021. Gearbox
 */
import { LoggedDeployer } from "./loggedDeployer";
import * as fs from "fs";
import { config as dotEnvConfig } from "dotenv";
import axios from "axios";
const hre = require("hardhat");

const VERIFIER_FILE = "./.verifier.json"

dotEnvConfig({ path: ".env" });

export interface VerifyRequest {
  address: string;
  constructorArguments: Array<any>;
}

export class Verifier extends LoggedDeployer {
  protected verifier: Array<VerifyRequest> = [];
  protected apiKey: string;

  constructor() {
    super();
    // this.verifier = verifierJson;
    // JSON.parse("")
    this.apiKey = process.env.ETHERSCAN_API_KEY || "";
    if (this.apiKey === "") throw new Error("No etherscan API provided");
  }

  addContract(c: VerifyRequest) {

    // Add logic to check if address is already exists
    this.verifier.push(c);
    this._saveVerifier();
  }

  

  async deploy() {
    this.enableLogs();

    for (let i = 0; i < this.verifier.length; i++) {
      const params = this.verifier.shift();

      const url = `https://api-kovan.etherscan.io/api?module=contract&action=getabi&address=${params?.address}&apikey=${this.apiKey}`;

      const isVerified = await axios.get(url);

      console.log(isVerified.data)

      if (isVerified.data.status === '1') {
        this._logger.debug(`${params?.address} is already verified`);
      } else {
        this._logger.info(`Verifing: ${params?.address}`);
        await hre.run("verify:verify", params);
      }

      this._saveVerifier();
    }
  }

  protected _saveVerifier() {
    fs.writeFileSync(VERIFIER_FILE, JSON.stringify(this.verifier));
    this._logger.debug("Deploy progress was saved into .verifier.json");
  }
}

// const verifier = new Verifier();

// verifier
//   .deploy()
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
