require("@nomicfoundation/hardhat-toolbox");
import * as dotenv from "dotenv";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
    testnet: {
      url: process.env.HARMONY_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};
