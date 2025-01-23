import { artifacts, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

export const compileContract = async (contractCode: string, contractName: string): Promise<any> => {
    const contractPath = path.join(__dirname, "../../contracts", `${contractName}.sol`);

    fs.mkdirSync(path.dirname(contractPath), { recursive: true });

    fs.writeFileSync(contractPath, contractCode);
    try {
        console.log("Running Hardhat compile...");
        await run("compile");
    } catch (error: any) {
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
        return { error: error.message };
    }
    try {
        const contractArtifact = await artifacts.readArtifact(contractName);
        return { abi: contractArtifact.abi, bytecode: contractArtifact.bytecode };
    } catch (error: any) {
        console.error("Error reading contract artifact:", error.message);
    } finally {
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
    }
};
