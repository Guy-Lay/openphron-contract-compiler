import { artifacts, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

export const compileContract = async (contractCode: string, contractName: string): Promise<{ abi: any; bytecode: string }> => {
    const contractPath = path.join(__dirname, "../../contracts", `${contractName}.sol`);
    
    fs.mkdirSync(path.dirname(contractPath), { recursive: true });
    
    fs.writeFileSync(contractPath, contractCode);

    try {
        console.log("Running Hardhat compile...");
        await run("compile");
    } catch (error: any) {
        throw new Error(`Error during compilation: ${error.message}`);
    }

    try {
        const contractArtifact = await artifacts.readArtifact(contractName);
        return { abi: contractArtifact.abi, bytecode: contractArtifact.bytecode };
    } catch (error) {
        throw new Error(`Artifact for contract "${contractName}" not found. Ensure the contract is compiled and the contract name matches.`);
    }
};
