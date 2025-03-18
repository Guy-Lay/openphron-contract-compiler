import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import networks from "./networks.json";
import { promisify } from "util";
import { makeNewCode } from "./writeCode";
import { clearContract, extractContractName } from ".";
import { run, artifacts } from "hardhat";

const execAsync = promisify(exec);
export const verifyContract = async (contractAddress: string, constructorArguments: any[], chainId: number, contractCode: string): Promise<any> => {
    const contractName = await extractContractName(contractCode);
    const contractPath = await makeNewCode(contractCode, contractName, "contracts");
    if (!contractPath) return {
        status: 'error',
        message: "Contract code is not valid!"
    };

    try {
        const networkName = networks.find(network => network.id === chainId)?.name;
        if (!networkName) {
            throw new Error("ChainId Invalid!");
        }
        const { stdout, stderr } = await execAsync(`npx hardhat verify --network ${networkName} ${contractAddress} ${constructorArguments.join(" ")}`);
        if (stderr) {
            throw new Error(`${stderr}`);
        }
        if (stderr) throw new Error(`${stderr}`);
        console.log(`Verification Output: ${stdout}`);
        return {
            status: 'success', url: `https://${networkName}.etherscan.io/address/${contractAddress}#code`
        };
    } catch (error: any) {
        console.log("❌ Verification failed:", error.message);
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("✅ Contract is already verified.");
            return {
                status: 'warning',
                message: "Contract is already verified."
            };
        }
        return {
            status: 'error',
            message: "Contract verification failed!"
        };
    } finally {
        clearContract(contractPath);
    }
};

export default verifyContract;