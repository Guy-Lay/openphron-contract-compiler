import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.16", // Match this to the version in your contract
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    }
};

export default config;
