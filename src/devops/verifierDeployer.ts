/*
 * Copyright (c) 2021. Gearbox
 */
import { LoggedDeployer } from "./loggedDeployer";
import * as fs from "fs";
import { config as dotEnvConfig } from "dotenv";
import axios from "axios";
import path from "path";
import hre from 'hardhat';


const VERIFIER_FILE = path.join(process.cwd(), './.verifier.json');

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
    this.verifier = require(VERIFIER_FILE);
    
    this.apiKey = process.env.ETHERSCAN_API_KEY || "";
    if (this.apiKey === "") throw new Error("No etherscan API provided");
  }

  addContract(c: VerifyRequest) {

    // Add logic to check if address is already exists
    // Overwriting info for now
    let exisitingIndex = -1;
    this.verifier.filter((request, index) => {
      if(request.address == c.address){
        exisitingIndex = index
        return [request]
      }else{
        return []
      }
    },[]);

    if(exisitingIndex > -1){
      this.verifier[exisitingIndex] = c
    }else{
      this.verifier.push(c);
    }

    this._saveVerifier();
  }

  baseUrl(networkName: string) : String {
    switch(networkName){
      case 'mainnet':
        return "https://api.etherscan.io";
      case 'kovan':
        return "https://api-kovan.etherscan.io";
      default:
        return "https://api.etherscan.io";
    }
  }
  

  async isVerified(address: string | undefined) : Promise<boolean> {

    const networkName = await hre.network.name
    const url = `${this.baseUrl(networkName)}/api?module=contract&action=getabi&address=${address}&apikey=${this.apiKey}`;
    const isVerified = await axios.get(url);
    return isVerified.data && isVerified.data.status === '1';
  } 

  async deploy() {
    this.enableLogs();

    for (let i = 0; i < this.verifier.length; i++) {
      const params = this.verifier.shift();

      const isVerified = await this.isVerified(params?.address);

      if (isVerified) {
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
