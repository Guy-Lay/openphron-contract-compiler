import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.16", // Match this to the version in your contract
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },

        },
    },
    networks: {
        holesky: {
            url: process.env.HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ['34d422f7eab0674c2ae586c0d51143044f19f4aaed3d529555a76fa54a03b0a2'],
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ['34d422f7eab0674c2ae586c0d51143044f19f4aaed3d529555a76fa54a03b0a2'],
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "IZ6IV542IC2VDQ9XWHAAA6ICC7GKBZEXJ4",
        customChains: [
            {
                network: "holesky",
                chainId: 17000,
                urls: {
                    apiURL: "https://api-holesky.etherscan.io/api",
                    browserURL: "https://holesky.etherscan.io",
                },
            },
            {
                network: "arbitrum",
                chainId: 421613,
                urls: {
                    apiURL: "https://api-goerli.arbiscan.io/api",
                    browserURL: "https://goerli.arbiscan.io",
                },
            }
        ],
    },
};

export default config;
