const { expect } = require("chai");
const { ethers } = require("hardhat");

const EthPrefix = "\x19Ethereum Signed Message:\n32";

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

  describe("setTrustedSigner", function () {
    it("Should have the right trustedSigner", async function () {
      const {arbitrumBridge, trustedSigner } = await deployArbitrumBridgeFixture();
      expect(await arbitrumBridge.trustedSigner()).to.equal(trustedSigner.address);
    })

    it("Should allow the owner to change the trustedSigner", async function () {
        const { arbitrumBridge, owner, addr1 } = await deployArbitrumBridgeFixture();
        await arbitrumBridge.connect(owner).setTrustedSigner(addr1.address);
        expect(await arbitrumBridge.trustedSigner()).to.equal(addr1.address);
    });

    it("Should prevent non-owners from changing the trustedSigner", async function () {
        const { arbitrumBridge, addr1, addr2 } = await deployArbitrumBridgeFixture();
        await expect(arbitrumBridge.connect(addr1).setTrustedSigner(addr2.address))
            .to.be.revertedWith("Caller is not the owner");
    });
  });

  describe("withdraw", function () {
    it("Should withdraw Ether to the caller", async function () {
      const { arbitrumBridge, addr1, trustedSigner } = await deployArbitrumBridgeFixture();

      console.log("JS TEST");
      console.log("TrustedSigner: ", trustedSigner.address);
      
      const withdrawAmount = ethers.parseUnits("10", "ether");
      const msgHash = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, withdrawAmount]);
      // const ethSignedHash = ethers.solidityPackedKeccak256(["string", "bytes32"], ["\x19Ethereum Signed Message:\n32", msgHash]);
      
      
      const ethSignedHash = ethers.hashMessage(ethers.getBytes(msgHash));
      console.log("ETH Signed Hash: ", ethSignedHash); // ETH SIGNED HASH IS THE SAME

      const signature = await trustedSigner.signMessage(ethSignedHash);
      console.log("Signature: ", signature);
      const signInstance = ethers.Signature.from(signature);
      console.log("R: ", signInstance.r);
      console.log("S: ", signInstance.s);
      console.log("V: ", signInstance.v);

      // const recoveredAddress = ethers.verifyMessage(ethSignedHash, signature);
      // console.log("Recovered Address: ", recoveredAddress);

      // if (recoveredAddress.toLowerCase() === trustedSigner.address.toLowerCase()) {
      //   console.log("Signature verification successful.");
      // } else {
      //   console.log("Signature verification failed.");
      // }

      // // TODO: possibly just append addr1.address and withdrawAmount as a string and pass in the message into hashMessage
      // // https://docs.ethers.org/v6/api/hashing/#hashMessage
      // const msgHash = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, withdrawAmount]); // DataHexString
      // // const msgHash = ethers.concat()
      // const ethSignedHash = ethers.hashMessage(ethers.getBytes(msgHash));
      // // https://docs.ethers.org/v6/api/providers/#Signer-signMessage
      // const signature = await trustedSigner.signMessage(ethSignedHash);

      await expect(() => arbitrumBridge.connect(trustedSigner).withdraw(addr1.address, withdrawAmount, signature))
        .to.changeEtherBalances([arbitrumBridge, addr1], [-withdrawAmount, withdrawAmount]);
    })

    it("Should emit Withdrawl event", async function () {
      const { arbitrumBridge, addr1 } = await deployArbitrumBridgeFixture();

      const withdrawAmount = ethers.parseUnits("10", "ether");
      await expect(arbitrumBridge.connect(addr1).withdraw(withdrawAmount))
        .to.emit(arbitrumBridge, "Withdraw")
        .withArgs(addr1.address, withdrawAmount);
    })
  })
});