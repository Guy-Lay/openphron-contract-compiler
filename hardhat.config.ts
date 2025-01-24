import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers"

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
    paths: {
        sources: "./contracts",  // Default path for contracts
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
