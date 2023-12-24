const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bridge contract", function () {
  async function deployBridgeFixture() {
    const [owner, addr1, addr2, trustedSigner] = await ethers.getSigners();
    const Bridge = await ethers.getContractFactory("Bridge");
    const bridge = await Bridge.deploy(trustedSigner.address);
    await bridge.waitForDeployment();

    // fund contract
    const setupAmount = ethers.parseUnits("100", "ether");
    await owner.sendTransaction({
      to: await bridge.getAddress(),
      value: setupAmount,
    });

    return { bridge, owner, addr1, addr2, trustedSigner };
  }
  
  async function createSignature(signer, types, values) {
    const msgHash = ethers.solidityPackedKeccak256(types, values);
    return await signer.signMessage(ethers.toBeArray(msgHash));
  }

  describe("deposit", function () {
    it("Should deposit Ether", async function () {
      const { bridge, addr1 } = await deployBridgeFixture();

      const depositAmount = ethers.parseUnits("10", "ether");
      
      await expect(() => bridge.connect(addr1).deposit({ value: depositAmount }))
        .to.changeEtherBalances([addr1, bridge], [-depositAmount, depositAmount]);
    });
  
    it("Should emit Deposit event", async function () {
      const { bridge, addr1 } = await deployBridgeFixture();
      const depositAmount = ethers.parseUnits("50", "ether");

      await expect(bridge.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(bridge, "Deposit")
        .withArgs(addr1.address, depositAmount);
    });
  });

  describe("withdraw", function () {
    it("Should withdraw with valid signature", async function () {
      const { bridge, addr1, trustedSigner } = await deployBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(bridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.changeEtherBalances([addr1, bridge], [withdrawAmount, -withdrawAmount]);
    });

    it("Should revert for invalid signature", async function () {
      const { bridge, owner, addr1 } = await deployBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        owner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(bridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.be.revertedWith("Invalid signature");
    })

    it("Should revert if withdraw amount exceeds contract liquidity", async function () {
      const { bridge, addr1, trustedSigner } = await deployBridgeFixture();

      const withdrawAmount = ethers.parseUnits("200", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(bridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.be.revertedWith("Not enough liquidity");
    });

    it("Should emit Withdrawl event", async function () {
      const { bridge, addr1, trustedSigner } = await deployBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      const signature = await createSignature(
        trustedSigner,
        ["address", "uint256"],
        [addr1.address, withdrawAmount]
      );

      await expect(bridge.withdraw(addr1.address, withdrawAmount, signature))
        .to.emit(bridge, "Withdraw")
        .withArgs(addr1.address, withdrawAmount);
    });
  });
});