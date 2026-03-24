import { execSync } from "node:child_process";

export async function setup() {
  try {
    execSync("anvil --version", { stdio: "pipe" });
  } catch {
    throw new Error(
      "anvil binary not found. Install Foundry: https://book.getfoundry.sh/getting-started/installation",
    );
  }
}

export async function teardown() {}
