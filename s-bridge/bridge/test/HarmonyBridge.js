const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HarmonyBridge contract", function () {
  async function deployHarmonyBridgeFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const HarmonyBridge = await ethers.getContractFactory("HarmonyBridge");
    const harmonyBridge = await HarmonyBridge.deploy();
    await harmonyBridge.waitForDeployment();
    return { harmonyBridge, owner, addr1, addr2 };
  }

  describe("deposit", function () {
    it("Should deposit Ether", async function () {
      const { harmonyBridge, addr1 } = await deployHarmonyBridgeFixture();

      const depositAmount = ethers.parseUnits("10", "ether");
      
      await expect(() => harmonyBridge.connect(addr1).deposit({ value: depositAmount }))
        .to.changeEtherBalances([addr1, harmonyBridge], [-depositAmount, depositAmount]);
    });

    it("Should emit Deposit event", async function () {
      const { harmonyBridge, addr1 } = await deployHarmonyBridgeFixture();
      const depositAmount = ethers.parseUnits("50", "ether");

      await expect(harmonyBridge.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(harmonyBridge, "Deposit")
        .withArgs(addr1.address, depositAmount);
    });
  });
});
