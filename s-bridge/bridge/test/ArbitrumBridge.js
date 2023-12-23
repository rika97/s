const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArbitrumBridge contract", function () {
  async function deployArbitrumBridgeFixture() {
    const [owner, addr1, addr2, trustedSigner] = await ethers.getSigners();
    const ArbitrumBridge = await ethers.getContractFactory("ArbitrumBridge");
    const arbitrumBridge = await ArbitrumBridge.deploy(trustedSigner.address);
    await arbitrumBridge.waitForDeployment();

    // fund contract
    const setupAmount = ethers.parseUnits("100", "ether");
    const contractAddr = await arbitrumBridge.getAddress();
    await owner.sendTransaction({
      to: contractAddr,
      value: setupAmount,
    });

    return { arbitrumBridge, owner, addr1, addr2, trustedSigner };
  }

  async function createSignature(signer, types, values) {
    const msgHash = ethers.solidityPackedKeccak256(types, values);
    return await signer.signMessage(ethers.toBeArray(msgHash));
  } 

  describe("withdraw", function () {
    it("Should withdraw with valid signature", async function () {
      const { arbitrumBridge, addr1, trustedSigner } = await deployArbitrumBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(arbitrumBridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.changeEtherBalances([addr1, arbitrumBridge], [withdrawAmount, -withdrawAmount]);
    });

    it("Should revert for invalid signature", async function () {
      const { arbitrumBridge, owner, addr1 } = await deployArbitrumBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        owner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(arbitrumBridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.be.revertedWith("Invalid signature");
    })

    it("Should revert if withdraw amount exceeds contract liquidity", async function () {
      const { arbitrumBridge, addr1, trustedSigner } = await deployArbitrumBridgeFixture();

      const withdrawAmount = ethers.parseUnits("200", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(arbitrumBridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.be.revertedWith("Not enough liquidity");
    });

    it("Should emit Withdrawl event", async function () {
      const { arbitrumBridge, addr1, trustedSigner } = await deployArbitrumBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(arbitrumBridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.emit(arbitrumBridge, "Withdraw")
        .withArgs(addr1.address, withdrawAmount);
    });
  })
});