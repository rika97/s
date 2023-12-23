const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const harmonyBridge = await ethers.deployContract("HarmonyBridge");
  console.log("HarmonyBridge address:", await harmonyBridge.getAddress());

  const arbitrumBridge = await ethers.deployContract("ArbitrumBridge");
  console.log("ArbitrumBridge address:", await arbitrumBridge.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })