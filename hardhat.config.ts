import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"
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
    }
};

export default config;
