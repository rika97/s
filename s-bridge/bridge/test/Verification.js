const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Verification contract", function () {
    async function deployVerifcationFixture() {
        const [owner, addr1, trustedSigner] = await ethers.getSigners();
        const Verification = await ethers.getContractFactory("Verification");
        const verification = await Verification.deploy(trustedSigner.address);
        await verification.waitForDeployment();

        return { verification, owner, addr1, trustedSigner };
    }

    async function createSignature(signer, types, values) {
        const msgHash = ethers.solidityPackedKeccak256(types, values);
        return await signer.signMessage(ethers.toBeArray(msgHash));
    }

    describe("setTrustedSigner", function () {
        it("Should have the right trustedSigner", async function () {
            const { verification, trustedSigner } = await deployVerifcationFixture();
            expect(await verification.trustedSigner()).to.equal(trustedSigner.address);
        })

        it("Should allow the owner to change the trustedSigner", async function () {
            const { verification, owner, addr1 } = await deployVerifcationFixture();
            await verification.connect(owner).setTrustedSigner(addr1.address);
            expect(await verification.trustedSigner()).to.equal(addr1.address);
        });

        it("Should prevent non-owners from changing the trustedSigner", async function () {
            const { verification, addr1, addr2 } = await deployVerifcationFixture();
            await expect(verification.connect(addr1).setTrustedSigner(addr1.address))
                .to.be.revertedWith("Caller is not the owner");
        });
    });

    describe("validSignature", function () {
        it("Should return true when trustedSigner signs", async function () {
            const { verification, owner, trustedSigner } = await deployVerifcationFixture();

            const withdrawAmount = ethers.parseUnits("50", "ether");
            const signature = await createSignature(
                trustedSigner, 
                ["address", "uint256"],
                [owner.address, withdrawAmount]
            );

            expect(await verification.verifySignature(owner.address, withdrawAmount, signature))
                .to.equal(true);
        });

        it("Should return false when non trustedSigner signs", async function () {
            const { verification, owner, addr1, trustedSigner } = await deployVerifcationFixture();

            const withdrawAmount = ethers.parseUnits("50", "ether");            
            const signature = await createSignature(
                addr1,
                ["address", "uint256"],
                [owner.address, withdrawAmount]
            );

            expect(await verification.verifySignature(owner.address, withdrawAmount, signature))
                .to.equal(false);
        });
    });
});