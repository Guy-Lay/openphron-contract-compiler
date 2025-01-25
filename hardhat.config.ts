import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20", // Match this to the version in your contract
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    typechain: {
        outDir: "typechain-types",  // Directory for generated TypeChain types
        target: "ethers-v5",        // Ensure this matches your ethers version
      },
    paths: {
        sources: "./contracts",  // Default path for contracts
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
