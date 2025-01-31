import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat";

const config: HardhatUserConfig = {
    solidity: {
        // version: "0.8.16", // Match this to the version in your contract
        compilers: [
            {version: "0.8.16", settings: {optimizer: {enabled: true, runs: 200}, viaIR: true}},
            {version: "0.8.17", settings: {optimizer: {enabled: true, runs: 200}, viaIR: true}},
            {version: "0.8.19", settings: {optimizer: {enabled: true, runs: 200}, viaIR: true}},
            {version: "0.8.20", settings: {optimizer: {enabled: true, runs: 200}, viaIR: true}},
        ],
    }   
};

export default config;
