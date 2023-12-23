const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArbitrumBridge contract", function () {
  async function deployArbitrumBridgeFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ArbitrumBridge = await ethers.getContractFactory("ArbitrumBridge");
    const arbitrumBridge = await ArbitrumBridge.deploy();
    await arbitrumBridge.waitForDeployment();
    return { arbitrumBridge, owner, addr1, addr2 };
  }

  describe("Withrawl", function () {
    it("Should withdraw Ether to the caller", async function () {
      const { arbitrumBridge, owner, addr1 } = await deployArbitrumBridgeFixture();

      const setupAmount = ethers.parseUnits("100", "ether");
      const contractAddr = await arbitrumBridge.getAddress();
      await owner.sendTransaction({
        to: contractAddr,
        value: setupAmount,
      });
      
      const withdrawlAmount = ethers.parseUnits("10", "ether");
      await expect(() => arbitrumBridge.connect(addr1).withdraw(withdrawlAmount))
        .to.changeEtherBalances([arbitrumBridge, addr1], [-withdrawlAmount, withdrawlAmount]);
    })

    it("Should emit Withdrawl event", async function () {
      const { arbitrumBridge, owner, addr1 } = await deployArbitrumBridgeFixture();

      const setupAmount = ethers.parseUnits("100", "ether");
      const contractAddr = await arbitrumBridge.getAddress();
      await owner.sendTransaction({
        to: contractAddr,
        value: setupAmount,
      });

      const withdrawlAmount = ethers.parseUnits("10", "ether");
      await expect(arbitrumBridge.connect(addr1).withdraw(withdrawlAmount))
        .to.emit(arbitrumBridge, "Withdrawl")
        .withArgs(addr1.address, withdrawlAmount);
    })
  })
});