import { artifacts, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export const compileContract = async (contractCode: string, contractName: string): Promise<any> => {
    const contractPath = path.join(__dirname, "../../contracts", `${contractName}.sol`);

    try {
        fs.mkdirSync(path.dirname(contractPath), { recursive: true });
        fs.writeFileSync(contractPath, contractCode);

        execSync("npx cross-env FORCE_COLOR=1 hardhat compile", {
            encoding: "utf-8",
            stdio: "pipe"
        });

        const contractArtifact = await artifacts.readArtifact(contractName);
        return { abi: contractArtifact.abi, bytecode: contractArtifact.bytecode };

    } catch (error: any) {
        const errorMessage = error.stderr?.toString() || error.stdout?.toString() || error.message;
        console.log("compileContract error", errorMessage);
        return {
            error: errorMessage,
        };
    } finally {
        execSync("npx hardhat clean")

        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
    }
};
