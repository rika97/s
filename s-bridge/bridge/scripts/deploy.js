const { ethers } = require("hardhat");

async function main() {
  const [owner, trustedSigner] = await ethers.getSigners();
  console.log("Owner addres:", owner.address);
  console.log("Trusted Signer addres:", trustedSigner.address);

  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(trustedSigner.address);
  await bridge.waitForDeployment();

  console.log("Bridge address:", await bridge.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })